/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * AuthContext: Gestão de identidade, autenticação multi-tenant e controlo de acesso baseado em papéis (RBAC)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pessoa, MembroOrganizacao, Organizacao, PapelAcesso } from '../types';
import { dataService } from '../services/dataService';
import { DEMO_ORG_ID } from '../services/dataStore';

interface AuthContextType {
  currentUser: Pessoa;
  currentMember: MembroOrganizacao;
  currentOrg: Organizacao;
  activeRole: PapelAcesso;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => boolean;
  logout: () => void;
  switchUser: (pessoaId: string) => void;
  availableUsers: (Pessoa & { membro?: MembroOrganizacao })[];
  hasRole: (roles: PapelAcesso[]) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  isFormador: boolean;
  isFormando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState(() => dataService.getPeople(DEMO_ORG_ID));
  const [currentOrg, setCurrentOrg] = useState(() => dataService.getOrganization(DEMO_ORG_ID));

  // Utilizador inicial padrão: Oseias Gaspar (SuperAdmin da Organização)
  const [currentUser, setCurrentUser] = useState<Pessoa>(() => {
    const savedId = localStorage.getItem('fortis_active_user_id');
    const users = dataService.getPeople(DEMO_ORG_ID);
    const found = users.find(u => u.id === savedId);
    return found || users[0] || ({ id: 'pes-oseias', nomeCompleto: 'Oseias Gaspar', email: 'oseiasgaspar96@gmail.com' } as Pessoa);
  });

  const [currentMember, setCurrentMember] = useState<MembroOrganizacao>(() => {
    const members = dataService.getMembers(DEMO_ORG_ID);
    const m = members.find(mem => mem.pessoaId === currentUser.id);
    return m || members[0] || ({
      id: `${currentUser.id}_${DEMO_ORG_ID}`,
      empresaId: DEMO_ORG_ID,
      pessoaId: currentUser.id,
      papelAcesso: 'superadmin_org',
      estadoMembro: 'ativo',
    } as MembroOrganizacao);
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fortis_auth_token') !== 'false';
  });

  // Atualizar membros caso a base de dados mude
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      const users = dataService.getPeople(DEMO_ORG_ID);
      setAvailableUsers(users);
      setCurrentOrg(dataService.getOrganization(DEMO_ORG_ID));

      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
      const members = dataService.getMembers(DEMO_ORG_ID);
      const m = members.find(mem => mem.pessoaId === currentUser.id);
      if (m) {
        setCurrentMember(m);
      }
    });
    return unsub;
  }, [currentUser.id]);

  const switchUser = (pessoaId: string) => {
    const users = dataService.getPeople(DEMO_ORG_ID);
    const target = users.find(u => u.id === pessoaId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('fortis_active_user_id', target.id);
      const members = dataService.getMembers(DEMO_ORG_ID);
      const m = members.find(mem => mem.pessoaId === target.id);
      if (m) {
        setCurrentMember(m);
      } else {
        // Fallback para formando caso não tenha membro explícito
        setCurrentMember({
          id: `${target.id}_${DEMO_ORG_ID}`,
          empresaId: DEMO_ORG_ID,
          pessoaId: target.id,
          papelAcesso: 'formando',
          funcoesProfissionais: ['Formando'],
          departamentoOuEmpresaOrigem: 'Geral',
          cargo: 'Formando',
          estadoMembro: 'ativo',
          restringirAcessoHorario: false,
          criadoEm: new Date().toISOString(),
        });
      }
      setIsAuthenticated(true);
      localStorage.setItem('fortis_auth_token', 'true');
    }
  };

  const login = (email: string, pin: string): boolean => {
    // PIN de demonstração padrão (qualquer número com 4 a 6 dígitos ou 199822 do screenshot)
    if (!pin || pin.length < 4) return false;
    const users = dataService.getPeople(DEMO_ORG_ID);
    const target = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (target) {
      switchUser(target.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('fortis_auth_token', 'false');
  };

  const activeRole: PapelAcesso = currentMember.papelAcesso || 'formando';

  const hasRole = (allowedRoles: PapelAcesso[]): boolean => {
    if (activeRole === 'superadmin_plataforma' || activeRole === 'superadmin_org') return true;
    return allowedRoles.includes(activeRole);
  };

  const isSuperAdmin = activeRole === 'superadmin_plataforma' || activeRole === 'superadmin_org';
  const isAdmin = isSuperAdmin || activeRole === 'admin';
  const isGestor = isAdmin || activeRole === 'gestor';
  const isFormador = activeRole === 'formador';
  const isFormando = activeRole === 'formando';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentMember,
        currentOrg,
        activeRole,
        isAuthenticated,
        login,
        logout,
        switchUser,
        availableUsers,
        hasRole,
        isSuperAdmin,
        isAdmin,
        isGestor,
        isFormador,
        isFormando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
