/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * PeopleView: Gestão centralizada da tabela PESSOAS e afiliações na organização (image 3)
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Edit,
  Trash2,
  Building,
  GraduationCap,
  Briefcase,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Pessoa, PapelAcesso } from '../../types';

export const PeopleView: React.FC = () => {
  const { currentUser, currentOrg, hasRole } = useAuth();
  const [people, setPeople] = useState(() => dataService.getPeople(currentOrg.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPersonForm, setNewPersonForm] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    genero: 'masculino' as Pessoa['genero'],
    papelAcesso: 'formando' as PapelAcesso,
    cargo: '',
    departamento: '',
  });

  React.useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setPeople(dataService.getPeople(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const matchSearch = p.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefone.includes(searchTerm);
      const matchRole = roleFilter === 'todos' || (p.membro?.papelAcesso === roleFilter);
      return matchSearch && matchRole;
    });
  }, [people, searchTerm, roleFilter]);

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `pes-${Date.now()}`;
    const novaPessoa: Pessoa = {
      id,
      nomeCompleto: newPersonForm.nomeCompleto,
      email: newPersonForm.email,
      telefone: newPersonForm.telefone,
      genero: newPersonForm.genero,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const novoMembro = {
      id: `${id}_${currentOrg.id}`,
      empresaId: currentOrg.id,
      pessoaId: id,
      papelAcesso: newPersonForm.papelAcesso,
      funcoesProfissionais: [newPersonForm.cargo || 'Colaborador'],
      departamentoOuEmpresaOrigem: newPersonForm.departamento || 'Geral',
      cargo: newPersonForm.cargo || 'Colaborador',
      estadoMembro: 'ativo' as const,
      restringirAcessoHorario: false,
      criadoEm: new Date().toISOString(),
    };

    (dataService as any).db.pessoas.push(novaPessoa);
    (dataService as any).db.membros.push(novoMembro);
    (dataService as any).persist();

    setShowAddModal(false);
    setNewPersonForm({
      nomeCompleto: '',
      email: '',
      telefone: '',
      genero: 'masculino',
      papelAcesso: 'formando',
      cargo: '',
      departamento: '',
    });
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Pessoas e Identidades ({people.length})</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Diretório centralizado de utilizadores, colaboradores, formadores e formandos
          </p>
        </div>

        {hasRole(['superadmin_org', 'admin', 'gestor']) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm hover:opacity-95 flex items-center gap-1.5 shrink-0"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            <Plus size={14} />
            <span>Adicionar Pessoa</span>
          </button>
        )}
      </div>

      {/* Barra de Pesquisa e Filtros Rápidos (Matching image 3) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Procurar Pessoas por nome, email ou telefone..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'admin', label: 'Admins' },
            { id: 'gestor', label: 'Gestores' },
            { id: 'formador', label: 'Formadores' },
            { id: 'formando', label: 'Formandos' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === f.id
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pessoas (Fiel ao AppSheet image 3) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {filteredPeople.map(p => (
          <div
            key={p.id}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                style={{ backgroundColor: 'var(--fortis-primary)' }}
              >
                {p.nomeCompleto.charAt(0)}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {p.nomeCompleto}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                  {p.genero} · {p.membro?.cargo || 'Colaborador'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {p.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                {p.telefone}
              </span>

              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                <a
                  href={`tel:${p.telefone}`}
                  title="Ligar"
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Phone size={14} />
                </a>
                <a
                  href={`mailto:${p.email}`}
                  title="Enviar Email"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Mail size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar Pessoa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Adicionar Nova Pessoa</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newPersonForm.nomeCompleto}
                  onChange={e => setNewPersonForm(f => ({ ...f, nomeCompleto: e.target.value }))}
                  placeholder="Ex: João Baptista da Silva"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newPersonForm.email}
                    onChange={e => setNewPersonForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="joao@empresa.com"
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                  <input
                    type="tel"
                    required
                    value={newPersonForm.telefone}
                    onChange={e => setNewPersonForm(f => ({ ...f, telefone: e.target.value }))}
                    placeholder="923 000 000"
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Papel de Acesso</label>
                  <select
                    value={newPersonForm.papelAcesso}
                    onChange={e => setNewPersonForm(f => ({ ...f, papelAcesso: e.target.value as any }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="formando">Formando</option>
                    <option value="formador">Formador</option>
                    <option value="gestor">Gestor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={newPersonForm.cargo}
                    onChange={e => setNewPersonForm(f => ({ ...f, cargo: e.target.value }))}
                    placeholder="Ex: Engenheiro de Produção"
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-amber-600 hover:bg-amber-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
