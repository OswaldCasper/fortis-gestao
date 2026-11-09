/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * CommandPalette: Paleta de comandos global (Ctrl+K / ⌘K) para busca instantânea em repositórios
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  Users,
  FileSpreadsheet,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  ArrowRight,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { ActiveModule } from './Sidebar';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: ActiveModule) => void;
  onSelectCourse?: (cursoId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectCourse,
}) => {
  const { currentOrg } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco automático ao abrir e fecho ao premir Escape
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setSearchTerm('');
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = searchTerm.toLowerCase().trim();

  // Módulos do Sistema
  const modulesList: { id: ActiveModule; label: string; group: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard Executivo', group: 'Navegação', icon: BookOpen },
    { id: 'formacoes', label: 'Formações (Catálogo)', group: 'Navegação', icon: FileSpreadsheet },
    { id: 'cursos', label: 'Cursos (Agendamentos)', group: 'Navegação', icon: BookOpen },
    { id: 'tarefas', label: 'Tarefas / Checklist Pedagógico', group: 'Navegação', icon: CheckSquare },
    { id: 'formadores', label: 'Formadores e Docentes', group: 'Pessoas', icon: Users },
    { id: 'formandos', label: 'Formandos & Inscrições', group: 'Pessoas', icon: Users },
    { id: 'certificados', label: 'Emissão e Validação de Certificados', group: 'Qualidade', icon: ShieldCheck },
    { id: 'qualidade', label: 'Ocorrências e Não Conformidades (ISO 9001)', group: 'Qualidade', icon: AlertTriangle },
    { id: 'financeiro', label: 'Controlo Orçamental e Financeiro', group: 'Gestão', icon: Wallet },
    { id: 'empresa', label: 'Dados da Empresa e Licenciamento', group: 'Sistema', icon: Users },
    { id: 'aparencia', label: 'Aparência e Personalização de Cores', group: 'Sistema', icon: Users },
    { id: 'perfil', label: 'O meu Perfil de Utilizador', group: 'Conta', icon: Users },
  ];

  const filteredModules = query
    ? modulesList.filter(m => m.label.toLowerCase().includes(query))
    : modulesList.slice(0, 5);

  // Cursos do repositório
  const courses = dataService.getCourses(currentOrg.id);
  const filteredCourses = query
    ? courses.filter(c => c.nomeCurso.toLowerCase().includes(query) || c.localSala.toLowerCase().includes(query)).slice(0, 4)
    : [];

  // Pessoas (Formandos / Formadores)
  const people = dataService.getPeople(currentOrg.id);
  const filteredPeople = query
    ? people.filter(p => p.nomeCompleto.toLowerCase().includes(query) || p.email.toLowerCase().includes(query)).slice(0, 4)
    : [];

  // Tarefas
  const tasks = dataService.getTasks(currentOrg.id);
  const filteredTasks = query
    ? tasks.filter(t => t.titulo.toLowerCase().includes(query)).slice(0, 3)
    : [];

  const handleSelectModule = (mod: ActiveModule) => {
    onNavigate(mod);
    onClose();
  };

  const handleSelectCourseItem = (cursoId: string) => {
    if (onSelectCourse) {
      onSelectCourse(cursoId);
    } else {
      onNavigate('cursos');
    }
    onClose();
  };

  const hasAnyResults =
    filteredModules.length > 0 ||
    filteredCourses.length > 0 ||
    filteredPeople.length > 0 ||
    filteredTasks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Caixa de diálogo da Paleta */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#152232] rounded-xl border border-[#E3E8EF] dark:border-[#223347] shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-150">
        {/* Campo de pesquisa */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E3E8EF] dark:border-[#223347]">
          <Search size={18} className="text-[#5B6B7C] dark:text-[#94A3B8] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar cursos, pessoas, tarefas ou navegar…"
            className="w-full bg-transparent text-sm text-[#1B2A3A] dark:text-[#F1F5F9] placeholder-[#8896A6] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#8896A6] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] mr-2"
            >
              <X size={14} />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#5B6B7C] dark:text-[#94A3B8] border border-[#E3E8EF] dark:border-[#223347]">
            ESC
          </span>
        </div>

        {/* Lista de Resultados com rolagem */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Cursos Agendados */}
          {filteredCourses.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8896A6]">
                Cursos Agendados
              </p>
              <div className="space-y-0.5">
                {filteredCourses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCourseItem(c.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen size={16} className="text-[var(--fortis-primary)] shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] truncate block">
                          {c.nomeCurso}
                        </span>
                        <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8]">
                          {c.localSala} • {c.periodo} • {c.vagasMaximas} vagas
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-[#8896A6] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formandos & Pessoas */}
          {filteredPeople.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8896A6]">
                Pessoas & Formandos
              </p>
              <div className="space-y-0.5">
                {filteredPeople.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectModule('formandos')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Users size={16} className="text-[#16866A] shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] truncate block">
                          {p.nomeCompleto}
                        </span>
                        <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8]">
                          {p.email} • {p.telefone}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-[#8896A6] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tarefas */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8896A6]">
                Tarefas / Checklist Pedagógico
              </p>
              <div className="space-y-0.5">
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectModule('tarefas')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare size={16} className="text-[#D99B24] shrink-0" />
                      <span className="font-medium text-[#1B2A3A] dark:text-[#F1F5F9] truncate">
                        {t.titulo}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[#5B6B7C]">
                      {t.prioridade}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Módulos do Sistema */}
          {filteredModules.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8896A6]">
                {query ? 'Módulos correspondentes' : 'Acesso Rápido'}
              </p>
              <div className="space-y-0.5">
                {filteredModules.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModule(m.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={16} className="text-[#5B6B7C] dark:text-[#94A3B8] shrink-0" />
                        <span className="font-medium text-[#1B2A3A] dark:text-[#F1F5F9] truncate">
                          {m.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8896A6]">
                        {m.group}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!hasAnyResults && (
            <div className="py-8 text-center text-xs text-[#5B6B7C] dark:text-[#94A3B8]">
              Nenhum resultado encontrado para &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>

        {/* Rodapé da Paleta */}
        <div className="px-4 py-2 border-t border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] flex items-center justify-between text-[11px] text-[#8896A6]">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={11} /> Prima Enter para selecionar
          </span>
          <span>FORTIS Enterprise</span>
        </div>
      </div>
    </div>
  );
};
