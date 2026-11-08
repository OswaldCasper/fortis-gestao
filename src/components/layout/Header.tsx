/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * Header: Barra de navegação superior executiva com pesquisa global, alternador de tema e notificações
 */

import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  RotateCw,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveModule } from './Sidebar';
import { dataService } from '../../services/dataService';

interface HeaderProps {
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
  onRefreshData: () => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onNavigate,
  onRefreshData,
  globalSearch,
  setGlobalSearch,
  onToggleMobileMenu,
}) => {
  const { themeMode, setThemeMode, isDarkMode } = useTheme();
  const { currentUser, currentOrg, activeRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'Tarefa com prazo próximo', desc: 'Enviar documentação ao formador vence em breve.', time: 'Há 10 min', unread: true },
    { id: '2', title: 'Certificado pronto para emissão', desc: 'Curso Gestão da Qualidade concluiu avaliações.', time: 'Há 1 hora', unread: true },
    { id: '3', title: 'Não-conformidade NC-2026-001', desc: 'Ação corretiva registada pelo formador.', time: 'Ontem', unread: false },
  ];

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard': return 'Dashboard Executivo';
      case 'cursos': return 'Gestão de Cursos e Ações';
      case 'tarefas': return 'Tarefas e Checklist Pedagógico';
      case 'formacoes': return 'Catálogo de Formações';
      case 'formadores': return 'Corpo Docente / Formadores';
      case 'formandos': return 'Formandos e Inscrições';
      case 'presencas': return 'Presenças e Pauta de Sessões';
      case 'avaliacoes': return 'Lançamento de Avaliações';
      case 'certificados': return 'Emissão e Validação de Certificados';
      case 'qualidade': return 'Qualidade e Não Conformidades (ISO 9001)';
      case 'financeiro': return 'Controlo Financeiro e Orçamental';
      case 'documentos': return 'Gestão Documental e Arquivo';
      case 'mensagens': return 'Mensagens e Comunicação Interna';
      case 'relatorios': return 'Relatórios e Exportações';
      case 'auditoria': return 'Histórico de Auditoria Imutável';
      case 'empresa': return 'Dados da Organização';
      case 'aparencia': return 'Aparência e Personalização de Cores';
      case 'perfil': return 'Perfil do Utilizador';
      default: return 'FORTIS';
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 sm:gap-6 shrink-0 z-20">
      {/* Zona 1: Menu Mobile, Título e Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Botão Hambúrguer para Dispositivos Móveis */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 sm:-ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden flex items-center justify-center transition-colors shrink-0"
          title="Abrir menu lateral"
          aria-label="Abrir menu lateral"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
          <span className="hidden sm:inline truncate max-w-[140px]">{currentOrg.designacao}</span>
          <span className="hidden sm:inline">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
            {getModuleTitle()}
          </span>
        </div>
      </div>

      {/* Zona 2: Pesquisa Global & Status */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-3">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Pesquisar em toda a plataforma (cursos, formandos, tarefas)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium shrink-0">
          <CheckCircle2 size={12} />
          <span>Sistema ativo</span>
        </div>
      </div>

      {/* Zona 3: Ações Rápidas, Notificações, Tema e Perfil */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRefreshData}
          title="Atualizar Dados"
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCw size={16} />
        </button>

        {/* Notificações Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Notificações"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notificações Operacionais</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold">
                  2 novas
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alternador de Tema Claro / Escuro / Auto */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setThemeMode('claro')}
            title="Modo Claro"
            className={`p-1.5 rounded-md transition-all ${
              themeMode === 'claro'
                ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Sun size={14} />
          </button>
          <button
            onClick={() => setThemeMode('escuro')}
            title="Modo Escuro"
            className={`p-1.5 rounded-md transition-all ${
              themeMode === 'escuro'
                ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Moon size={14} />
          </button>
          <button
            onClick={() => setThemeMode('auto')}
            title="Automático (Sistema)"
            className={`p-1.5 rounded-md transition-all ${
              themeMode === 'auto'
                ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Monitor size={14} />
          </button>
        </div>

        {/* Botão de Perfil Rápido */}
        <button
          onClick={() => onNavigate('perfil')}
          title="Ver o meu Perfil"
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition-opacity"
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            {currentUser.nomeCompleto.charAt(0)}
          </div>
        </button>
      </div>
    </header>
  );
};
