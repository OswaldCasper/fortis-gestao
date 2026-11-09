/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * AuthContext: Autenticação oficial Supabase (PostgreSQL + Auth + RLS),
 * isolamento multi-tenant por membros_organizacao e simulação de perfil segura
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Pessoa, MembroOrganizacao, Organizacao, PapelAcesso } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dataService } from '../services/dataService';
import { mapDbToOrganizacao, mapDbToPessoa, mapDbToMembro } from '../services/mappers';

interface AuthContextType {
  currentUser: Pessoa;
  currentMember: MembroOrganizacao;
  currentOrg: Organizacao;
  activeRole: PapelAcesso;
  simulatedRole: PapelAcesso | null;
  isPlatformAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasNoOrgAccess: boolean;
  isSupabaseReady: boolean;
  userOrganizations: Organizacao[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, password: string, nomeCompleto: string) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  simulateRole: (role: PapelAcesso | null) => void;
  setActiveOrganization: (orgId: string) => Promise<void>;
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
  const activeOrgId = dataService.getActiveOrgId();

  const [currentOrg, setCurrentOrg] = useState<Organizacao>(() =>
    dataService.getOrganization(activeOrgId)
  );

  const [currentUser, setCurrentUser] = useState<Pessoa>(() => {
    const users = dataService.getPeople(activeOrgId);
    return (
      users[0] || {
        id: 'c0000000-0000-4000-8000-000000000001',
        nomeCompleto: 'Oseias Gaspar',
        email: 'oseiasgaspar96@gmail.com',
        telefone: '923000001',
        genero: 'masculino',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }
    );
  });

  const [currentMember, setCurrentMember] = useState<MembroOrganizacao>(() => {
    const members = dataService.getMembers(activeOrgId);
    return (
      members[0] || {
        id: `mem_${activeOrgId}_001`,
        empresaId: activeOrgId,
        pessoaId: 'c0000000-0000-4000-8000-000000000001',
        papelAcesso: 'superadmin_org',
        papeis: ['superadmin_org'],
        funcoesProfissionais: ['SuperAdmin da Organização'],
        departamentoOuEmpresaOrigem: 'Direção Geral',
        cargo: 'SuperAdmin Organizacional',
        estadoMembro: 'ativo',
        restringirAcessoHorario: false,
        criadoEm: new Date().toISOString(),
      }
    );
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(false);
  const [simulatedRole, setSimulatedRole] = useState<PapelAcesso | null>(null);
  const [hasNoOrgAccess, setHasNoOrgAccess] = useState<boolean>(false);
  const [userOrganizations, setUserOrganizations] = useState<Organizacao[]>([]);
  const [availableUsers, setAvailableUsers] = useState<(Pessoa & { membro?: MembroOrganizacao })[]>(() =>
    dataService.getPeople(activeOrgId)
  );

  // Carrega e sincroniza o utilizador autenticado a partir do Supabase
  const loadSupabaseSession = useCallback(async (authUser: any) => {
    if (!authUser) {
      setIsAuthenticated(false);
      setHasNoOrgAccess(false);
      setIsPlatformAdmin(false);
      setSimulatedRole(null);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Verifica privilégio global de SuperAdmin da Plataforma via RPC confiável
      let isGlobalAdmin = false;
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('e_superadmin_global');
        if (!rpcErr && rpcRes === true) {
          isGlobalAdmin = true;
        }
      } catch (e) {
        console.warn('RPC e_superadmin_global indisponível:', e);
      }
      setIsPlatformAdmin(isGlobalAdmin);

      // 2. Resolve registo em 'pessoas' através do auth_user_id ou email
      let resolvedPessoa: Pessoa | null = null;
      try {
        const { data: pData } = await supabase
          .from('pessoas')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .maybeSingle();

        if (pData) {
          resolvedPessoa = mapDbToPessoa(pData);
        } else if (authUser.email) {
          const { data: pEmailData } = await supabase
            .from('pessoas')
            .select('*')
            .eq('email', authUser.email)
            .maybeSingle();
          if (pEmailData) {
            resolvedPessoa = mapDbToPessoa(pEmailData);
          }
        }
      } catch (pErr) {
        console.warn('Erro ao consultar pessoas:', pErr);
      }

      if (!resolvedPessoa) {
        resolvedPessoa = {
          id: authUser.id,
          authUid: authUser.id,
          nomeCompleto:
            authUser.user_metadata?.nome_completo ||
            (authUser.email ? authUser.email.split('@')[0] : 'Utilizador'),
          email: authUser.email || '',
          telefone: '',
          genero: 'masculino',
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        };
      }
      setCurrentUser(resolvedPessoa);

      // 3. Resolve associações activas em 'membros_organizacao'
      let activeMembros: MembroOrganizacao[] = [];
      try {
        const { data: mRows } = await supabase
          .from('membros_organizacao')
          .select('*')
          .eq('pessoa_id', resolvedPessoa.id)
          .eq('estado', 'ativo');

        if (mRows && mRows.length > 0) {
          activeMembros = mRows.map(mapDbToMembro);
        }
      } catch (mErr) {
        console.warn('Erro ao consultar membros_organizacao:', mErr);
      }

      // 4. Resolve organizações
      let loadedOrgs: Organizacao[] = [];
      if (activeMembros.length > 0) {
        const orgIds = activeMembros.map(m => m.empresaId);
        try {
          const { data: orgRows } = await supabase
            .from('organizacoes')
            .select('*')
            .in('id', orgIds);
          if (orgRows && orgRows.length > 0) {
            loadedOrgs = orgRows.map(mapDbToOrganizacao);
          }
        } catch (orgErr) {
          console.warn('Erro ao consultar organizacoes:', orgErr);
        }
      } else if (isGlobalAdmin) {
        // SuperAdmin da Plataforma tem acesso global para suporte
        try {
          const { data: allOrgs } = await supabase
            .from('organizacoes')
            .select('*')
            .limit(20);
          if (allOrgs && allOrgs.length > 0) {
            loadedOrgs = allOrgs.map(mapDbToOrganizacao);
          }
        } catch (allErr) {
          console.warn('Erro ao carregar organizações para superadmin:', allErr);
        }
      }

      setUserOrganizations(loadedOrgs);

      // 5. Se não pertencer a nenhuma organização e não for SuperAdmin Global, bloqueia
      if (activeMembros.length === 0 && !isGlobalAdmin) {
        setHasNoOrgAccess(true);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      setHasNoOrgAccess(false);

      // 6. Determina a organização activa
      const savedOrgId = localStorage.getItem('fortis_active_org_id');
      let targetOrg = loadedOrgs.find(o => o.id === savedOrgId) || loadedOrgs[0];

      if (!targetOrg) {
        targetOrg = dataService.getOrganization(dataService.getActiveOrgId());
      }

      setCurrentOrg(targetOrg);
      dataService.setActiveOrg(targetOrg.id);

      // 7. Determina o membro correspondente
      let targetMember = activeMembros.find(m => m.empresaId === targetOrg.id);
      if (!targetMember) {
        if (isGlobalAdmin) {
          targetMember = {
            id: `admin_${targetOrg.id}`,
            empresaId: targetOrg.id,
            pessoaId: resolvedPessoa.id,
            papeis: ['superadmin_plataforma'],
            papelAcesso: 'superadmin_plataforma',
            estadoMembro: 'ativo',
            funcoesProfissionais: ['SuperAdmin Global'],
            departamentoOuEmpresaOrigem: 'Plataforma',
            cargo: 'Administrador da Plataforma',
            restringirAcessoHorario: false,
            criadoEm: new Date().toISOString(),
          };
        } else {
          targetMember = {
            id: `mem_${resolvedPessoa.id}`,
            empresaId: targetOrg.id,
            pessoaId: resolvedPessoa.id,
            papeis: ['formando'],
            papelAcesso: 'formando',
            estadoMembro: 'ativo',
            funcoesProfissionais: ['Formando'],
            departamentoOuEmpresaOrigem: 'Geral',
            cargo: 'Formando',
            restringirAcessoHorario: false,
            criadoEm: new Date().toISOString(),
          };
        }
      }

      setCurrentMember(targetMember);
      setIsAuthenticated(true);

      // 8. Hidrata o DataService com os dados reais do Supabase para esta organização
      await dataService.hydrate(targetOrg.id);
    } catch (err) {
      console.error('Erro na inicialização da sessão:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Monitorização de autenticação via Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Se o Supabase não estiver configurado nas variáveis de ambiente, mantém modo offline/demo
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        if (session?.user) {
          loadSupabaseSession(session.user);
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    });

    // Escutar eventos de alteração de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        await loadSupabaseSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        dataService.clearSession();
        setIsAuthenticated(false);
        setSimulatedRole(null);
        setHasNoOrgAccess(false);
        setUserOrganizations([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadSupabaseSession]);

  // Sincronizar availableUsers a partir do dataService quando houver atualizações
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setAvailableUsers(dataService.getPeople(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  // Alternar organização activa (para utilizadores multiempresa)
  const setActiveOrganization = async (orgId: string) => {
    const org = userOrganizations.find(o => o.id === orgId);
    if (!org) return;

    localStorage.setItem('fortis_active_org_id', org.id);
    setCurrentOrg(org);
    dataService.setActiveOrg(org.id);

    // Actualiza o membro correspondente
    const members = dataService.getMembers(org.id);
    const m = members.find(mem => mem.pessoaId === currentUser.id);
    if (m) {
      setCurrentMember(m);
    }

    await dataService.hydrate(org.id);
  };

  // Login com email e palavra-passe (mínimo 8 caracteres)
  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!email || !password) {
      return { ok: false, error: 'Por favor preencha o email e a palavra-passe.' };
    }
    if (password.length < 8) {
      return { ok: false, error: 'A palavra-passe deve conter pelo menos 8 caracteres.' };
    }

    if (!isSupabaseConfigured) {
      // Modo local de contingência caso Supabase não esteja configurado
      const users = dataService.getPeople(dataService.getActiveOrgId());
      const target = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || users[0];
      if (target) {
        setCurrentUser(target);
        setIsAuthenticated(true);
        return { ok: true };
      }
      return { ok: false, error: 'Supabase não está configurado e utilizador demo não encontrado.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      if (data.user) {
        await loadSupabaseSession(data.user);
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Erro inesperado ao iniciar sessão.' };
    }
  };

  // Registo de novo utilizador (Primeiro Acesso)
  const signUp = async (
    email: string,
    password: string,
    nomeCompleto: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!email || !password || !nomeCompleto) {
      return { ok: false, error: 'Todos os campos são obrigatórios.' };
    }
    if (password.length < 8) {
      return { ok: false, error: 'A palavra-passe deve conter pelo menos 8 caracteres.' };
    }

    if (!isSupabaseConfigured) {
      return {
        ok: false,
        error: 'Configure as variáveis do Supabase no ficheiro de ambiente para registar contas.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nome_completo: nomeCompleto.trim(),
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      if (data.session?.user) {
        await loadSupabaseSession(data.session.user);
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Erro ao criar conta.' };
    }
  };

  // Recuperação de palavra-passe
  const resetPassword = async (email: string): Promise<{ ok: boolean; error?: string }> => {
    if (!email) {
      return { ok: false, error: 'Indique o email da conta a recuperar.' };
    }

    if (!isSupabaseConfigured) {
      return {
        ok: false,
        error: 'Configure as variáveis do Supabase para enviar emails de recuperação.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Erro ao solicitar recuperação.' };
    }
  };

  // Encerramento de sessão
  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Erro ao encerrar sessão Supabase:', e);
      }
    }
    dataService.clearSession();
    setIsAuthenticated(false);
    setSimulatedRole(null);
    setHasNoOrgAccess(false);
  };

  // Simulação de papel: permitida EXCLUSIVAMENTE ao SuperAdmin da Plataforma
  const simulateRole = (role: PapelAcesso | null) => {
    if (!isPlatformAdmin) {
      console.warn('A simulação de perfil é reservada ao SuperAdmin da Plataforma.');
      return;
    }
    setSimulatedRole(role);
  };

  // Papel real derivado do membro activo
  const realRole: PapelAcesso = currentMember.papelAcesso || 'formando';

  // Papel activo na interface (apenas SuperAdmin da Plataforma pode simular)
  const activeRole: PapelAcesso = isPlatformAdmin && simulatedRole ? simulatedRole : realRole;

  // Verificador RBAC
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
        simulatedRole,
        isPlatformAdmin,
        isAuthenticated,
        isLoading,
        hasNoOrgAccess,
        isSupabaseReady: isSupabaseConfigured,
        userOrganizations,
        login,
        signUp,
        resetPassword,
        logout,
        simulateRole,
        setActiveOrganization,
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
