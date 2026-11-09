/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * Sidebar: Barra lateral de navegação institucional (248px expandida / 64px recolhida)
 * com design limpo, identidade dinâmica da organização e grupos organizados
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
  X,
  Shield,
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { currentOrg } = useAuth();

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

  // Grupos Oficiais do FORTIS ELM
  const navGroups = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard' as ActiveModule, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'formacoes' as ActiveModule, label: 'Formações (Catálogo)', icon: FileSpreadsheet },
        { id: 'cursos' as ActiveModule, label: 'Cursos (Agendamentos)', icon: BookOpen },
        { id: 'tarefas' as ActiveModule, label: 'Tarefas / Checklist', icon: CheckSquare },
      ],
    },
    {
      title: 'FORMAÇÃO & PESSOAS',
      items: [
        { id: 'formadores' as ActiveModule, label: 'Formadores', icon: GraduationCap },
        { id: 'formandos' as ActiveModule, label: 'Formandos & Inscrições', icon: Users },
        { id: 'presencas' as ActiveModule, label: 'Presenças & Pauta', icon: CalendarCheck },
        { id: 'avaliacoes' as ActiveModule, label: 'Avaliações', icon: Award },
        { id: 'certificados' as ActiveModule, label: 'Certificados', icon: ShieldCheck },
      ],
    },
    {
      title: 'QUALIDADE & GESTÃO',
      items: [
        { id: 'qualidade' as ActiveModule, label: 'Ocorrências (ISO 9001)', icon: AlertTriangle },
        { id: 'financeiro' as ActiveModule, label: 'Financeiro & Orçamento', icon: Wallet },
        { id: 'documentos' as ActiveModule, label: 'Documentos', icon: FolderArchive },
        { id: 'mensagens' as ActiveModule, label: 'Mensagens', icon: MessageSquare },
      ],
    },
    {
      title: 'SISTEMA',
      items: [
        { id: 'relatorios' as ActiveModule, label: 'Relatórios & Exportação', icon: BarChart3 },
        { id: 'auditoria' as ActiveModule, label: 'Histórico de Auditoria', icon: History },
        { id: 'empresa' as ActiveModule, label: 'Dados da Empresa', icon: Building2 },
        { id: 'aparencia' as ActiveModule, label: 'Aparência & Cores', icon: Palette },
      ],
    },
  ];

  // Topo da Sidebar com Identidade Dinâmica da Empresa Cliente e Marca FORTIS Discreta
  const renderCompanyIdentity = (collapsed: boolean) => {
    if (collapsed) {
      return (
        <div className="flex flex-col items-center justify-center w-full py-1" title={currentOrg.designacao}>
          {currentOrg.temaConfig?.logoUrl ? (
            <img
              src={currentOrg.temaConfig.logoUrl}
              alt={currentOrg.designacao}
              className="w-10 h-10 object-contain rounded-lg bg-slate-50 dark:bg-[#1B2B3E] p-1 border border-[#E3E8EF] dark:border-[#223347] shadow-xs"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-xs select-none bg-slate-50 dark:bg-[#1B2B3E] border border-[#E3E8EF] dark:border-[#223347]">
              <Building2 size={20} style={{ color: 'var(--fortis-primary)' }} />
            </div>
          )}
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5B6B7C] dark:text-[#94A3B8] mt-1">
            F
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
        {currentOrg.temaConfig?.logoUrl ? (
          <img
            src={currentOrg.temaConfig.logoUrl}
            alt={currentOrg.designacao}
            className="w-10 h-10 object-contain rounded-lg shrink-0 bg-slate-50 dark:bg-[#1B2B3E] p-1 border border-[#E3E8EF] dark:border-[#223347] shadow-xs"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-xs shrink-0 select-none bg-slate-50 dark:bg-[#1B2B3E] border border-[#E3E8EF] dark:border-[#223347]">
            <Building2 size={20} style={{ color: 'var(--fortis-primary)' }} />
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9] truncate tracking-tight leading-snug"
              title={currentOrg.designacao}
            >
              {currentOrg.designacao}
            </span>
          </div>
          <span
            className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] truncate leading-tight mt-0.5"
            title={currentOrg.descricaoInstitucional || 'Centro de Formação Profissional'}
          >
            {currentOrg.descricaoInstitucional || 'Centro de Formação Profissional'}
          </span>
        </div>
      </div>
    );
  };

  // Itens de Navegação com Indicador Retilíneo de 3px e Fundo Suave
  const renderNavLinks = (collapsed: boolean, isMobileView = false) => (
    <div className={`flex-1 overflow-y-auto py-3 space-y-5 ${collapsed ? 'px-2' : 'px-3'}`}>
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8896A6] dark:text-[#64748B] mb-1.5 select-none">
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
                  className={`group relative w-full flex items-center justify-center py-2.5 text-xs font-medium rounded-lg transition-colors select-none ${
                    isActive
                      ? 'bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)]'
                      : 'text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Barra lateral de 3px na extremidade esquerda */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-xs pointer-events-none"
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
                className={`group relative w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors select-none text-left ${
                  isActive
                    ? 'bg-[var(--fortis-primary-soft)] font-semibold'
                    : 'text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
                style={isActive ? { color: 'var(--fortis-primary)' } : undefined}
              >
                {/* Barra lateral de 3px na extremidade esquerda */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-xs pointer-events-none"
                    style={{ backgroundColor: 'var(--fortis-primary)' }}
                  />
                )}

                <Icon
                  size={18}
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

  return (
    <>
      {/* 1. Sidebar Permanente para Desktop e Tablet (248px expandida / 64px recolhida) */}
      <aside
        className={`hidden md:flex flex-col border-r transition-all duration-300 z-30 select-none bg-white dark:bg-[#152232] border-[#E3E8EF] dark:border-[#223347] shrink-0 h-full overflow-hidden ${
          isCollapsed ? 'w-[64px]' : 'w-[248px]'
        }`}
      >
        {/* Topo da Sidebar: Marca e Identidade */}
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-[#E3E8EF] dark:border-[#223347] shrink-0">
          {renderCompanyIdentity(isCollapsed)}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[#5B6B7C] hover:text-[#1B2A3A] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex items-center justify-center shrink-0 ml-1"
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            aria-label={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Links de Navegação com Rolagem Suave */}
        {renderNavLinks(isCollapsed, false)}

        {/* Rodapé da Sidebar: Marca FORTIS Discreta */}
        <div className="p-2.5 border-t border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] shrink-0 flex items-center justify-between text-[11px] text-[#8896A6]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full px-1">
              <span className="font-semibold tracking-wider text-[10px] text-[#5B6B7C] dark:text-[#94A3B8] flex items-center gap-1">
                <Shield size={11} className="text-[#16866A]" /> FORTIS ELM
              </span>
              <span className="text-[10px] font-mono text-[#8896A6]">v2.6</span>
            </div>
          ) : (
            <div className="w-full flex justify-center py-0.5" title="FORTIS Enterprise Learning Management">
              <Shield size={14} className="text-[#16866A]" />
            </div>
          )}
        </div>
      </aside>

      {/* 2. Menu Gaveta (Drawer) para Dispositivos Móveis (≤ 768px) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Fundo escuro com desfoque */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Painel Lateral Expansível */}
          <aside
            className="relative z-50 w-[248px] max-w-[85vw] h-full flex flex-col bg-white dark:bg-[#152232] border-r border-[#E3E8EF] dark:border-[#223347] shadow-2xl animate-in slide-in-from-left duration-200 select-none"
          >
            {/* Topo do Menu Mobile */}
            <div className="flex items-center justify-between h-14 px-3.5 border-b border-[#E3E8EF] dark:border-[#223347] shrink-0">
              {renderCompanyIdentity(false)}

              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[#5B6B7C] hover:text-[#1B2A3A] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title="Fechar Menu"
                aria-label="Fechar Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links de Navegação Mobile */}
            {renderNavLinks(false, true)}

            {/* Rodapé Mobile */}
            <div className="p-3 border-t border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] shrink-0 flex items-center justify-between text-xs text-[#5B6B7C] dark:text-[#94A3B8]">
              <span className="font-semibold text-[11px] flex items-center gap-1">
                <Shield size={12} className="text-[#16866A]" /> FORTIS ELM
              </span>
              <span className="text-[10px] font-mono">v2.6</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
