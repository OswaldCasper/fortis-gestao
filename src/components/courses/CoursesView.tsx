/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * CoursesView: Master-Detail split view reproduzindo e elevando o sistema AppSheet (image 4 & 9)
 * Inclui os 12 botões operacionais, gestão de sessões, presenças, avaliações, certificados e conformidade
 */

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Curso, EstadoCurso } from '../../types';

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

export const CoursesView: React.FC<CoursesViewProps> = ({
  initialCourseId,
  initialActionModal = null,
  onOpenCertificates,
  onOpenTasks,
}) => {
  const { currentUser, currentOrg, activeRole, hasRole } = useAuth();

  // Cursos da organização
  const [courses, setCourses] = useState(() => dataService.getCourses(currentOrg.id));
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses.length > 0 ? courses[0].id : '')
  );

  // Filtros da coluna esquerda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('Todos');

  // Modal de ação ativo
  const [activeModal, setActiveModal] = useState<ActionModal>(initialActionModal);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Formulário de novo curso
  const [novoCursoForm, setNovoCursoForm] = useState({
    nomeCurso: '',
    periodo: 'tarde' as Curso['periodo'],
    localSala: 'Sala 01 - Principal',
    dataInicio: '2026-11-20',
    dataFim: '2026-12-15',
    vagasMaximas: 20,
    precoInscricao: 85000,
    orcamentoPrevisto: 1000000,
    custoPrevisto: 650000,
  });

  // Atualizar cursos quando o serviço notificar
  React.useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setCourses(dataService.getCourses(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Filtragem da lista
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = c.nomeCurso.toLowerCase().includes(searchTerm.toLowerCase()) || c.localSala.toLowerCase().includes(searchTerm.toLowerCase());
      const matchYear = selectedYear === 'Todos' || c.ano.toString() === selectedYear;
      const matchMonth = selectedMonth === 'Todos' || c.mes.toString() === selectedMonth;
      return matchSearch && matchYear && matchMonth;
    });
  }, [courses, searchTerm, selectedYear, selectedMonth]);

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
    const created = dataService.createCourse({
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
    }, currentUser.id);

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
        
        {/* COLUNA ESQUERDA: LISTA DE CURSOS COM ARVORE TEMPORAL (4 Colunas) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen size={16} style={{ color: 'var(--fortis-primary)' }} />
              <span>Cursos ({filteredCourses.length})</span>
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
              placeholder="Procurar cursos..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Árvore de Filtros Temporais (matching screenshot image 4: 2026, 2004, Meses) */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => { setSelectedYear('Todos'); setSelectedMonth('Todos'); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedYear === 'Todos' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedYear('2026')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedYear === '2026' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              2026 ({courses.filter(c => c.ano === 2026).length})
            </button>
            <button
              onClick={() => setSelectedYear('2025')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedYear === '2025' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Histórico
            </button>
          </div>

          {/* Lista de Cartões de Curso (Estilo AppSheet moderno) */}
          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredCourses.map(curso => {
              const isSelected = selectedCourse?.id === curso.id;

              return (
                <div
                  key={curso.id}
                  onClick={() => setSelectedCourseId(curso.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs ring-1 ring-amber-400/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Indicador Circular de Progresso */}
                    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {curso.progressoPercent}%
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {curso.nomeCurso}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                        Turno da {curso.periodo} · {curso.localSala}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {curso.dataInicio} a {curso.dataFim}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      curso.estadoCurso === 'realizado' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' :
                      curso.estadoCurso === 'em_andamento' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' :
                      curso.estadoCurso === 'agendado' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {curso.estadoCurso.replace('_', ' ')}
                    </span>

                    {curso.encerrado && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Lock size={10} /> Encerrado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: DETALHES DA AÇÃO (8 Colunas - Matching image_5324eb41.png) */}
        {selectedCourse ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Cabeçalho do Detalhe da Ação */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Detalhes da Ação de Formação
                  </span>
                  <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedCourse.nomeCurso}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModal('certificados')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Award size={14} />
                    <span>Gerar Certificados</span>
                  </button>

                  <button
                    onClick={handleToggleClosure}
                    title={selectedCourse.encerrado ? 'Reabrir Ação' : 'Encerrar Formalmente'}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                      selectedCourse.encerrado
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {selectedCourse.encerrado ? <Lock size={14} /> : <Unlock size={14} />}
                    <span>{selectedCourse.encerrado ? 'Encerrado' : 'Encerrar'}</span>
                  </button>
                </div>
              </div>

              {/* Informações Básicas Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Datas</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {selectedCourse.dataInicio} a {selectedCourse.dataFim}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Horário / Local</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {selectedCourse.periodo} · {selectedCourse.localSala}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Inscrições / Vagas</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {inscricoesCurso.length} / {selectedCourse.vagasMaximas}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Orçamento Previsto</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {selectedCourse.orcamentoPrevisto.toLocaleString()} Kz
                  </span>
                </div>
              </div>

              {/* OS 12 BOTÕES OPERACIONAIS (Fiel ao AppSheet image 9: CUSSI_FORTIS) */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Operações da Ação
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 text-center">
                  {[
                    { id: 'status' as ActionModal, label: 'Atualizar Status', icon: Clock, count: null },
                    { id: 'checklist' as ActionModal, label: 'Checklist', icon: CheckSquare, count: tarefasCurso.length },
                    { id: 'inscricoes' as ActionModal, label: 'Inscrições', icon: Users, count: inscricoesCurso.length },
                    { id: 'formadores' as ActionModal, label: 'Formadores', icon: GraduationCap, count: formadoresCurso.length },
                    { id: 'pauta' as ActionModal, label: 'Pauta', icon: FileText, count: sessoesCurso.length },
                    { id: 'ocorrencias' as ActionModal, label: 'Ocorrências', icon: AlertTriangle, count: null },
                    { id: 'custos' as ActionModal, label: 'Custos', icon: Wallet, count: null },
                    { id: 'avaliacoes' as ActionModal, label: 'Avaliações', icon: Award, count: avaliacoesCurso.length },
                    { id: 'certificados' as ActionModal, label: 'Certificados', icon: Award, count: certificadosCurso.length },
                    { id: 'relatorio' as ActionModal, label: 'Relatório', icon: FileCheck, count: null },
                    { id: 'encerramento' as ActionModal, label: 'Finalizar', icon: Lock, count: null },
                    { id: 'resumo_ia' as ActionModal, label: 'Resumo de IA', icon: Sparkles, count: null },
                  ].map(btn => {
                    const Icon = btn.icon;

                    return (
                      <button
                        key={btn.id}
                        onClick={() => setActiveModal(btn.id)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-amber-400 hover:shadow-xs transition-all group cursor-pointer"
                      >
                        <div 
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white mb-2 shadow-xs group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: 'var(--fortis-primary)' }}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {btn.label}
                        </span>
                        {btn.count !== null && (
                          <span className="text-[9px] text-slate-400 font-bold tabular-nums">
                            {btn.count} registos
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BARRAS DE STATUS E CONFORMIDADE DO CURSO (Matching image 9) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Status do Curso</span>
                    <span className="capitalize text-amber-600 dark:text-amber-400">
                      {selectedCourse.estadoCurso.replace('_', ' ')} ({selectedCourse.progressoPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(8, selectedCourse.progressoPercent)}%`,
                        backgroundColor: 'var(--fortis-primary)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Conformidade do Curso (ISO 9001)</span>
                    <span className="tabular-nums" style={{ color: selectedCourse.conformidadePercent >= 90 ? '#10B981' : '#F59E0B' }}>
                      {selectedCourse.conformidadePercent}% concluído
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${selectedCourse.conformidadePercent}%`,
                        backgroundColor: selectedCourse.conformidadePercent >= 90 ? '#10B981' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEPARADOR INFORMATIVO: FORMADORES & FORMANDOS ALOCADOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formadores Alocados */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-blue-500" />
                    <span>Formadores Atribuídos ({formadoresCurso.length})</span>
                  </span>
                  <button 
                    onClick={() => setActiveModal('formadores')}
                    className="text-[11px] text-amber-600 font-semibold hover:underline"
                  >
                    Gerir
                  </button>
                </div>
                <div className="space-y-2">
                  {formadoresCurso.length > 0 ? (
                    formadoresCurso.map(f => (
                      <div key={f.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{f.pessoa.nomeCompleto}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{f.papelFormacao.replace('_', ' ')} · {f.horasAtribuidas}h</p>
                        </div>
                        <span className="text-[10px] tabular-nums font-bold text-slate-700 dark:text-slate-300">
                          {f.honorarioAcordado.toLocaleString()} Kz
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-2">Nenhum formador associado a esta ação.</p>
                  )}
                </div>
              </div>

              {/* Formandos Inscritos */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-500" />
                    <span>Formandos Inscritos ({inscricoesCurso.length})</span>
                  </span>
                  <button 
                    onClick={() => setActiveModal('inscricoes')}
                    className="text-[11px] text-amber-600 font-semibold hover:underline"
                  >
                    Inscrever
                  </button>
                </div>
                <div className="space-y-2">
                  {inscricoesCurso.length > 0 ? (
                    inscricoesCurso.slice(0, 3).map(i => (
                      <div key={i.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{i.formando.nomeCompleto}</p>
                          <p className="text-[10px] text-slate-400">{i.formando.telefone} · {i.formando.email}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600">Confirmado</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-2">Nenhum formando inscrito até ao momento.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selecione uma ação na coluna esquerda para consultar os detalhes.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: ATUALIZAR STATUS */}
      {activeModal === 'status' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Atualizar Status da Ação</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <p className="text-xs text-slate-500">Selecione o novo estado de execução para {selectedCourse.nomeCurso}:</p>
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
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{st.label}</p>
                  <p className="text-[11px] text-slate-400">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHECKLIST DA AÇÃO */}
      {activeModal === 'checklist' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Checklist Pedagógico da Ação</h3>
                <p className="text-[11px] text-slate-400">{selectedCourse.nomeCurso}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tarefasCurso.map(tar => (
                <div
                  key={tar.id}
                  onClick={() => dataService.toggleTaskState(tar.id, currentUser.id)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tar.estado === 'concluida'}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${tar.estado === 'concluida' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {tar.titulo}
                    </p>
                    <p className="text-[11px] text-slate-400">{tar.descricao}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>Prazo: {tar.dataLimite}</span>
                      <span>·</span>
                      <span className="font-medium text-amber-600">{tar.grupoTemporal}</span>
                      {tar.obrigatoriaParaEncerramento && (
                        <span className="text-rose-500 font-semibold">Obrigatória ISO</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INSCRIÇÕES NA AÇÃO */}
      {activeModal === 'inscricoes' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Inscrições e Vagas ({inscricoesCurso.length}/{selectedCourse.vagasMaximas})</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            
            {/* Adicionar Formando Rápido */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Inscrever Formando Existente:</span>
              <div className="flex gap-2">
                <select
                  id="select-formando"
                  className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {dataService.getPeople(currentOrg.id).map(p => (
                    <option key={p.id} value={p.id}>{p.nomeCompleto} ({p.email})</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const sel = document.getElementById('select-formando') as HTMLSelectElement;
                    if (sel) {
                      const res = dataService.enrollStudent(selectedCourse.id, sel.value, selectedCourse.precoInscricao, currentUser.id, currentOrg.id);
                      setStatusFeedback(res.message);
                      setTimeout(() => setStatusFeedback(null), 3000);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-amber-600 hover:bg-amber-700"
                >
                  Inscrever
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inscricoesCurso.map(i => (
                <div key={i.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{i.formando.nomeCompleto}</p>
                    <p className="text-[10px] text-slate-400">Inscrito a: {new Date(i.dataInscricao).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-emerald-600">{i.valorPago.toLocaleString()} Kz</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PAUTA DE SESSÕES E PRESENÇAS */}
      {activeModal === 'pauta' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Pauta e Sessões da Ação</h3>
                <p className="text-[11px] text-slate-400">{selectedCourse.nomeCurso}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {sessoesCurso.length > 0 ? (
                sessoesCurso.map(ses => (
                  <div key={ses.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600">Sessão {ses.numeroSessao} · {ses.data} ({ses.horaInicio} às {ses.horaFim})</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{ses.estadoSessao}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{ses.sumarioTopicos}</p>
                    
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Sala: {ses.salaEspecifica}</span>
                      <button 
                        onClick={() => {
                          // Simular marcação de presenças para todos os inscritos
                          const novasPresencas = inscricoesCurso.map(i => ({
                            empresaId: currentOrg.id,
                            sessaoId: ses.id,
                            cursoId: selectedCourse.id,
                            formandoId: i.formandoId,
                            estado: 'presente' as const,
                            minutosAtraso: 0,
                          }));
                          dataService.saveAttendanceBatch(novasPresencas, currentUser.id);
                          setStatusFeedback(`Presenças da Sessão ${ses.numeroSessao} registadas para ${novasPresencas.length} formando(s).`);
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
                  <p className="text-xs text-slate-400">Nenhuma sessão agendada para esta ação.</p>
                  <button
                    onClick={() => {
                      dataService.createSession({
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
                      }, currentUser.id);
                      setStatusFeedback('Primeira sessão criada com sucesso.');
                      setTimeout(() => setStatusFeedback(null), 3000);
                    }}
                    className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-amber-600"
                  >
                    Agendar Sessão 01
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RESUMO DE IA */}
      {activeModal === 'resumo_ia' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Síntese Inteligente da Ação</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
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

      {/* MODAL 6: CRIAR NOVO CURSO */}
      {activeModal === 'novo_curso' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Adicionar Nova Ação de Formação</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleCreateCourseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Formação</label>
                <input
                  type="text"
                  required
                  value={novoCursoForm.nomeCurso}
                  onChange={e => setNovoCursoForm(f => ({ ...f, nomeCurso: e.target.value }))}
                  placeholder="Ex: Gestão e Controlo da Qualidade Industrial"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Período / Turno</label>
                  <select
                    value={novoCursoForm.periodo}
                    onChange={e => setNovoCursoForm(f => ({ ...f, periodo: e.target.value as any }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="sabado">Sábado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Sala / Local</label>
                  <input
                    type="text"
                    value={novoCursoForm.localSala}
                    onChange={e => setNovoCursoForm(f => ({ ...f, localSala: e.target.value }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={novoCursoForm.dataInicio}
                    onChange={e => setNovoCursoForm(f => ({ ...f, dataInicio: e.target.value }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Fim</label>
                  <input
                    type="date"
                    required
                    value={novoCursoForm.dataFim}
                    onChange={e => setNovoCursoForm(f => ({ ...f, dataFim: e.target.value }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Vagas Máximas</label>
                  <input
                    type="number"
                    value={novoCursoForm.vagasMaximas}
                    onChange={e => setNovoCursoForm(f => ({ ...f, vagasMaximas: Number(e.target.value) }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Preço Inscrição (Kz)</label>
                  <input
                    type="number"
                    value={novoCursoForm.precoInscricao}
                    onChange={e => setNovoCursoForm(f => ({ ...f, precoInscricao: Number(e.target.value) }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-amber-600 hover:bg-amber-700"
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
