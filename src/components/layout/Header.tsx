/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * Header: Barra de navegação executiva (56px) com breadcrumbs, pesquisa global (Ctrl+K),
 * notificações, ajuda e menu do perfil com controlo de tema e simulação de papéis
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  RotateCw,
  X,
  HelpCircle,
  User,
  LogOut,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Command,
  Building2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { PapelAcesso } from '../../types';
import { ActiveModule } from './Sidebar';
import { CommandPalette } from './CommandPalette';

interface HeaderProps {
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
  onRefreshData: () => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  onToggleMobileMenu?: () => void;
  onSelectCourse?: (cursoId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onNavigate,
  onRefreshData,
  globalSearch,
  setGlobalSearch,
  onToggleMobileMenu,
  onSelectCourse,
}) => {
  const { themeMode, setThemeMode } = useTheme();
  const {
    currentUser,
    currentOrg,
    activeRole,
    simulatedRole,
    isPlatformAdmin,
    simulateRole,
    userOrganizations,
    setActiveOrganization,
    logout,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Escuta global do atalho Ctrl+K / ⌘K para a Paleta de Comandos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(target)) {
        setShowHelp(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin_plataforma': return 'SuperAdmin Global';
      case 'superadmin_org': return 'SuperAdmin Org';
      case 'admin': return 'Administrador';
      case 'gestor': return 'Gestor de Formação';
      case 'formador': return 'Formador';
      case 'formando': return 'Formando';
      default: return role;
    }
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard': return 'Dashboard Executivo';
      case 'formacoes': return 'Formações (Catálogo)';
      case 'cursos': return 'Cursos (Agendamentos)';
      case 'tarefas': return 'Tarefas e Checklist Pedagógico';
      case 'formadores': return 'Corpo Docente / Formadores';
      case 'formandos': return 'Formandos e Inscrições';
      case 'presencas': return 'Presenças e Pauta de Sessões';
      case 'avaliacoes': return 'Lançamento de Avaliações';
      case 'certificados': return 'Emissão e Validação de Certificados';
      case 'qualidade': return 'Qualidade e Não Conformidades (ISO 9001)';
      case 'financeiro': return 'Controlo Financeiro e Orçamental';
      case 'documentos': return 'Gestão Documental e Arquivo';
      case 'mensagens': return 'Mensagens e Notificações';
      case 'relatorios': return 'Relatórios e Exportações';
      case 'auditoria': return 'Histórico de Auditoria Imutável';
      case 'empresa': return 'Dados da Organização';
      case 'aparencia': return 'Aparência e Personalização de Cores';
      case 'perfil': return 'O meu Perfil';
      default: return 'FORTIS';
    }
  };

  const notifications = [
    { id: '1', title: 'Tarefa com prazo próximo', desc: 'Enviar documentação ao formador vence hoje.', time: 'Há 10 min', unread: true },
    { id: '2', title: 'Certificado pronto para emissão', desc: 'Curso Gestão da Qualidade concluiu avaliações.', time: 'Há 1 hora', unread: true },
    { id: '3', title: 'Não-conformidade NC-2026-001', desc: 'Ação corretiva registada pelo coordenador.', time: 'Ontem', unread: false },
  ];

  return (
    <>
      <header className="h-14 px-4 sm:px-6 border-b border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] flex items-center justify-between gap-3 sm:gap-6 shrink-0 z-20 transition-colors">
        {/* Zona 1: Menu Mobile & Breadcrumbs com Truncagem Inteligente */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Botão Hambúrguer para Dispositivos Móveis */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-1.5 -ml-1 rounded-lg text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden flex items-center justify-center transition-colors shrink-0"
            title="Abrir menu de navegação"
            aria-label="Abrir menu de navegação"
          >
            <Menu size={19} />
          </button>

          {/* Breadcrumb Legível com Truncagem no Meio */}
          <nav className="flex items-center text-xs text-[#5B6B7C] dark:text-[#94A3B8] min-w-0" aria-label="Breadcrumb">
            <span
              className="hidden sm:inline font-medium text-[#5B6B7C] dark:text-[#94A3B8] truncate max-w-[130px] hover:text-[#1B2A3A] transition-colors"
              title={currentOrg.designacao}
            >
              {currentOrg.designacao}
            </span>
            <ChevronRight size={13} className="hidden sm:inline mx-1.5 text-[#8896A6] shrink-0" />
            <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] truncate">
              {getModuleTitle()}
            </span>
          </nav>
        </div>

        {/* Zona 2: Pesquisa Global Curta com Atalho Ctrl+K */}
        <div className="flex-1 max-w-sm hidden md:flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] text-[#8896A6] hover:border-[#CBD5E1] dark:hover:border-[#334155] hover:bg-white dark:hover:bg-[#152232] transition-all shadow-2xs group"
          >
            <span className="flex items-center gap-2 text-xs truncate">
              <Search size={14} className="text-[#8896A6] group-hover:text-[var(--fortis-primary)] transition-colors" />
              <span>Pesquisar…</span>
            </span>
            <kbd className="inline-flex items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] text-[#5B6B7C] dark:text-[#94A3B8] shadow-2xs">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Zona 3: Ações Rápidas (Atualizar, Notificações, Ajuda e Menu do Perfil) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botão de Pesquisa Rápida no Mobile */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Pesquisar (Ctrl+K)"
            className="p-1.5 text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors md:hidden"
          >
            <Search size={17} />
          </button>

          {/* Atualizar Dados */}
          <button
            onClick={onRefreshData}
            title="Sincronizar Dados"
            className="p-1.5 text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCw size={16} />
          </button>

          {/* Notificações Popover */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowHelp(false);
                setShowProfileMenu(false);
              }}
              className="relative p-1.5 text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Notificações Operacionais"
            >
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D99B24]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#152232] rounded-xl shadow-xl border border-[#E3E8EF] dark:border-[#223347] p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                  <span className="text-xs font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">
                    Notificações Operacionais
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-[#FEF7EB] text-[#D99B24] dark:bg-[#382808] dark:text-[#E8AA35]">
                    2 novas
                  </span>
                </div>
                <div className="divide-y divide-[#E3E8EF] dark:divide-[#223347] max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">{n.title}</p>
                        <span className="text-[10px] text-[#8896A6]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] mt-0.5 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ajuda Popover */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => {
                setShowHelp(!showHelp);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className="p-1.5 text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Ajuda e Suporte"
            >
              <HelpCircle size={17} />
            </button>

            {showHelp && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#152232] rounded-xl shadow-xl border border-[#E3E8EF] dark:border-[#223347] p-3.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                  <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center gap-1.5">
                    <Shield size={14} className="text-[#16866A]" /> Guia FORTIS ELM
                  </span>
                  <span className="text-[10px] text-[#8896A6] font-mono">v2.6</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-[#5B6B7C] dark:text-[#94A3B8]">
                  <p className="flex items-center justify-between">
                    <span>Pesquisa Global</span>
                    <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-[#E3E8EF] dark:border-[#223347]">
                      Ctrl + K
                    </kbd>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Fechar janelas</span>
                    <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-[#E3E8EF] dark:border-[#223347]">
                      ESC
                    </kbd>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E3E8EF] dark:border-[#223347] text-[11px] space-y-1 text-[#5B6B7C] dark:text-[#94A3B8]">
                  <p className="font-medium text-[#1B2A3A] dark:text-[#F1F5F9]">Suporte Institucional</p>
                  <p>Gestão da Formação e Qualidade ISO 9001:2015</p>
                  <p className="text-[10px] text-[#8896A6]">contacto@fortisacademy.demo</p>
                </div>
              </div>
            )}
          </div>

          {/* Menu do Perfil com Avatar */}
          <div className="relative pl-1 border-l border-[#E3E8EF] dark:border-[#223347]" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowHelp(false);
              }}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Menu do Utilizador"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                style={{ backgroundColor: 'var(--fortis-primary)' }}
              >
                {currentUser.nomeCompleto.charAt(0)}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#152232] rounded-xl shadow-xl border border-[#E3E8EF] dark:border-[#223347] py-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                {/* Cabeçalho do Perfil */}
                <div className="px-3.5 py-2.5 border-b border-[#E3E8EF] dark:border-[#223347]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                      style={{ backgroundColor: 'var(--fortis-primary)' }}
                    >
                      {currentUser.nomeCompleto.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] truncate">
                        {currentUser.nomeCompleto}
                      </p>
                      <p className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-medium font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[#5B6B7C] dark:text-[#94A3B8]">
                        {getRoleBadge(activeRole)}
                      </span>
                    </div>
                  </div>

                  {/* Ponto de estado discreto */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#16866A] dark:text-[#20A785] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16866A] dark:bg-[#20A785]" />
                    <span>Sistema operacional e sincronizado</span>
                  </div>
                </div>

                {/* Opção O meu Perfil */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      onNavigate('perfil');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#1B2A3A] dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left font-medium"
                  >
                    <User size={15} className="text-[#5B6B7C] dark:text-[#94A3B8]" />
                    <span>O meu Perfil</span>
                  </button>
                </div>

                {/* Alternador de Tema (Claro / Escuro / Auto) */}
                <div className="px-3 py-2 border-t border-[#E3E8EF] dark:border-[#223347]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8896A6] block mb-1.5">
                    Aparência
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-[#F4F6F9] dark:bg-[#0B111B] p-1 rounded-lg border border-[#E3E8EF] dark:border-[#223347]">
                    <button
                      onClick={() => setThemeMode('claro')}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                        themeMode === 'claro'
                          ? 'bg-white dark:bg-[#152232] text-[#D99B24] shadow-xs font-semibold'
                          : 'text-[#5B6B7C] dark:text-[#94A3B8]'
                      }`}
                      title="Tema Claro"
                    >
                      <Sun size={13} />
                      <span>Claro</span>
                    </button>
                    <button
                      onClick={() => setThemeMode('escuro')}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                        themeMode === 'escuro'
                          ? 'bg-white dark:bg-[#152232] text-[#D99B24] shadow-xs font-semibold'
                          : 'text-[#5B6B7C] dark:text-[#94A3B8]'
                      }`}
                      title="Tema Escuro"
                    >
                      <Moon size={13} />
                      <span>Escuro</span>
                    </button>
                    <button
                      onClick={() => setThemeMode('auto')}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                        themeMode === 'auto'
                          ? 'bg-white dark:bg-[#152232] text-[var(--fortis-primary)] shadow-xs font-semibold'
                          : 'text-[#5B6B7C] dark:text-[#94A3B8]'
                      }`}
                      title="Automático (Sistema)"
                    >
                      <Monitor size={13} />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                {/* Alternador de Organização (Utilizadores Multiempresa) */}
                {userOrganizations.length > 1 && (
                  <div className="px-3 py-2 border-t border-[#E3E8EF] dark:border-[#223347]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8896A6] flex items-center gap-1 mb-1.5">
                      <Building2 size={12} /> Organização Ativa
                    </span>
                    <select
                      value={currentOrg.id}
                      onChange={e => {
                        setActiveOrganization(e.target.value);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-xs font-medium px-2 py-1.5 rounded border border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] text-[#1B2A3A] dark:text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)]"
                    >
                      {userOrganizations.map(org => (
                        <option key={org.id} value={org.id}>
                          {org.designacao}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Modo de Desenvolvimento: Simulação de Perfil (Apenas SuperAdmin Global) */}
                {isPlatformAdmin && (
                  <div className="px-3 py-2.5 border-t border-[#E3E8EF] dark:border-[#223347] bg-[#FEF7EB]/40 dark:bg-[#382808]/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99B24] flex items-center gap-1">
                        <AlertCircle size={11} /> Simulação de Perfil
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#FEF7EB] text-[#D99B24] font-semibold">
                        {simulatedRole ? 'SIMULAÇÃO ATIVA' : 'REAL'}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#8896A6] mb-1.5 leading-snug">
                      Simulação de perfil: só altera a interface; as permissões reais do backend não mudam.
                    </p>

                    <select
                      value={simulatedRole || ''}
                      onChange={e => {
                        const val = e.target.value as PapelAcesso | '';
                        simulateRole(val ? val : null);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-xs font-medium px-2 py-1.5 rounded border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] text-[#1B2A3A] dark:text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#D99B24]"
                    >
                      <option value="">Perfil Real (SuperAdmin Global)</option>
                      <option value="superadmin_org">SuperAdmin da Organização</option>
                      <option value="admin">Administrador</option>
                      <option value="gestor">Gestor de Formação</option>
                      <option value="formador">Formador</option>
                      <option value="formando">Formando</option>
                    </select>
                  </div>
                )}

                {/* Encerrar Sessão */}
                <div className="p-1 border-t border-[#E3E8EF] dark:border-[#223347]">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#D32F2F] dark:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-medium"
                  >
                    <LogOut size={15} />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Paleta de Comandos Global (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={onNavigate}
        onSelectCourse={onSelectCourse}
      />
    </>
  );
};
