/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * Sidebar: Barra lateral de navegação modular responsiva (Desktop, Tablet e Mobile Drawer)
 * com identidade dinâmica da empresa cliente e indicador de seleção retilíneo
 */

import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  FileSpreadsheet,
  GraduationCap,
  Users,
  CalendarCheck,
  Award,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  FolderArchive,
  MessageSquare,
  BarChart3,
  History,
  Building2,
  Palette,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ActiveModule =
  | 'dashboard'
  | 'cursos'
  | 'tarefas'
  | 'formacoes'
  | 'formadores'
  | 'formandos'
  | 'presencas'
  | 'avaliacoes'
  | 'certificados'
  | 'qualidade'
  | 'financeiro'
  | 'documentos'
  | 'mensagens'
  | 'relatorios'
  | 'auditoria'
  | 'empresa'
  | 'aparencia'
  | 'perfil';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenLoginModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { currentUser, currentOrg, activeRole, switchUser, availableUsers, logout } = useAuth();

  // Fechar o menu móvel através da tecla Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin_plataforma': return 'SuperAdmin Global';
      case 'superadmin_org': return 'SuperAdmin Org';
      case 'admin': return 'Administrador';
      case 'gestor': return 'Gestor';
      case 'formador': return 'Formador';
      case 'formando': return 'Formando';
      default: return role;
    }
  };

  const navGroups = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard' as ActiveModule, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'formacoes' as ActiveModule, label: 'Formações (Catálogo)', icon: FileSpreadsheet },
        { id: 'cursos' as ActiveModule, label: 'Cursos (Agendamentos)', icon: BookOpen },
        { id: 'tarefas' as ActiveModule, label: 'Tarefas / Checklist', icon: CheckSquare },
        { id: 'perfil' as ActiveModule, label: 'Perfil do Utilizador', icon: User },
      ],
    },
    {
      title: 'Formação & Pessoas',
      items: [
        { id: 'formadores' as ActiveModule, label: 'Formadores', icon: GraduationCap },
        { id: 'formandos' as ActiveModule, label: 'Formandos & Inscrições', icon: Users },
        { id: 'presencas' as ActiveModule, label: 'Presenças & Pauta', icon: CalendarCheck },
        { id: 'avaliacoes' as ActiveModule, label: 'Avaliações', icon: Award },
        { id: 'certificados' as ActiveModule, label: 'Certificados', icon: ShieldCheck },
      ],
    },
    {
      title: 'Qualidade & Gestão',
      items: [
        { id: 'qualidade' as ActiveModule, label: 'Ocorrências (ISO 9001)', icon: AlertTriangle },
        { id: 'financeiro' as ActiveModule, label: 'Financeiro & Orçamento', icon: Wallet },
        { id: 'documentos' as ActiveModule, label: 'Documentos', icon: FolderArchive },
        { id: 'mensagens' as ActiveModule, label: 'Mensagens', icon: MessageSquare },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { id: 'relatorios' as ActiveModule, label: 'Relatórios & Exportação', icon: BarChart3 },
        { id: 'auditoria' as ActiveModule, label: 'Histórico de Auditoria', icon: History },
        { id: 'empresa' as ActiveModule, label: 'Dados da Empresa', icon: Building2 },
        { id: 'aparencia' as ActiveModule, label: 'Aparência & Cores', icon: Palette },
      ],
    },
  ];

  // Identidade Visual Dinâmica da Empresa Cliente
  const renderCompanyIdentity = (collapsed: boolean) => {
    if (collapsed) {
      return (
        <div className="flex items-center justify-center w-full py-1" title={currentOrg.designacao}>
          {currentOrg.temaConfig?.logoUrl ? (
            <img
              src={currentOrg.temaConfig.logoUrl}
              alt={currentOrg.designacao}
              className="w-10 h-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-xs select-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Building2 size={20} style={{ color: 'var(--fortis-primary)' }} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 mr-2">
        {currentOrg.temaConfig?.logoUrl ? (
          <img
            src={currentOrg.temaConfig.logoUrl}
            alt={currentOrg.designacao}
            className="w-10 h-10 object-contain rounded-lg shrink-0 bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-xs shrink-0 select-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Building2 size={20} style={{ color: 'var(--fortis-primary)' }} />
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate tracking-tight leading-snug"
            title={currentOrg.designacao}
          >
            {currentOrg.designacao}
          </span>
          <span
            className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5"
            title={currentOrg.descricaoInstitucional || 'Centro de Formação Profissional'}
          >
            {currentOrg.descricaoInstitucional || 'Centro de Formação Profissional'}
          </span>
        </div>
      </div>
    );
  };

  // Itens de Navegação com Indicador Retilíneo Retangular Simples (Sem formato de arco / meia-lua)
  const renderNavLinks = (collapsed: boolean, isMobileView = false) => (
    <div className={`flex-1 overflow-y-auto py-3 space-y-5 ${collapsed ? 'px-2' : 'px-2.5'}`}>
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-0.5">
          {!collapsed && (
            <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              {group.title}
            </p>
          )}

          {group.items.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            if (collapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={item.label}
                  className={`group relative w-full flex items-center justify-center py-2.5 text-xs font-medium transition-colors select-none ${
                    isActive
                      ? 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Barra reta e simples na extremidade esquerda */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-none pointer-events-none"
                      style={{ backgroundColor: 'var(--fortis-primary)' }}
                    />
                  )}
                  <Icon
                    size={18}
                    className="shrink-0 transition-colors"
                    style={{ color: isActive ? 'var(--fortis-primary)' : undefined }}
                  />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  if (isMobileView && onCloseMobile) {
                    onCloseMobile();
                  }
                }}
                className={`group relative w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium transition-colors select-none text-left ${
                  isActive
                    ? 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Barra reta e simples na extremidade esquerda */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-none pointer-events-none"
                    style={{ backgroundColor: 'var(--fortis-primary)' }}
                  />
                )}

                <Icon
                  size={17}
                  className="shrink-0 transition-colors"
                  style={{ color: isActive ? 'var(--fortis-primary)' : undefined }}
                />
                <span className="truncate flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  // Rodapé: Simulador de Papéis e Informações do Utilizador
  const renderFooter = (collapsed: boolean) => (
    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
      {!collapsed ? (
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simular Perfil
              </span>
              <UserCheck size={12} className="text-slate-400" />
            </div>

            <select
              value={currentUser.id}
              onChange={e => switchUser(e.target.value)}
              className="w-full text-xs font-medium px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nomeCompleto} ({getRoleBadge(u.membro?.papelAcesso || 'formando')})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                {currentUser.nomeCompleto.charAt(0)}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.nomeCompleto}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {getRoleBadge(activeRole)}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200"
            title={`${currentUser.nomeCompleto} (${getRoleBadge(activeRole)})`}
          >
            {currentUser.nomeCompleto.charAt(0)}
          </div>
          <button
            onClick={logout}
            title="Encerrar Sessão"
            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Sidebar Permanente para Desktop e Tablet (md e lg) */}
      <aside
        className={`hidden md:flex flex-col border-r transition-all duration-300 z-30 select-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-56 lg:w-64'
        }`}
      >
        {/* Cabeçalho da Sidebar (Identidade da Empresa) */}
        <div className="flex items-center justify-between h-16 px-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {renderCompanyIdentity(isCollapsed)}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex items-center justify-center shrink-0"
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            aria-label={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Links de Navegação */}
        {renderNavLinks(isCollapsed, false)}

        {/* Rodapé da Sidebar */}
        {renderFooter(isCollapsed)}
      </aside>

      {/* 2. Menu Gaveta (Drawer) para Dispositivos Móveis (< md) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Fundo escuro (Backdrop) com efeito de desfoque ao clicar fora */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Painel Lateral Expansível */}
          <aside
            className="relative z-50 w-72 max-w-[85vw] h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-left duration-200 select-none"
          >
            {/* Topo do Menu Mobile com Identidade da Empresa e Botão de Fechar */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              {renderCompanyIdentity(false)}

              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title="Fechar Menu"
                aria-label="Fechar Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links de Navegação Mobile (fecha automaticamente ao selecionar) */}
            {renderNavLinks(false, true)}

            {/* Rodapé Mobile com Simulação de Perfil */}
            {renderFooter(false)}
          </aside>
        </div>
      )}
    </>
  );
};
