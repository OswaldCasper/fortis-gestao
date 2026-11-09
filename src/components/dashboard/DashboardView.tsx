/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * DashboardView: Centro de controlo executivo dinâmico com 6 áreas analíticas, 8 KPIs e 6 modos de visualização
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BookOpen,
  Users,
  CheckCircle2,
  TrendingUp,
  Star,
  Award,
  AlertTriangle,
  HeartHandshake,
  Calendar,
  Filter,
  RotateCcw,
  LayoutGrid,
  BarChart2,
  Table as TableIcon,
  CreditCard,
  PieChart,
  CalendarDays,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  DollarSign,
  GraduationCap,
  X,
  Search,
  CheckSquare,
  AlertCircle,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { FiltrosDashboard, Curso, EstadoCurso, TarefaChecklist } from '../../types';
import { ActiveModule } from '../layout/Sidebar';
import {
  Card,
  StatCard,
  StatusBadge,
  DataTable,
  EmptyState,
  Tabs,
  SegmentedControl,
} from '../ui';

interface DashboardViewProps {
  onNavigateModule: (module: ActiveModule) => void;
  onSelectCourse: (cursoId: string) => void;
}

type AreaAnalitica = 'visao_geral' | 'formandos' | 'formadores' | 'financeiro' | 'qualidade' | 'temporal';
type ModoVisualizacao = 'resumo' | 'graficos' | 'tabela' | 'cartoes' | 'progresso' | 'calendario';

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateModule,
  onSelectCourse,
}) => {
  const { currentUser, currentOrg } = useAuth();

  // Estado dos Filtros Globais Integrados
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    ano: '2026',
    meses: 'Todos',
    periodo: 'Todos',
    instituicao: 'Todas',
    cursoId: 'Todos',
    pesquisaTexto: '',
    categoria: 'Todas',
    formadorId: 'Todos',
    estadoCurso: 'Todos',
    encerrado: 'Todos',
  });

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const moreFiltersRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown de mais filtros ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(event.target as Node)) {
        setShowMoreFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Área analítica ativa
  const [areaAtiva, setAreaAtiva] = useState<AreaAnalitica>('visao_geral');

  // Modo de visualização ativo
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>('resumo');

  // Atualização reativa de tarefas e dados
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const unsub = dataService.subscribe(() => setVersion(v => v + 1));
    return unsub;
  }, []);

  // Dados filtrados e KPIs
  const cursosFiltrados = useMemo(() => {
    return dataService.getCourses(currentOrg.id, filtros);
  }, [currentOrg.id, filtros, version]);

  const kpis = useMemo(() => {
    return dataService.calculateDashboardKPIs(currentOrg.id, filtros);
  }, [currentOrg.id, filtros, version]);

  const monthlyEvolution = useMemo(() => {
    return dataService.getMonthlyEvolution(currentOrg.id, filtros);
  }, [currentOrg.id, filtros, version]);

  const statusDistribution = useMemo(() => {
    return dataService.getStatusDistribution(currentOrg.id, filtros);
  }, [currentOrg.id, filtros, version]);

  const formadores = useMemo(() => dataService.getTrainers(currentOrg.id), [currentOrg.id, version]);
  const pessoas = useMemo(() => dataService.getPeople(currentOrg.id), [currentOrg.id, version]);
  const todasTarefas = useMemo(() => dataService.getTasks(currentOrg.id), [currentOrg.id, version]);
  const ocorrencias = useMemo(() => dataService.getOccurrences(currentOrg.id), [currentOrg.id, version]);
  const financeiro = useMemo(() => dataService.getFinancialRecords(currentOrg.id), [currentOrg.id, version]);

  // Contagem de filtros extras ativos
  const activeExtraFiltersCount = useMemo(() => {
    let count = 0;
    if (filtros.estadoCurso !== 'Todos') count++;
    if (filtros.encerrado !== 'Todos') count++;
    if (filtros.formadorId !== 'Todos') count++;
    if (filtros.categoria !== 'Todas') count++;
    if (filtros.instituicao !== 'Todas') count++;
    if (filtros.pesquisaTexto && filtros.pesquisaTexto.trim().length > 0) count++;
    return count;
  }, [filtros]);

  const isFiltersDirty = useMemo(() => {
    return (
      filtros.ano !== 'Todos' ||
      filtros.meses !== 'Todos' ||
      filtros.periodo !== 'Todos' ||
      activeExtraFiltersCount > 0
    );
  }, [filtros, activeExtraFiltersCount]);

  const handleResetFilters = () => {
    setFiltros({
      ano: 'Todos',
      meses: 'Todos',
      periodo: 'Todos',
      instituicao: 'Todas',
      cursoId: 'Todos',
      pesquisaTexto: '',
      categoria: 'Todas',
      formadorId: 'Todos',
      estadoCurso: 'Todos',
      encerrado: 'Todos',
    });
  };

  // Toggle de tarefa diretamente na lista operacional
  const handleToggleTask = (taskId: string) => {
    dataService.toggleTaskState(taskId, currentUser.id);
  };

  // Tarefas operacionais: Em Atraso ou a vencer nos próximos 7 dias
  const tarefasOperacionais = useMemo(() => {
    return todasTarefas.filter(
      t => t.estado !== 'concluida' && (t.grupoTemporal === 'Em Atraso' || t.diasRestantes <= 7)
    );
  }, [todasTarefas]);

  // Próximas formações ordenadas
  const proximasFormacoes = useMemo(() => {
    return [...cursosFiltrados]
      .filter(c => c.estadoCurso === 'agendado' || c.estadoCurso === 'em_andamento')
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
      .slice(0, 4);
  }, [cursosFiltrados]);

  // Alertas de qualidade abertos
  const alertasQualidade = useMemo(() => {
    return ocorrencias
      .filter(o => o.estado !== 'encerrada')
      .slice(0, 3);
  }, [ocorrencias]);

  const anosDisponiveis = ['Todos', '2026', '2025', '2004'];
  const mesesNomes = [
    { id: 'Todos', label: 'Todos' },
    { id: '1', label: 'Jan' },
    { id: '2', label: 'Fev' },
    { id: '3', label: 'Mar' },
    { id: '4', label: 'Abr' },
    { id: '5', label: 'Mai' },
    { id: '6', label: 'Jun' },
    { id: '7', label: 'Jul' },
    { id: '8', label: 'Ago' },
    { id: '9', label: 'Set' },
    { id: '10', label: 'Out' },
    { id: '11', label: 'Nov' },
    { id: '12', label: 'Dez' },
  ];

  const dataAtualFormatada = useMemo(() => {
    const agora = new Date();
    return agora.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // Helper para badge de estado
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

  const areasAnaliticasTabs = [
    { id: 'visao_geral', label: 'Visão Geral' },
    { id: 'formandos', label: 'Formandos' },
    { id: 'formadores', label: 'Formadores' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'qualidade', label: 'Qualidade' },
    { id: 'temporal', label: 'Temporal' },
  ];

  const modosVisualizacaoOptions = [
    { value: 'resumo', label: 'Resumo', icon: LayoutGrid },
    { value: 'graficos', label: 'Gráficos', icon: BarChart2 },
    { value: 'tabela', label: 'Tabela', icon: TableIcon },
    { value: 'cartoes', label: 'Cartões', icon: CreditCard },
    { value: 'progresso', label: 'Progresso', icon: PieChart },
    { value: 'calendario', label: 'Calendário', icon: CalendarDays },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. TOPO COMPACTO — Regra: 1 linha, sem moldura pesada, único botão de destaque */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#1B2A3A] dark:text-[#F1F5F9]">
              Bom dia, {currentUser.nomeCompleto.split(' ')[0]}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E8F5F1] text-[#16866A] dark:bg-[#0C3328] dark:text-[#20A785]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16866A] dark:bg-[#20A785]" />
              Ativo
            </span>
          </div>
          <p className="text-xs text-[#5B6B7C] dark:text-[#94A3B8] capitalize">
            {currentOrg.designacao} · <span className="normal-case">{dataAtualFormatada}</span>
          </p>
        </div>

        {/* Único botão com destaque primário/secundário no ecrã */}
        <div className="shrink-0">
          <button
            onClick={() => onNavigateModule('cursos')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-xs transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--fortis-primary)]"
            style={{ backgroundColor: 'var(--fortis-secondary)' }}
          >
            <BookOpen size={15} />
            <span>Ver todos os cursos</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS — Compacta em 1 linha com popover de "Mais filtros" e chips */}
      <div className="bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl p-3 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Lado esquerdo: Filtros compactos principais */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#5B6B7C] dark:text-[#94A3B8] flex items-center gap-1.5 mr-1">
              <Filter size={13} className="text-[var(--fortis-primary)]" />
              <span>Filtros:</span>
            </span>

            {/* Select Ano */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-[#5B6B7C] dark:text-[#94A3B8]">Ano</span>
              <select
                value={filtros.ano}
                onChange={e => setFiltros(f => ({ ...f, ano: e.target.value }))}
                className="text-xs py-1 px-2 rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)]"
              >
                {anosDisponiveis.map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Mês */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-[#5B6B7C] dark:text-[#94A3B8]">Mês</span>
              <select
                value={filtros.meses}
                onChange={e => setFiltros(f => ({ ...f, meses: e.target.value }))}
                className="text-xs py-1 px-2 rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)]"
              >
                {mesesNomes.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Período */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-[#5B6B7C] dark:text-[#94A3B8]">Período</span>
              <select
                value={filtros.periodo}
                onChange={e => setFiltros(f => ({ ...f, periodo: e.target.value }))}
                className="text-xs py-1 px-2 rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)]"
              >
                <option value="Todos">Todos</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="sabado">Sábado</option>
              </select>
            </div>

            {/* Popover Mais Filtros */}
            <div className="relative" ref={moreFiltersRef}>
              <button
                type="button"
                onClick={() => setShowMoreFilters(v => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                  activeExtraFiltersCount > 0
                    ? 'border-[var(--fortis-primary)] text-[var(--fortis-primary)] bg-[var(--fortis-primary-soft)] font-semibold'
                    : 'border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] text-[#5B6B7C] dark:text-[#94A3B8] hover:border-slate-300'
                }`}
              >
                <SlidersHorizontal size={12} />
                <span>Mais filtros</span>
                {activeExtraFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[var(--fortis-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeExtraFiltersCount}
                  </span>
                )}
                <ChevronDown size={12} className={showMoreFilters ? 'rotate-180 transition-transform' : ''} />
              </button>

              {showMoreFilters && (
                <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 p-3.5 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl shadow-lg z-30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <span className="text-xs font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">
                      Filtros Adicionais
                    </span>
                    <button
                      onClick={() => setShowMoreFilters(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Estado do Curso */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8]">
                      Estado do Curso
                    </label>
                    <select
                      value={filtros.estadoCurso}
                      onChange={e => setFiltros(f => ({ ...f, estadoCurso: e.target.value }))}
                      className="w-full text-xs py-1 px-2 rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                    >
                      <option value="Todos">Todos</option>
                      <option value="agendado">Agendado</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="realizado">Realizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Encerramento Formal */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8]">
                      Encerramento Administrativo
                    </label>
                    <select
                      value={filtros.encerrado}
                      onChange={e => setFiltros(f => ({ ...f, encerrado: e.target.value }))}
                      className="w-full text-xs py-1 px-2 rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                    >
                      <option value="Todos">Todos</option>
                      <option value="apenas_abertos">Apenas Em Aberto</option>
                      <option value="apenas_encerrados">Apenas Encerrados</option>
                    </select>
                  </div>

                  {/* Formador */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8]">
                      Formador
                    </label>
                    <select
                      value={filtros.formadorId}
                      onChange={e => setFiltros(f => ({ ...f, formadorId: e.target.value }))}
                      className="w-full text-xs py-1 px-2 rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] truncate"
                    >
                      <option value="Todos">Todos os Formadores</option>
                      {formadores.map(form => (
                        <option key={form.id} value={form.id}>
                          {form.nomeCompleto}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pesquisa por Texto */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8]">
                      Pesquisa rápida
                    </label>
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={filtros.pesquisaTexto || ''}
                        onChange={e => setFiltros(f => ({ ...f, pesquisaTexto: e.target.value }))}
                        placeholder="Nome ou sala..."
                        className="w-full pl-7 pr-2 py-1 text-xs rounded-md border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lado direito: Limpar filtros */}
          {isFiltersDirty && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#5B6B7C] hover:text-[#D99B24] dark:hover:text-[#E8AA35] font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Chips de filtros ativos */}
        {isFiltersDirty && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E3E8EF]/60 dark:border-[#223347]/60 text-[11px]">
            <span className="text-[#5B6B7C] dark:text-[#94A3B8] font-medium text-[10px] uppercase tracking-wider mr-1">
              Ativos:
            </span>

            {filtros.ano !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9] font-medium">
                Ano: {filtros.ano}
                <button
                  onClick={() => setFiltros(f => ({ ...f, ano: 'Todos' }))}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {filtros.meses !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9] font-medium">
                Mês: {mesesNomes.find(m => m.id === filtros.meses)?.label}
                <button
                  onClick={() => setFiltros(f => ({ ...f, meses: 'Todos' }))}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {filtros.periodo !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9] font-medium capitalize">
                Período: {filtros.periodo}
                <button
                  onClick={() => setFiltros(f => ({ ...f, periodo: 'Todos' }))}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {filtros.estadoCurso !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9] font-medium capitalize">
                Estado: {filtros.estadoCurso.replace('_', ' ')}
                <button
                  onClick={() => setFiltros(f => ({ ...f, estadoCurso: 'Todos' }))}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {filtros.encerrado !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9] font-medium">
                {filtros.encerrado === 'apenas_encerrados' ? 'Encerrados' : 'Em Aberto'}
                <button
                  onClick={() => setFiltros(f => ({ ...f, encerrado: 'Todos' }))}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {filtros.formadorId !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9] font-medium">
                Formador
                <button
                  onClick={() => setFiltros(f => ({ ...f, formadorId: 'Todos' }))}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {filtros.pesquisaTexto && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9] font-medium">
                "{filtros.pesquisaTexto}"
                <button
                  onClick={() => setFiltros(f => ({ ...f, pesquisaTexto: '' }))}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. KPIS EM DOIS NÍVEIS */}
      <div className="space-y-3">
        {/* Nível 1: 4 Cards Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            label="Total de Ações"
            value={kpis.totalAcoes}
            subtext={`Ano ${filtros.ano === 'Todos' ? 'Global' : filtros.ano} · ${cursosFiltrados.length} registadas`}
            icon={BookOpen}
            onClick={() => onNavigateModule('cursos')}
          />
          <StatCard
            label="Taxa de Aprovação"
            value={kpis.formandosAvaliados > 0 ? `${kpis.taxaAprovacao}%` : 'Sem dados'}
            subtext="Desduplicado por formando"
            icon={TrendingUp}
            trend={
              kpis.formandosAvaliados > 0
                ? { value: `${kpis.taxaAprovacao}%`, isPositive: kpis.taxaAprovacao >= 70 }
                : undefined
            }
            onClick={() => onNavigateModule('avaliacoes')}
          />
          <StatCard
            label="Satisfação Média"
            value={kpis.satisfacaoMedia > 0 ? kpis.satisfacaoMedia.toFixed(1) : 'Sem dados'}
            subtext="Escala de 1 a 5"
            icon={Star}
            onClick={() => onNavigateModule('avaliacoes')}
          />
          <StatCard
            label="Certificados Emitidos"
            value={kpis.certificadosEmitidos > 0 ? kpis.certificadosEmitidos : 'Sem dados'}
            subtext="Emitidos com validação QR"
            icon={Award}
            onClick={() => onNavigateModule('certificados')}
          />
        </div>

        {/* Nível 2: Faixa de 4 Métricas Secundárias Compactas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card Secundário 1 */}
          <div
            onClick={() => onNavigateModule('formadores')}
            className="p-3 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--fortis-primary)] transition-colors"
          >
            <div>
              <span className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] uppercase block">
                Avaliação Formadores
              </span>
              <span className="text-lg font-bold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums">
                {kpis.avaliacaoFormadores > 0 ? kpis.avaliacaoFormadores.toFixed(1) : '—'}
              </span>
              <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8] block">Desempenho pedagógico</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)] flex items-center justify-center">
              <GraduationCap size={16} />
            </div>
          </div>

          {/* Card Secundário 2 */}
          <div
            onClick={() => onNavigateModule('formandos')}
            className="p-3 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--fortis-primary)] transition-colors"
          >
            <div>
              <span className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] uppercase block">
                Formandos Avaliados
              </span>
              <span className="text-lg font-bold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums">
                {kpis.formandosAvaliados}
              </span>
              <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8] block">Pessoas singulares</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>

          {/* Card Secundário 3 */}
          <div
            onClick={() => onNavigateModule('qualidade')}
            className="p-3 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--fortis-primary)] transition-colors"
          >
            <div>
              <span className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] uppercase block">
                Ocorrências de Qualidade
              </span>
              <span className="text-lg font-bold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums">
                {kpis.ocorrenciasTotal}
              </span>
              <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8] block">ISO 9001 e Desvios</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>

          {/* Card Secundário 4 */}
          <div
            onClick={() => onNavigateModule('avaliacoes')}
            className="p-3 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--fortis-primary)] transition-colors"
          >
            <div>
              <span className="text-[11px] font-semibold text-[#5B6B7C] dark:text-[#94A3B8] uppercase block">
                Taxa de Recomendação
              </span>
              <span className="text-lg font-bold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums">
                {kpis.taxaRecomendacao > 0 ? `${kpis.taxaRecomendacao}%` : '—'}
              </span>
              <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8] block">Respostas afirmativas</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <HeartHandshake size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. DUAS COLUNAS PRINCIPAIS: 2/3 (Analítica) + 1/3 (Operacional) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUNA ESQUERDA (2/3 — 8 colunas): Cartão único "Análise da formação" */}
        <div className="lg:col-span-8 space-y-4">
          <Card padding="md" className="space-y-4">
            {/* Cabeçalho do Cartão Analítico */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E3E8EF] dark:border-[#223347]">
              <div>
                <h2 className="text-sm font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                  Análise da formação
                </h2>
                <p className="text-xs text-[#5B6B7C] dark:text-[#94A3B8]">
                  Exploração multidimensional de indicadores e desempenho
                </p>
              </div>

              {/* SegmentedControl com os 6 Modos de Visualização */}
              <SegmentedControl
                options={modosVisualizacaoOptions}
                value={modoVisualizacao}
                onChange={v => setModoVisualizacao(v as ModoVisualizacao)}
                size="sm"
              />
            </div>

            {/* As 6 Áreas Analíticas como Tabs Sublinhadas */}
            <Tabs
              tabs={areasAnaliticasTabs}
              activeTab={areaAtiva}
              onChange={id => setAreaAtiva(id as AreaAnalitica)}
            />

            {/* CONTEÚDO ANALÍTICO DINÂMICO CONFORME MODO E ÁREA */}
            <div className="pt-2">
              {/* MODO 1: RESUMO */}
              {modoVisualizacao === 'resumo' && (
                <div className="space-y-4">
                  {/* Visão Geral: Distribuição das Ações + Aprovados vs Reprovados */}
                  {areaAtiva === 'visao_geral' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gráfico Donut de Estado das Ações */}
                        <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                              Estado das ações
                            </span>
                            <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8]">Distribuição</span>
                          </div>

                          <div className="flex items-center justify-center gap-6 py-3">
                            <div className="relative w-28 h-28">
                              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="none"
                                  stroke="#E3E8EF"
                                  strokeWidth="4"
                                  className="dark:stroke-[#223347]"
                                />
                                {(() => {
                                  const total = statusDistribution.reduce((acc, curr) => acc + curr.valor, 0) || 1;
                                  let accumulated = 0;
                                  return statusDistribution.map((item, idx) => {
                                    const percent = (item.valor / total) * 100;
                                    const strokeDasharray = `${percent} ${100 - percent}`;
                                    const strokeDashoffset = -accumulated;
                                    accumulated += percent;
                                    return (
                                      <circle
                                        key={idx}
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="none"
                                        stroke={item.cor}
                                        strokeWidth="4"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                      />
                                    );
                                  });
                                })()}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm font-bold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums">
                                  {kpis.totalAcoes}
                                </span>
                                <span className="text-[9px] text-[#5B6B7C] uppercase">Ações</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              {statusDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.cor }} />
                                  <span className="text-[#5B6B7C] dark:text-[#94A3B8] font-medium">{item.nome}:</span>
                                  <span className="font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">{item.valor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Comparativo de Desempenho Pedagógico */}
                        <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                                Aprovados vs. Reprovados
                              </span>
                              <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8]">Desempenho</span>
                            </div>

                            <div className="space-y-3 pt-1">
                              <div>
                                <div className="flex justify-between text-xs font-medium mb-1">
                                  <span className="text-[#16866A] dark:text-[#20A785] flex items-center gap-1.5">
                                    <CheckCircle2 size={13} />
                                    Aprovados
                                  </span>
                                  <span className="font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">
                                    {kpis.taxaAprovacao}%
                                  </span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                                  <div
                                    className="h-full bg-[#16866A] rounded-full transition-all duration-500"
                                    style={{ width: `${kpis.taxaAprovacao}%` }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-xs font-medium mb-1">
                                  <span className="text-[#D32F2F] dark:text-[#EF4444] flex items-center gap-1.5">
                                    <ShieldAlert size={13} />
                                    Reprovados ou Pendentes
                                  </span>
                                  <span className="font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">
                                    {Math.max(0, 100 - kpis.taxaAprovacao)}%
                                  </span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                                  <div
                                    className="h-full bg-[#D32F2F] rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(0, 100 - kpis.taxaAprovacao)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] mt-3">
                            Fórmula auditada com desduplicação por formando em avaliações finais válidas.
                          </p>
                        </div>
                      </div>

                      {/* Evolução Mensal das Formações */}
                      <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                              Evolução temporal das formações
                            </span>
                            <p className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8]">
                              Volume de ações calendarizadas por mês
                            </p>
                          </div>
                          <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)]">
                            Ano {filtros.ano}
                          </span>
                        </div>

                        <div className="pt-2">
                          <div className="flex items-end justify-between gap-1.5 h-28 px-1">
                            {monthlyEvolution.map((item, idx) => {
                              const maxVal = Math.max(...monthlyEvolution.map(m => m.acoes), 4);
                              const heightPercent = Math.max(12, Math.round((item.acoes / maxVal) * 100));

                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                                  <span className="text-[10px] font-bold text-[#1B2A3A] dark:text-[#F1F5F9] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                                    {item.acoes}
                                  </span>
                                  <div
                                    className="w-full rounded-md transition-all group-hover:brightness-110 shadow-xs"
                                    style={{
                                      height: `${heightPercent}%`,
                                      backgroundColor: 'var(--fortis-primary)',
                                    }}
                                  />
                                  <span className="text-[10px] text-[#5B6B7C] dark:text-[#94A3B8] font-medium">{item.mes}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Formandos */}
                  {areaAtiva === 'formandos' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Inscrições Totais</span>
                          <span className="text-xl font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">
                            {cursosFiltrados.reduce((acc, c) => acc + (c.vagasMaximas - 2), 0)}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Assiduidade Média</span>
                          <span className="text-xl font-bold tabular-nums text-[#16866A]">
                            89%
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Desistências</span>
                          <span className="text-xl font-bold tabular-nums text-[#D32F2F]">
                            3.2%
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                        <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-3">
                          Ocupação de Vagas por Curso Ativo
                        </h3>
                        <div className="space-y-2.5">
                          {cursosFiltrados.slice(0, 4).map(c => (
                            <div key={c.id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-[#1B2A3A] dark:text-[#F1F5F9] truncate">{c.nomeCurso}</span>
                                <span className="font-bold tabular-nums text-[#5B6B7C]">{c.vagasMaximas - 2} / {c.vagasMaximas} vagas</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                                <div className="h-full bg-[var(--fortis-primary)] rounded-full" style={{ width: `${Math.round(((c.vagasMaximas - 2) / c.vagasMaximas) * 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formadores */}
                  {areaAtiva === 'formadores' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Formadores Ativos</span>
                          <span className="text-xl font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">
                            {formadores.length}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Horas Ministradas</span>
                          <span className="text-xl font-bold tabular-nums text-[var(--fortis-primary)]">
                            480h
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Avaliação Média Docente</span>
                          <span className="text-xl font-bold tabular-nums text-[#16866A]">
                            {kpis.avaliacaoFormadores > 0 ? `${kpis.avaliacaoFormadores.toFixed(1)} / 5` : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                        <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-3">
                          Quadro de Formadores em Ação
                        </h3>
                        <div className="divide-y divide-[#E3E8EF] dark:divide-[#223347]">
                          {formadores.map(form => (
                            <div key={form.id} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)] flex items-center justify-center font-bold text-[11px]">
                                  {form.nomeCompleto[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">{form.nomeCompleto}</p>
                                  <p className="text-[10px] text-[#5B6B7C]">{form.email}</p>
                                </div>
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#16866A]">
                                4.8 / 5.0 ★
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financeiro */}
                  {areaAtiva === 'financeiro' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Orçamento Global Alocado</span>
                          <span className="text-lg font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">
                            {cursosFiltrados.reduce((acc, c) => acc + c.orcamentoPrevisto, 0).toLocaleString()} Kz
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Custos Totais Registados</span>
                          <span className="text-lg font-bold tabular-nums text-[#D32F2F]">
                            {financeiro.filter(f => f.tipo !== 'receita').reduce((acc, f) => acc + f.valor, 0).toLocaleString()} Kz
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Receitas Cobradas</span>
                          <span className="text-lg font-bold tabular-nums text-[#16866A]">
                            {financeiro.filter(f => f.tipo === 'receita').reduce((acc, f) => acc + f.valor, 0).toLocaleString()} Kz
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                        <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-3">
                          Últimos Registos Financeiros
                        </h3>
                        <div className="divide-y divide-[#E3E8EF] dark:divide-[#223347]">
                          {financeiro.slice(0, 4).map(f => (
                            <div key={f.id} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-medium text-[#1B2A3A] dark:text-[#F1F5F9]">{f.descricao}</p>
                                <p className="text-[10px] text-[#5B6B7C]">{f.data} · {f.categoria.replace('_', ' ')}</p>
                              </div>
                              <span className={`font-mono font-bold tabular-nums ${f.tipo === 'receita' ? 'text-[#16866A]' : 'text-[#D32F2F]'}`}>
                                {f.tipo === 'receita' ? '+' : '-'}{f.valor.toLocaleString()} Kz
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Qualidade */}
                  {areaAtiva === 'qualidade' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Conformidade ISO 9001</span>
                          <span className="text-xl font-bold tabular-nums text-[#16866A]">
                            94.2%
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Ocorrências Abertas</span>
                          <span className="text-xl font-bold tabular-nums text-[#D99B24]">
                            {ocorrencias.filter(o => o.estado !== 'encerrada').length}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                          <span className="text-[11px] text-[#5B6B7C] block">Ações Corretivas Fechadas</span>
                          <span className="text-xl font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">
                            {ocorrencias.filter(o => o.estado === 'encerrada').length}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                        <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-3">
                          Estado das Não Conformidades & Desvios
                        </h3>
                        <div className="space-y-2">
                          {ocorrencias.slice(0, 3).map(o => (
                            <div key={o.id} className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] flex items-center justify-between text-xs">
                              <div>
                                <span className="font-mono text-[10px] text-[#5B6B7C]">{o.codigo}</span>
                                <p className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] line-clamp-1">{o.descricaoProblema}</p>
                              </div>
                              <StatusBadge variant={o.estado === 'encerrada' ? 'success' : 'warning'}>
                                {o.estado.replace('_', ' ')}
                              </StatusBadge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Temporal */}
                  {areaAtiva === 'temporal' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                        <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-1">
                          Sazonalidade e Distribuição Trimestral
                        </h3>
                        <p className="text-[11px] text-[#5B6B7C] mb-4">
                          Agrupamento de ações por trimestre em {filtros.ano}
                        </p>
                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                            <span className="text-[11px] font-semibold text-[#5B6B7C] block">T1 (Jan-Mar)</span>
                            <span className="text-lg font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">4 Ações</span>
                          </div>
                          <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                            <span className="text-[11px] font-semibold text-[#5B6B7C] block">T2 (Abr-Jun)</span>
                            <span className="text-lg font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">8 Ações</span>
                          </div>
                          <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                            <span className="text-[11px] font-semibold text-[#5B6B7C] block">T3 (Jul-Set)</span>
                            <span className="text-lg font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">11 Ações</span>
                          </div>
                          <div className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232]">
                            <span className="text-[11px] font-semibold text-[#5B6B7C] block">T4 (Out-Dez)</span>
                            <span className="text-lg font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">10 Ações</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODO 2: GRÁFICOS */}
              {modoVisualizacao === 'graficos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                    <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-2">
                      Cursos por Categoria Formativa
                    </h3>
                    <div className="space-y-3 pt-2">
                      {[
                        { cat: 'Gestão & Liderança', val: 12, pct: 60 },
                        { cat: 'Tecnologias de Informação', val: 8, pct: 40 },
                        { cat: 'Qualidade ISO 9001', val: 7, pct: 35 },
                        { cat: 'Segurança & Ambiente', val: 6, pct: 30 },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#5B6B7C] dark:text-[#94A3B8]">{item.cat}</span>
                            <span className="font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">{item.val} ações</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                            <div className="h-full bg-[var(--fortis-primary)] rounded-full" style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60">
                    <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-2">
                      Assiduidade Média por Turno
                    </h3>
                    <div className="space-y-3 pt-2">
                      {[
                        { turno: 'Manhã', val: 92, cor: 'bg-[#16866A]' },
                        { turno: 'Tarde', val: 88, cor: 'bg-[var(--fortis-primary)]' },
                        { turno: 'Noite', val: 84, cor: 'bg-[#D99B24]' },
                        { turno: 'Sábado', val: 95, cor: 'bg-indigo-500' },
                      ].map((t, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#5B6B7C] dark:text-[#94A3B8]">Turno da {t.turno}</span>
                            <span className="font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">{t.val}% assiduidade</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                            <div className={`h-full ${t.cor} rounded-full`} style={{ width: `${t.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODO 3: TABELA */}
              {modoVisualizacao === 'tabela' && (
                <DataTable>
                  <thead className="bg-[#F4F6F9] dark:bg-[#0B111B] text-[#5B6B7C] dark:text-[#94A3B8] font-semibold border-b border-[#E3E8EF] dark:border-[#223347]">
                    <tr>
                      <th className="py-2.5 px-3">Nome da Formação</th>
                      <th className="py-2.5 px-3">Período / Sala</th>
                      <th className="py-2.5 px-3">Data Início</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Encerramento</th>
                      <th className="py-2.5 px-3">Progresso</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8EF] dark:divide-[#223347] text-[#1B2A3A] dark:text-[#F1F5F9]">
                    {cursosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[#5B6B7C]">
                          Nenhum curso encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      cursosFiltrados.map(curso => (
                        <tr key={curso.id} className="hover:bg-[#F4F6F9]/50 dark:hover:bg-[#0B111B]/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">
                            {curso.nomeCurso}
                          </td>
                          <td className="py-2.5 px-3 capitalize text-[#5B6B7C] dark:text-[#94A3B8]">
                            {curso.periodo} · {curso.localSala}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums font-mono text-xs">{curso.dataInicio}</td>
                          <td className="py-2.5 px-3">
                            <StatusBadge variant={getBadgeVariant(curso.estadoCurso)}>
                              {curso.estadoCurso.replace('_', ' ')}
                            </StatusBadge>
                          </td>
                          <td className="py-2.5 px-3">
                            {curso.encerrado ? (
                              <StatusBadge variant="success">Encerrado</StatusBadge>
                            ) : (
                              <StatusBadge variant="neutral">Em Aberto</StatusBadge>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                                <div
                                  className="h-full bg-[var(--fortis-secondary)] rounded-full"
                                  style={{ width: `${curso.progressoPercent}%` }}
                                />
                              </div>
                              <span className="tabular-nums font-mono text-[10px]">{curso.progressoPercent}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                onNavigateModule('cursos');
                                onSelectCourse(curso.id);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded text-[var(--fortis-primary)] hover:bg-[var(--fortis-primary-soft)] transition-colors"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </DataTable>
              )}

              {/* MODO 4: CARTÕES */}
              {modoVisualizacao === 'cartoes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {cursosFiltrados.map(curso => (
                    <div
                      key={curso.id}
                      onClick={() => {
                        onNavigateModule('cursos');
                        onSelectCourse(curso.id);
                      }}
                      className="p-3.5 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] shadow-xs hover:border-[var(--fortis-primary)] transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-[#1B2A3A] dark:text-[#F1F5F9] line-clamp-1">
                          {curso.nomeCurso}
                        </h4>
                        <StatusBadge variant={getBadgeVariant(curso.estadoCurso)}>
                          {curso.estadoCurso.replace('_', ' ')}
                        </StatusBadge>
                      </div>

                      <div className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] space-y-1">
                        <p className="flex items-center gap-1.5 capitalize">
                          <Clock size={12} />
                          <span>Turno da {curso.periodo} · {curso.localSala}</span>
                        </p>
                        <p className="flex items-center gap-1.5 tabular-nums font-mono text-[10px]">
                          <Calendar size={12} />
                          <span>{curso.dataInicio} a {curso.dataFim}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E3E8EF] dark:border-[#223347] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[#5B6B7C]">
                          <span>Progresso:</span>
                          <span className="font-bold tabular-nums text-[#1B2A3A] dark:text-[#F1F5F9]">{curso.progressoPercent}%</span>
                        </div>
                        <span className="text-[var(--fortis-primary)] font-semibold flex items-center gap-1 text-[11px]">
                          Aceder <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODO 5: PROGRESSO E CONFORMIDADE */}
              {modoVisualizacao === 'progresso' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 space-y-3">
                    <span className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                      Conformidade ISO 9001 das Ações
                    </span>
                    <p className="text-xs text-[#5B6B7C]">
                      Cumprimento rigoroso dos requisitos documentais e operacionais:
                    </p>
                    <div className="space-y-3 pt-2">
                      {cursosFiltrados.slice(0, 4).map(c => (
                        <div key={c.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="truncate text-[#1B2A3A] dark:text-[#F1F5F9]">{c.nomeCurso}</span>
                            <span
                              className="font-bold tabular-nums"
                              style={{ color: c.conformidadePercent >= 90 ? '#16866A' : '#D99B24' }}
                            >
                              {c.conformidadePercent}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#E3E8EF] dark:bg-[#223347] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${c.conformidadePercent}%`,
                                backgroundColor: c.conformidadePercent >= 90 ? '#16866A' : '#D99B24',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 space-y-3">
                    <span className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                      Metas Pedagógicas Concluídas
                    </span>
                    <p className="text-xs text-[#5B6B7C]">
                      Aproveitamento e validação de competências dos formandos:
                    </p>
                    <div className="flex items-center justify-around py-4">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full border-4 border-[#16866A] flex items-center justify-center font-bold text-lg text-[#16866A] tabular-nums">
                          {kpis.taxaAprovacao}%
                        </div>
                        <span className="block text-xs font-semibold mt-2 text-[#1B2A3A] dark:text-[#F1F5F9]">Aprovação</span>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full border-4 border-[var(--fortis-primary)] flex items-center justify-center font-bold text-lg text-[var(--fortis-primary)] tabular-nums">
                          89%
                        </div>
                        <span className="block text-xs font-semibold mt-2 text-[#1B2A3A] dark:text-[#F1F5F9]">Assiduidade</span>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full border-4 border-[#D99B24] flex items-center justify-center font-bold text-lg text-[#D99B24] tabular-nums">
                          {kpis.taxaRecomendacao}%
                        </div>
                        <span className="block text-xs font-semibold mt-2 text-[#1B2A3A] dark:text-[#F1F5F9]">Recomendação</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODO 6: CALENDÁRIO */}
              {modoVisualizacao === 'calendario' && (
                <div className="p-4 rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
                    <span className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                      Agenda de Ações Calendarizadas
                    </span>
                    <span className="text-xs text-[#5B6B7C]">Horários e Salas</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cursosFiltrados.map(curso => (
                      <div
                        key={curso.id}
                        onClick={() => {
                          onNavigateModule('cursos');
                          onSelectCourse(curso.id);
                        }}
                        className="p-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9]/60 dark:bg-[#0B111B]/60 space-y-1.5 cursor-pointer hover:border-[var(--fortis-primary)] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#D99B24] uppercase tracking-wide">
                            {curso.periodo}
                          </span>
                          <span className="text-[10px] text-[#5B6B7C]">{curso.localSala}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] line-clamp-1">
                          {curso.nomeCurso}
                        </p>
                        <p className="text-[11px] text-[#5B6B7C] font-mono tabular-nums">
                          {curso.dataInicio} a {curso.dataFim}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* COLUNA DIREITA (1/3 — 4 colunas): Zona Operacional com Dados Reais e EmptyState */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card Operacional 1: Próximas Formações */}
          <Card padding="sm" className="space-y-3">
            <div className="flex items-center justify-between px-1 pt-1">
              <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--fortis-primary)]" />
                <span>Próximas formações</span>
              </h3>
              <button
                onClick={() => onNavigateModule('cursos')}
                className="text-[11px] text-[var(--fortis-primary)] font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Ver todas</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {proximasFormacoes.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Sem próximas formações"
                description="Não existem ações com data agendada no período filtrado."
              />
            ) : (
              <div className="space-y-2">
                {proximasFormacoes.map(curso => (
                  <div
                    key={curso.id}
                    onClick={() => {
                      onNavigateModule('cursos');
                      onSelectCourse(curso.id);
                    }}
                    className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] hover:bg-[#F4F6F9]/60 dark:hover:bg-[#0B111B]/60 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className="text-xs font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] truncate">
                        {curso.nomeCurso}
                      </p>
                      <p className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] capitalize">
                        {curso.dataInicio} · Turno da {curso.periodo}
                      </p>
                    </div>
                    <StatusBadge variant={getBadgeVariant(curso.estadoCurso)}>
                      {curso.estadoCurso.replace('_', ' ')}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Card Operacional 2: Tarefas em atraso e a vencer */}
          <Card padding="sm" className="space-y-3">
            <div className="flex items-center justify-between px-1 pt-1">
              <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <CheckSquare size={14} className="text-[#D99B24]" />
                <span>Tarefas e Checklist</span>
              </h3>
              <button
                onClick={() => onNavigateModule('tarefas')}
                className="text-[11px] text-[var(--fortis-primary)] font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Ver checklist</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {tarefasOperacionais.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Tudo em dia"
                description="Não existem tarefas em atraso ou a vencer nos próximos 7 dias."
              />
            ) : (
              <div className="space-y-2">
                {tarefasOperacionais.slice(0, 4).map(tarefa => {
                  const isAtrasada = tarefa.grupoTemporal === 'Em Atraso';

                  return (
                    <div
                      key={tarefa.id}
                      className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] flex items-start gap-2.5 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTask(tarefa.id)}
                        className="mt-0.5 text-slate-300 hover:text-[var(--fortis-primary)] transition-colors shrink-0"
                        title="Marcar como concluída"
                      >
                        <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-[var(--fortis-primary)]" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] line-clamp-1">
                          {tarefa.titulo}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          <span
                            className={`font-semibold ${
                              isAtrasada ? 'text-[#D32F2F]' : 'text-[#D99B24]'
                            }`}
                          >
                            {isAtrasada ? 'Em Atraso' : `Vence em ${tarefa.diasRestantes} dias`}
                          </span>
                          <span className="text-[#5B6B7C]">·</span>
                          <span className="text-[#5B6B7C] truncate">{tarefa.responsavel.nomeCompleto}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Card Operacional 3: Alertas de Qualidade */}
          <Card padding="sm" className="space-y-3">
            <div className="flex items-center justify-between px-1 pt-1">
              <h3 className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-[#D32F2F]" />
                <span>Alertas de qualidade</span>
              </h3>
              <button
                onClick={() => onNavigateModule('qualidade')}
                className="text-[11px] text-[var(--fortis-primary)] font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Gerir</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {alertasQualidade.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Sem desvios ativos"
                description="Não existem ocorrências de qualidade em aberto na organização."
              />
            ) : (
              <div className="space-y-2">
                {alertasQualidade.map(alerta => (
                  <div
                    key={alerta.id}
                    onClick={() => onNavigateModule('qualidade')}
                    className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] hover:bg-[#F4F6F9]/60 dark:hover:bg-[#0B111B]/60 transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-semibold text-[#5B6B7C]">
                        {alerta.codigo}
                      </span>
                      <StatusBadge variant={alerta.tipo === 'nao_conformidade' ? 'danger' : 'warning'}>
                        {alerta.tipo.replace('_', ' ')}
                      </StatusBadge>
                    </div>
                    <p className="text-xs font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] line-clamp-1">
                      {alerta.descricaoProblema}
                    </p>
                    <p className="text-[10px] text-[#5B6B7C]">
                      Prazo: {alerta.prazoResolucao}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};
