/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * CoursesView: Master-Detail split view profissional para gestão integral de cursos
 * Inclui os 12 botões e ações operacionais, 9 separadores estruturados, validação ISO 9001 e pauta
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Users,
  CheckSquare,
  GraduationCap,
  FileText,
  AlertTriangle,
  Wallet,
  Award,
  Lock,
  Unlock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Printer,
  Edit,
  Trash2,
  X,
  FileCheck,
  UserPlus,
  MoreVertical,
  History,
  ShieldCheck,
  DollarSign,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Curso, EstadoCurso, PeriodoTurno } from '../../types';
import {
  Card,
  StatusBadge,
  DataTable,
  EmptyState,
  Tabs,
} from '../ui';

interface CoursesViewProps {
  initialCourseId?: string;
  initialActionModal?: ActionModal;
  onOpenCertificates?: () => void;
  onOpenTasks?: () => void;
}

export type CourseActionModal =
  | 'status'
  | 'checklist'
  | 'inscricoes'
  | 'formadores'
  | 'pauta'
  | 'ocorrencias'
  | 'custos'
  | 'avaliacoes'
  | 'certificados'
  | 'relatorio'
  | 'encerramento'
  | 'resumo_ia'
  | 'novo_curso'
  | null;

type ActionModal = CourseActionModal;
type CourseTabId =
  | 'visao_geral'
  | 'formandos'
  | 'formadores'
  | 'presencas'
  | 'avaliacoes'
  | 'financeiro'
  | 'qualidade'
  | 'documentos'
  | 'auditoria';

export const CoursesView: React.FC<CoursesViewProps> = ({
  initialCourseId,
  initialActionModal = null,
  onOpenCertificates,
  onOpenTasks,
}) => {
  const { currentUser, currentOrg, hasRole } = useAuth();

  // Cursos da organização
  const [courses, setCourses] = useState(() => dataService.getCourses(currentOrg.id));
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses.length > 0 ? courses[0].id : '')
  );

  // Filtros da coluna esquerda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  // Separador de detalhe ativo (9 tabs)
  const [activeTab, setActiveTab] = useState<CourseTabId>('visao_geral');

  // Menu de contexto "⋯"
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal de ação ativo
  const [activeModal, setActiveModal] = useState<ActionModal>(initialActionModal);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Formulário de novo curso
  const [novoCursoForm, setNovoCursoForm] = useState({
    nomeCurso: '',
    periodo: 'tarde' as PeriodoTurno,
    localSala: 'Sala 01 - Principal',
    dataInicio: '2026-11-20',
    dataFim: '2026-12-15',
    vagasMaximas: 20,
    precoInscricao: 85000,
    orcamentoPrevisto: 1000000,
    custoPrevisto: 650000,
  });

  // Re-subscrever ao dataService
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setCourses(dataService.getCourses(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Filtragem da lista da coluna esquerda
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch =
        c.nomeCurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.localSala.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchYear = selectedYear === 'Todos' || c.ano.toString() === selectedYear;
      const matchMonth = selectedMonth === 'Todos' || c.mes.toString() === selectedMonth;
      const matchStatus = selectedStatus === 'Todos' || c.estadoCurso === selectedStatus;
      return matchSearch && matchYear && matchMonth && matchStatus;
    });
  }, [courses, searchTerm, selectedYear, selectedMonth, selectedStatus]);

  // Handlers operacionais
  const handleUpdateStatus = (novoEstado: EstadoCurso) => {
    if (!selectedCourse) return;
    dataService.updateCourseStatus(selectedCourse.id, novoEstado, currentUser.id);
    setStatusFeedback(`Estado atualizado para "${novoEstado.replace('_', ' ').toUpperCase()}".`);
    setTimeout(() => setStatusFeedback(null), 3500);
    setActiveModal(null);
  };

  const handleToggleClosure = () => {
    if (!selectedCourse) return;
    const res = dataService.toggleCourseClosure(selectedCourse.id, currentUser.id);
    setStatusFeedback(res.message);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = dataService.createCourse(
      {
        empresaId: currentOrg.id,
        formacaoCatalogoId: 'cat-1',
        nomeCurso: novoCursoForm.nomeCurso,
        ano: new Date(novoCursoForm.dataInicio).getFullYear(),
        mes: new Date(novoCursoForm.dataInicio).getMonth() + 1,
        periodo: novoCursoForm.periodo,
        instituicao: currentOrg.designacao,
        localSala: novoCursoForm.localSala,
        dataInicio: novoCursoForm.dataInicio,
        dataFim: novoCursoForm.dataFim,
        coordenadorId: currentUser.id,
        vagasMaximas: Number(novoCursoForm.vagasMaximas),
        precoInscricao: Number(novoCursoForm.precoInscricao),
        orcamentoPrevisto: Number(novoCursoForm.orcamentoPrevisto),
        custoPrevisto: Number(novoCursoForm.custoPrevisto),
        estadoCurso: 'agendado',
        encerrado: false,
        progressoPercent: 0,
        conformidadePercent: 80,
      },
      currentUser.id
    );

    setSelectedCourseId(created.id);
    setActiveModal(null);
    setStatusFeedback('Nova ação de formação criada com sucesso.');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Dados auxiliares do curso selecionado
  const formadoresCurso = useMemo(() => {
    return selectedCourse ? dataService.getCourseTrainers(selectedCourse.id) : [];
  }, [selectedCourse]);

  const inscricoesCurso = useMemo(() => {
    return selectedCourse ? dataService.getCourseEnrollments(selectedCourse.id) : [];
  }, [selectedCourse]);

  const tarefasCurso = useMemo(() => {
    return selectedCourse ? dataService.getTasks(currentOrg.id, selectedCourse.id) : [];
  }, [selectedCourse, currentOrg.id]);

  const avaliacoesCurso = useMemo(() => {
    return selectedCourse ? dataService.getCourseEvaluations(selectedCourse.id) : [];
  }, [selectedCourse]);

  const certificadosCurso = useMemo(() => {
    return selectedCourse ? dataService.getCertificates(currentOrg.id, selectedCourse.id) : [];
  }, [selectedCourse, currentOrg.id]);

  const financasCurso = useMemo(() => {
    return selectedCourse ? dataService.getFinancialRecords(currentOrg.id, selectedCourse.id) : [];
  }, [selectedCourse, currentOrg.id]);

  const sessoesCurso = useMemo(() => {
    return selectedCourse ? dataService.getCourseSessions(selectedCourse.id) : [];
  }, [selectedCourse]);

  const ocorrenciasCurso = useMemo(() => {
    return selectedCourse ? dataService.getOccurrences(currentOrg.id, selectedCourse.id) : [];
  }, [selectedCourse, currentOrg.id]);

  const auditoriaCurso = useMemo(() => {
    return selectedCourse
      ? dataService.getAuditHistory(currentOrg.id).filter(a => a.entidadeId === selectedCourse.id)
      : [];
  }, [selectedCourse, currentOrg.id]);

  // Helper de badges
  const getBadgeVariant = (estado: EstadoCurso): 'success' | 'warning' | 'info' | 'neutral' => {
    switch (estado) {
      case 'realizado':
        return 'success';
      case 'em_andamento':
        return 'info';
      case 'agendado':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const courseTabs = [
    { id: 'visao_geral', label: 'Visão Geral', count: tarefasCurso.filter(t => t.estado !== 'concluida').length || undefined },
    { id: 'formandos', label: 'Formandos', count: inscricoesCurso.length },
    { id: 'formadores', label: 'Formadores', count: formadoresCurso.length },
    { id: 'presencas', label: 'Presenças', count: sessoesCurso.length },
    { id: 'avaliacoes', label: 'Avaliações', count: avaliacoesCurso.length },
    { id: 'financeiro', label: 'Financeiro', count: financasCurso.length },
    { id: 'qualidade', label: 'Qualidade', count: ocorrenciasCurso.length },
    { id: 'documentos', label: 'Documentos', count: certificadosCurso.length },
    { id: 'auditoria', label: 'Auditoria' },
  ];

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Feedback Toast */}
      {statusFeedback && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-md">
          <span className="font-semibold">{statusFeedback}</span>
          <button onClick={() => setStatusFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid Principal Master-Detail (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUNA ESQUERDA: LISTA DE CURSOS (~340px / 4 colunas) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#152232] rounded-xl border border-[#E3E8EF] dark:border-[#223347] p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center gap-2">
              <BookOpen size={16} className="text-[var(--fortis-primary)]" />
              <span>Cursos Agendados ({filteredCourses.length})</span>
            </h2>

            {hasRole(['superadmin_org', 'admin', 'gestor']) && (
              <button
                onClick={() => setActiveModal('novo_curso')}
                className="px-2.5 py-1 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 flex items-center gap-1"
                style={{ backgroundColor: 'var(--fortis-primary)' }}
              >
                <Plus size={13} />
                <span>Adicionar</span>
              </button>
            )}
          </div>

          {/* Campo de Pesquisa Rápida */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Procurar curso, sala ou código..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)] font-medium"
            />
          </div>

          {/* Filtros compactos: Ano, Mês e Estado */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="py-1 px-1.5 text-[11px] rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
            >
              <option value="Todos">Ano: Todos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2004">2004</option>
            </select>

            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="py-1 px-1.5 text-[11px] rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
            >
              <option value="Todos">Mês: Todos</option>
              <option value="1">Jan</option>
              <option value="2">Fev</option>
              <option value="3">Mar</option>
              <option value="4">Abr</option>
              <option value="5">Mai</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Ago</option>
              <option value="9">Set</option>
              <option value="10">Out</option>
              <option value="11">Nov</option>
              <option value="12">Dez</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="py-1 px-1.5 text-[11px] rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="agendado">Agendado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Lista de Cartões de Curso */}
          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredCourses.length === 0 ? (
              <p className="text-xs text-center py-6 text-[#5B6B7C]">Nenhum curso encontrado.</p>
            ) : (
              filteredCourses.map(curso => {
                const isSelected = selectedCourse?.id === curso.id;

                return (
                  <div
                    key={curso.id}
                    onClick={() => setSelectedCourseId(curso.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-[var(--fortis-primary)] bg-[var(--fortis-primary-soft)] shadow-xs ring-1 ring-[var(--fortis-primary)]'
                        : 'border-[#E3E8EF] dark:border-[#223347] hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#152232]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[10px] font-bold text-[#5B6B7C] dark:text-[#94A3B8] block">
                          {curso.id.toUpperCase()}
                        </span>
                        <p className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] truncate">
                          {curso.nomeCurso}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0">
                        {curso.progressoPercent}%
                      </div>
                    </div>

                    <div className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] space-y-0.5">
                      <p className="capitalize">Turno da {curso.periodo} · {curso.localSala}</p>
                      <p className="font-mono text-[10px]">{curso.dataInicio} a {curso.dataFim}</p>
                    </div>

                    <div className="pt-2 border-t border-[#E3E8EF]/60 dark:border-[#223347]/60 flex items-center justify-between text-[11px]">
                      {/* Badge independente de Estado do Curso */}
                      <StatusBadge variant={getBadgeVariant(curso.estadoCurso)}>
                        {curso.estadoCurso.replace('_', ' ')}
                      </StatusBadge>

                      {/* Badge independente e explícito de Encerramento */}
                      {curso.encerrado ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16866A] dark:text-[#20A785] bg-[#E8F5F1] dark:bg-[#0C3328] px-2 py-0.5 rounded">
                          <Lock size={10} /> Encerrado
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#5B6B7C] font-medium">
                          Em Aberto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: DETALHE DO CURSO (8 Colunas) */}
        {selectedCourse ? (
          <div className="lg:col-span-8 space-y-4">
            
            {/* Cabeçalho Fixo do Detalhe */}
            <Card padding="md" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E3E8EF] dark:border-[#223347]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#5B6B7C] dark:text-[#94A3B8]">
                      {selectedCourse.id.toUpperCase()}
                    </span>
                    <StatusBadge variant={getBadgeVariant(selectedCourse.estadoCurso)}>
                      {selectedCourse.estadoCurso.replace('_', ' ')}
                    </StatusBadge>
                    {selectedCourse.encerrado ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16866A] dark:text-[#20A785] bg-[#E8F5F1] dark:bg-[#0C3328] px-2.5 py-0.5 rounded">
                        <Lock size={12} /> Encerrado Formalmente
                      </span>
                    ) : (
                      <span className="text-xs text-[#5B6B7C] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Processo em Aberto
                      </span>
                    )}
                  </div>
                  <h1 className="text-lg md:text-xl font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                    {selectedCourse.nomeCurso}
                  </h1>
                </div>

                {/* Ações Rápidas & Menu Contextual "⋯" */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveModal('certificados')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-xs flex items-center gap-1.5 transition-colors"
                    style={{ backgroundColor: 'var(--fortis-secondary)' }}
                  >
                    <Award size={14} />
                    <span>Certificados</span>
                  </button>

                  <div className="relative" ref={contextMenuRef}>
                    <button
                      onClick={() => setShowContextMenu(v => !v)}
                      className="p-1.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] text-[#5B6B7C] hover:text-[#1B2A3A] transition-colors"
                      title="Operações do Curso"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {showContextMenu && (
                      <div className="absolute right-0 top-full mt-1.5 w-56 p-1.5 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl shadow-xl z-30 text-xs space-y-0.5">
                        <button
                          onClick={() => { setActiveModal('status'); setShowContextMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-[#1B2A3A] dark:text-[#F1F5F9]"
                        >
                          <Clock size={14} className="text-blue-500" />
                          <span>Atualizar Estado</span>
                        </button>

                        <button
                          onClick={() => { handleToggleClosure(); setShowContextMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-[#1B2A3A] dark:text-[#F1F5F9]"
                        >
                          {selectedCourse.encerrado ? (
                            <>
                              <Unlock size={14} className="text-emerald-500" />
                              <span>Reabrir Curso</span>
                            </>
                          ) : (
                            <>
                              <Lock size={14} className="text-amber-500" />
                              <span>Encerrar Formalmente</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => { setActiveModal('inscricoes'); setShowContextMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-[#1B2A3A] dark:text-[#F1F5F9]"
                        >
                          <UserPlus size={14} className="text-indigo-500" />
                          <span>Adicionar Inscrição</span>
                        </button>

                        <button
                          onClick={() => { setActiveModal('formadores'); setShowContextMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-[#1B2A3A] dark:text-[#F1F5F9]"
                        >
                          <GraduationCap size={14} className="text-blue-500" />
                          <span>Atribuir Formador</span>
                        </button>

                        <button
                          onClick={() => { setActiveModal('ocorrencias'); setShowContextMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-[#1B2A3A] dark:text-[#F1F5F9]"
                        >
                          <AlertTriangle size={14} className="text-amber-500" />
                          <span>Registar Ocorrência</span>
                        </button>

                        <button
                          onClick={() => { setActiveModal('custos'); setShowContextMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-[#1B2A3A] dark:text-[#F1F5F9]"
                        >
                          <Wallet size={14} className="text-rose-500" />
                          <span>Registar Custo / Despesa</span>
                        </button>

                        <button
                          onClick={() => { setActiveModal('resumo_ia'); setShowContextMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-[#1B2A3A] dark:text-[#F1F5F9]"
                        >
                          <Sparkles size={14} className="text-[var(--fortis-secondary)]" />
                          <span>Síntese da Formação</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações Resumo Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0B111B]">
                  <span className="text-[10px] text-[#5B6B7C] block font-medium">Datas</span>
                  <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] font-mono tabular-nums">
                    {selectedCourse.dataInicio} a {selectedCourse.dataFim}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0B111B]">
                  <span className="text-[10px] text-[#5B6B7C] block font-medium">Turno / Sala</span>
                  <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] capitalize truncate block">
                    {selectedCourse.periodo} · {selectedCourse.localSala}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0B111B]">
                  <span className="text-[10px] text-[#5B6B7C] block font-medium">Inscrições / Vagas</span>
                  <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums font-mono">
                    {inscricoesCurso.length} / {selectedCourse.vagasMaximas}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0B111B]">
                  <span className="text-[10px] text-[#5B6B7C] block font-medium">Orçamento Previsto</span>
                  <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums font-mono">
                    {selectedCourse.orcamentoPrevisto.toLocaleString()} Kz
                  </span>
                </div>
              </div>

              {/* Barras de Progresso e Conformidade ISO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#5B6B7C]">Progresso Pedagógico</span>
                    <span className="tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">{selectedCourse.progressoPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, selectedCourse.progressoPercent)}%`,
                        backgroundColor: 'var(--fortis-primary)',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#5B6B7C]">Conformidade ISO 9001</span>
                    <span className="tabular-nums text-[#16866A]">{selectedCourse.conformidadePercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#16866A] transition-all duration-500"
                      style={{ width: `${selectedCourse.conformidadePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 9 Separadores Estruturados */}
              <Tabs
                tabs={courseTabs}
                activeTab={activeTab}
                onChange={id => setActiveTab(id as CourseTabId)}
              />
            </Card>

            {/* CONTEÚDO DO SEPARADOR ATIVO */}
            <div className="space-y-4">
              
              {/* TAB 1: VISÃO GERAL */}
              {activeTab === 'visao_geral' && (
                <div className="space-y-4">
                  {/* Card Checklist de Tarefas do Curso */}
                  <Card padding="md" className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                      <div>
                        <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center gap-1.5">
                          <CheckSquare size={14} className="text-[var(--fortis-primary)]" />
                          <span>Checklist & Requisitos ISO 9001 da Ação</span>
                        </h3>
                        <p className="text-[11px] text-[#5B6B7C]">Tarefas obrigatórias para o fecho formal administrativo</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#16866A]">
                        {tarefasCurso.filter(t => t.estado === 'concluida').length} / {tarefasCurso.length} concluídas
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tarefasCurso.length === 0 ? (
                        <p className="text-xs text-center py-4 text-[#5B6B7C]">Sem tarefas associadas a este curso.</p>
                      ) : (
                        tarefasCurso.map(tar => (
                          <div
                            key={tar.id}
                            onClick={() => dataService.toggleTaskState(tar.id, currentUser.id)}
                            className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 flex items-start gap-2.5 cursor-pointer hover:border-[var(--fortis-primary)] transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={tar.estado === 'concluida'}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-[var(--fortis-primary)] focus:ring-[var(--fortis-primary)]"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${tar.estado === 'concluida' ? 'line-through text-slate-400' : 'text-[#1B2A3A] dark:text-[#F1F5F9]'}`}>
                                {tar.titulo}
                              </p>
                              <p className="text-[11px] text-[#5B6B7C] line-clamp-1">{tar.descricao}</p>
                              <div className="flex items-center gap-2 mt-1 text-[10px]">
                                <span className="font-mono text-[#5B6B7C]">Prazo: {tar.dataLimite}</span>
                                <span className="text-[#5B6B7C]">·</span>
                                <span className={`font-semibold ${tar.grupoTemporal === 'Em Atraso' ? 'text-[#D32F2F]' : 'text-[#D99B24]'}`}>
                                  {tar.grupoTemporal}
                                </span>
                                {tar.obrigatoriaParaEncerramento && (
                                  <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 font-bold">
                                    Obrigatória ISO
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 2: FORMANDOS */}
              {activeTab === 'formandos' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Formandos Inscritos ({inscricoesCurso.length}/{selectedCourse.vagasMaximas})
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Pessoas singulares admitidas à turma</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('inscricoes')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--fortis-primary)] text-white hover:opacity-90 flex items-center gap-1"
                    >
                      <UserPlus size={13} />
                      <span>Inscrever Formando</span>
                    </button>
                  </div>

                  <DataTable>
                    <thead className="bg-[#F4F6F9] dark:bg-[#0B111B] text-[#5B6B7C] font-semibold border-b border-[#E3E8EF] dark:border-[#223347]">
                      <tr>
                        <th className="py-2 px-3">Formando</th>
                        <th className="py-2 px-3">Contacto</th>
                        <th className="py-2 px-3">Valor Pago</th>
                        <th className="py-2 px-3">Data Inscrição</th>
                        <th className="py-2 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8EF] dark:divide-[#223347] text-xs">
                      {inscricoesCurso.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[#5B6B7C]">
                            Nenhum formando inscrito nesta turma.
                          </td>
                        </tr>
                      ) : (
                        inscricoesCurso.map(i => (
                          <tr key={i.id}>
                            <td className="py-2.5 px-3 font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">
                              {i.formando.nomeCompleto}
                            </td>
                            <td className="py-2.5 px-3 text-[#5B6B7C]">{i.formando.email}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold tabular-nums text-[#16866A]">
                              {i.valorPago.toLocaleString()} Kz
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">{new Date(i.dataInscricao).toLocaleDateString()}</td>
                            <td className="py-2.5 px-3">
                              <StatusBadge variant="success">Confirmado</StatusBadge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </DataTable>
                </Card>
              )}

              {/* TAB 3: FORMADORES */}
              {activeTab === 'formadores' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Corpo Docente Atribuído ({formadoresCurso.length})
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Formadores credenciados e respetivas cargas horárias</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('formadores')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--fortis-primary)] text-white hover:opacity-90 flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Atribuir Formador</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formadoresCurso.length === 0 ? (
                      <p className="text-xs text-[#5B6B7C] py-4 col-span-2 text-center">Nenhum formador associado.</p>
                    ) : (
                      formadoresCurso.map(f => (
                        <div key={f.id} className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/50 dark:bg-[#0B111B]/50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-[#1B2A3A] dark:text-[#F1F5F9]">{f.pessoa.nomeCompleto}</p>
                            <p className="text-[11px] text-[#5B6B7C] capitalize">{f.papelFormacao.replace('_', ' ')} · {f.horasAtribuidas} horas</p>
                            <p className="text-[10px] text-[#5B6B7C]">{f.pessoa.email}</p>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                            {f.honorarioAcordado.toLocaleString()} Kz
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {/* TAB 4: PRESENÇAS / PAUTA */}
              {activeTab === 'presencas' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Sessões Calendarizadas & Folha de Pauta
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Registo de assiduidade por sessão</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('pauta')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--fortis-primary)] text-white hover:opacity-90 flex items-center gap-1"
                    >
                      <Printer size={13} />
                      <span>Abrir Pauta</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {sessoesCurso.length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title="Sem sessões registadas"
                        description="Agende a primeira sessão na opção Pauta do menu de operações."
                      />
                    ) : (
                      sessoesCurso.map(ses => (
                        <div key={ses.id} className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#D99B24]">Sessão {ses.numeroSessao}</span>
                            <span className="font-mono text-[#5B6B7C] ml-2">{ses.data} ({ses.horaInicio} às {ses.horaFim})</span>
                            <p className="text-[#1B2A3A] dark:text-[#F1F5F9] font-medium mt-0.5">{ses.sumarioTopicos}</p>
                          </div>
                          <StatusBadge variant="success">{ses.estadoSessao}</StatusBadge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {/* TAB 5: AVALIAÇÕES */}
              {activeTab === 'avaliacoes' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Resultados das Avaliações Pedagógicas
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Notas de conhecimentos e satisfação com desduplicação por formando</p>
                    </div>
                  </div>

                  <DataTable>
                    <thead className="bg-[#F4F6F9] dark:bg-[#0B111B] text-[#5B6B7C] font-semibold border-b border-[#E3E8EF] dark:border-[#223347]">
                      <tr>
                        <th className="py-2 px-3">Tipo de Avaliação</th>
                        <th className="py-2 px-3">Nota</th>
                        <th className="py-2 px-3">Escala</th>
                        <th className="py-2 px-3">Resultado</th>
                        <th className="py-2 px-3">Final?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8EF] dark:divide-[#223347] text-xs">
                      {avaliacoesCurso.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[#5B6B7C]">
                            Sem registos de avaliação lançados para esta ação.
                          </td>
                        </tr>
                      ) : (
                        avaliacoesCurso.map(a => (
                          <tr key={a.id}>
                            <td className="py-2.5 px-3 capitalize font-medium text-[#1B2A3A] dark:text-[#F1F5F9]">
                              {a.tipoAvaliacao.replace('_', ' ')}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold tabular-nums">
                              {a.notaNumerica}
                            </td>
                            <td className="py-2.5 px-3 text-[#5B6B7C]">{a.escala.replace('_', ' ')}</td>
                            <td className="py-2.5 px-3">
                              <StatusBadge variant={a.resultado === 'aprovado' ? 'success' : a.resultado === 'reprovado' ? 'danger' : 'neutral'}>
                                {a.resultado}
                              </StatusBadge>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#16866A]">
                              {a.eAvaliacaoFinal ? 'Sim (Auditada)' : 'Intercalar'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </DataTable>
                </Card>
              )}

              {/* TAB 6: FINANCEIRO */}
              {activeTab === 'financeiro' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Controlo Financeiro da Ação
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Orçamento vs Custos reais incorridos</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('custos')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--fortis-primary)] text-white hover:opacity-90 flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Registar Custo</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0B111B]">
                      <span className="text-[11px] text-[#5B6B7C] block">Orçamento Previsto</span>
                      <span className="text-base font-bold font-mono tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">
                        {selectedCourse.orcamentoPrevisto.toLocaleString()} Kz
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0B111B]">
                      <span className="text-[11px] text-[#5B6B7C] block">Custo Estimado</span>
                      <span className="text-base font-bold font-mono tabular-nums text-[#D32F2F]">
                        {selectedCourse.custoPrevisto.toLocaleString()} Kz
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {financasCurso.map(f => (
                      <div key={f.id} className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">{f.descricao}</p>
                          <p className="text-[10px] text-[#5B6B7C]">{f.data} · {f.categoria.replace('_', ' ')}</p>
                        </div>
                        <span className={`font-mono font-bold ${f.tipo === 'receita' ? 'text-[#16866A]' : 'text-[#D32F2F]'}`}>
                          {f.tipo === 'receita' ? '+' : '-'}{f.valor.toLocaleString()} Kz
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* TAB 7: QUALIDADE */}
              {activeTab === 'qualidade' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Gestão da Qualidade & Desvios Operacionais
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Conformidade ISO 9001 e tratamento de ocorrências</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('ocorrencias')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--fortis-primary)] text-white hover:opacity-90 flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Registar Ocorrência</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {ocorrenciasCurso.length === 0 ? (
                      <EmptyState
                        icon={CheckCircle2}
                        title="Sem não conformidades"
                        description="Nenhuma ocorrência ou desvio registado para esta ação de formação."
                      />
                    ) : (
                      ocorrenciasCurso.map(o => (
                        <div key={o.id} className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[11px] text-[#5B6B7C]">{o.codigo}</span>
                            <StatusBadge variant={o.estado === 'encerrada' ? 'success' : 'warning'}>
                              {o.estado.replace('_', ' ')}
                            </StatusBadge>
                          </div>
                          <p className="font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">{o.descricaoProblema}</p>
                          <p className="text-[10px] text-[#D99B24]">Tipo: {o.tipo.replace('_', ' ')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {/* TAB 8: DOCUMENTOS */}
              {activeTab === 'documentos' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Certificados Emitidos & Relatório Executivo
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Emissão com código de autenticidade QR Code</p>
                    </div>
                    <button
                      onClick={() => setActiveModal('certificados')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--fortis-secondary)] text-white hover:opacity-90 flex items-center gap-1"
                    >
                      <Award size={13} />
                      <span>Emitir Certificados</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {certificadosCurso.length === 0 ? (
                      <EmptyState
                        icon={Award}
                        title="Sem certificados emitidos"
                        description="Gere certificados para os formandos aprovados após o encerramento das avaliações."
                      />
                    ) : (
                      certificadosCurso.map(cert => (
                        <div key={cert.id} className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-[11px] text-[#1B2A3A] dark:text-[#F1F5F9]">{cert.codigoValidacao}</span>
                            <p className="text-[11px] text-[#5B6B7C]">Emitido em: {new Date(cert.dataEmissao).toLocaleDateString()} · {cert.cargaHoraria}h</p>
                          </div>
                          <StatusBadge variant="success">{cert.estado}</StatusBadge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {/* TAB 9: AUDITORIA */}
              {activeTab === 'auditoria' && (
                <Card padding="md" className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <div>
                      <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                        Pista de Auditoria & Encerramento Formal
                      </h3>
                      <p className="text-[11px] text-[#5B6B7C]">Rastreabilidade completa de todas as alterações operacionais</p>
                    </div>
                    <button
                      onClick={handleToggleClosure}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        selectedCourse.encerrado
                          ? 'bg-[#E8F5F1] text-[#16866A]'
                          : 'bg-[var(--fortis-primary)] text-white'
                      }`}
                    >
                      {selectedCourse.encerrado ? <Lock size={13} /> : <Unlock size={13} />}
                      <span>{selectedCourse.encerrado ? 'Reabrir Ação' : 'Encerrar Formalmente'}</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#E3E8EF] dark:divide-[#223347]">
                    {auditoriaCurso.length === 0 ? (
                      <p className="text-xs text-center py-4 text-[#5B6B7C]">Sem registos de auditoria específicos para esta ação.</p>
                    ) : (
                      auditoriaCurso.map(aud => (
                        <div key={aud.id} className="py-2.5 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">{aud.resumoAlteracao}</span>
                            <span className="font-mono text-[10px] text-[#5B6B7C]">{new Date(aud.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-[#5B6B7C]">Operação {aud.operacao} executada por {aud.autorNome}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center bg-white dark:bg-[#152232] rounded-xl border border-[#E3E8EF] dark:border-[#223347]">
            <BookOpen size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">
              Selecione uma ação na coluna esquerda para consultar os detalhes.
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: ATUALIZAR STATUS */}
      {activeModal === 'status' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-md w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <h3 className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9]">Atualizar Estado da Ação</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[#5B6B7C]">Selecione o novo estado de execução para {selectedCourse.nomeCurso}:</p>
            <div className="space-y-2">
              {[
                { id: 'agendado' as EstadoCurso, label: 'Agendado', desc: 'Planeamento e captação de formandos' },
                { id: 'em_andamento' as EstadoCurso, label: 'Em Andamento', desc: 'A decorrer em sala com aulas ativas' },
                { id: 'realizado' as EstadoCurso, label: 'Realizado', desc: 'Sessões concluídas com sucesso' },
                { id: 'cancelado' as EstadoCurso, label: 'Cancelado', desc: 'Ação descontinuada' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => handleUpdateStatus(st.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedCourse.estadoCurso === st.id
                      ? 'border-[var(--fortis-primary)] bg-[var(--fortis-primary-soft)]'
                      : 'border-[#E3E8EF] dark:border-[#223347] hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-bold text-xs text-[#1B2A3A] dark:text-[#F1F5F9]">{st.label}</p>
                  <p className="text-[11px] text-[#5B6B7C]">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INSCRIÇÕES NA AÇÃO */}
      {activeModal === 'inscricoes' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-lg w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <h3 className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9]">
                Inscrições e Vagas ({inscricoesCurso.length}/{selectedCourse.vagasMaximas})
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F6F9] dark:bg-[#0B111B] space-y-2">
              <span className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] block">
                Inscrever Formando Existente:
              </span>
              <div className="flex gap-2">
                <select
                  id="select-formando"
                  className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] text-[#1B2A3A] dark:text-[#F1F5F9]"
                >
                  {dataService.getPeople(currentOrg.id).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nomeCompleto} ({p.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const sel = document.getElementById('select-formando') as HTMLSelectElement;
                    if (sel) {
                      const res = dataService.enrollStudent(
                        selectedCourse.id,
                        sel.value,
                        selectedCourse.precoInscricao,
                        currentUser.id,
                        currentOrg.id
                      );
                      setStatusFeedback(res.message);
                      setTimeout(() => setStatusFeedback(null), 3000);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-[var(--fortis-primary)] hover:opacity-90"
                >
                  Inscrever
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inscricoesCurso.map(i => (
                <div key={i.id} className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">{i.formando.nomeCompleto}</p>
                    <p className="text-[10px] text-[#5B6B7C]">Inscrito a: {new Date(i.dataInscricao).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-[#16866A] font-mono">{i.valorPago.toLocaleString()} Kz</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PAUTA DE SESSÕES */}
      {activeModal === 'pauta' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-xl w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <div>
                <h3 className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9]">Pauta e Sessões da Ação</h3>
                <p className="text-[11px] text-[#5B6B7C]">{selectedCourse.nomeCurso}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {sessoesCurso.length > 0 ? (
                sessoesCurso.map(ses => (
                  <div key={ses.id} className="p-3 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D99B24]">
                        Sessão {ses.numeroSessao} · {ses.data} ({ses.horaInicio} às {ses.horaFim})
                      </span>
                      <StatusBadge variant="success">{ses.estadoSessao}</StatusBadge>
                    </div>
                    <p className="text-xs text-[#1B2A3A] dark:text-[#F1F5F9]">{ses.sumarioTopicos}</p>

                    <div className="pt-2 border-t border-[#E3E8EF]/60 dark:border-[#223347]/60 flex justify-between items-center text-xs">
                      <span className="text-[#5B6B7C]">Sala: {ses.salaEspecifica}</span>
                      <button
                        onClick={() => {
                          const novasPresencas = inscricoesCurso.map(i => ({
                            empresaId: currentOrg.id,
                            sessaoId: ses.id,
                            cursoId: selectedCourse.id,
                            formandoId: i.formandoId,
                            estado: 'presente' as const,
                            minutosAtraso: 0,
                          }));
                          dataService.saveAttendanceBatch(novasPresencas, currentUser.id);
                          setStatusFeedback(`Presenças da Sessão ${ses.numeroSessao} registadas.`);
                          setTimeout(() => setStatusFeedback(null), 3500);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
                      >
                        Marcar Presença Rápida
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-[#5B6B7C]">Nenhuma sessão agendada para esta ação.</p>
                  <button
                    onClick={() => {
                      dataService.createSession(
                        {
                          empresaId: currentOrg.id,
                          cursoId: selectedCourse.id,
                          numeroSessao: 1,
                          data: selectedCourse.dataInicio,
                          horaInicio: '14:00',
                          horaFim: '18:00',
                          sumarioTopicos: 'Introdução aos módulos e objetivos da ação.',
                          formadorPrincipalId: formadoresCurso[0]?.formadorId || currentUser.id,
                          salaEspecifica: selectedCourse.localSala,
                          estadoSessao: 'agendada',
                        },
                        currentUser.id
                      );
                      setStatusFeedback('Primeira sessão criada com sucesso.');
                      setTimeout(() => setStatusFeedback(null), 3000);
                    }}
                    className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-[var(--fortis-primary)]"
                  >
                    Agendar Sessão 01
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RESUMO INTELIGENTE */}
      {activeModal === 'resumo_ia' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-lg w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#D99B24]" />
                <h3 className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9]">Síntese da Ação de Formação</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3 text-xs leading-relaxed text-[#1B2A3A] dark:text-[#F1F5F9]">
              <p>
                <strong>Diagnóstico Pedagógico:</strong> A ação <em>{selectedCourse.nomeCurso}</em> possui atualmente <strong>{inscricoesCurso.length} formandos inscritos</strong> com taxa de conformidade documental avaliada em <strong>{selectedCourse.conformidadePercent}%</strong>.
              </p>
              <p>
                <strong>Recomendações ISO 9001:</strong> As sessões encontram-se alinhadas com o cronograma. Recomenda-se a conferência prévia da sala e dos equipamentos 48h antes do início da próxima sessão para prevenir desvios operacionais.
              </p>
              <p>
                <strong>Orçamento e Sustentabilidade:</strong> Orçamento alocado de {selectedCourse.orcamentoPrevisto.toLocaleString()} Kz suporta confortavelmente as horas atribuídas ao formador principal.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CRIAR NOVO CURSO */}
      {activeModal === 'novo_curso' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-lg w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <h3 className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9]">Adicionar Nova Ação de Formação</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] mb-1">
                  Nome da Formação
                </label>
                <input
                  type="text"
                  required
                  value={novoCursoForm.nomeCurso}
                  onChange={e => setNovoCursoForm(f => ({ ...f, nomeCurso: e.target.value }))}
                  placeholder="Ex: Gestão e Controlo da Qualidade Industrial"
                  className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] mb-1">
                    Período / Turno
                  </label>
                  <select
                    value={novoCursoForm.periodo}
                    onChange={e => setNovoCursoForm(f => ({ ...f, periodo: e.target.value as PeriodoTurno }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="sabado">Sábado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] mb-1">
                    Sala / Local
                  </label>
                  <input
                    type="text"
                    value={novoCursoForm.localSala}
                    onChange={e => setNovoCursoForm(f => ({ ...f, localSala: e.target.value }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    required
                    value={novoCursoForm.dataInicio}
                    onChange={e => setNovoCursoForm(f => ({ ...f, dataInicio: e.target.value }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    required
                    value={novoCursoForm.dataFim}
                    onChange={e => setNovoCursoForm(f => ({ ...f, dataFim: e.target.value }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] mb-1">
                    Vagas Máximas
                  </label>
                  <input
                    type="number"
                    value={novoCursoForm.vagasMaximas}
                    onChange={e => setNovoCursoForm(f => ({ ...f, vagasMaximas: Number(e.target.value) }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] mb-1">
                    Preço Inscrição (Kz)
                  </label>
                  <input
                    type="number"
                    value={novoCursoForm.precoInscricao}
                    onChange={e => setNovoCursoForm(f => ({ ...f, precoInscricao: Number(e.target.value) }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E8EF] dark:border-[#223347]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-[#5B6B7C] hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-[var(--fortis-primary)] hover:opacity-90"
                >
                  Criar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
