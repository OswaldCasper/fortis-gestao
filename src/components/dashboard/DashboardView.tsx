/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * DashboardView: Centro de controlo executivo dinâmico com 6 áreas analíticas, 8 KPIs matemáticos e 6 modos de visualização
 */

import React, { useState, useMemo } from 'react';
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
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { FiltrosDashboard, Curso } from '../../types';
import { ActiveModule } from '../layout/Sidebar';

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

  // Área analítica ativa (matching image_50b58b17.png: Visão Geral, Formandos, Formadores, Financeiro, Qualidade, Temporal)
  const [areaAtiva, setAreaAtiva] = useState<AreaAnalitica>('visao_geral');

  // Modo de visualização ativo (matching image_605a31ae.png: Resumo, Gráficos, Tabela, Cartões, Progresso, Calendário)
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>('resumo');

  // Dados filtrados e KPIs
  const cursosFiltrados = useMemo(() => {
    return dataService.getCourses(currentOrg.id, filtros);
  }, [currentOrg.id, filtros]);

  const kpis = useMemo(() => {
    return dataService.calculateDashboardKPIs(currentOrg.id, filtros);
  }, [currentOrg.id, filtros]);

  const monthlyEvolution = useMemo(() => {
    return dataService.getMonthlyEvolution(currentOrg.id, filtros);
  }, [currentOrg.id, filtros]);

  const statusDistribution = useMemo(() => {
    return dataService.getStatusDistribution(currentOrg.id, filtros);
  }, [currentOrg.id, filtros]);

  const formadores = useMemo(() => dataService.getTrainers(currentOrg.id), [currentOrg.id]);
  const pessoas = useMemo(() => dataService.getPeople(currentOrg.id), [currentOrg.id]);
  const tarefas = useMemo(() => dataService.getTasks(currentOrg.id), [currentOrg.id]);
  const financeiro = useMemo(() => dataService.getFinancialRecords(currentOrg.id), [currentOrg.id]);
  const ocorrencias = useMemo(() => dataService.getOccurrences(currentOrg.id), [currentOrg.id]);

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

  // Anos disponíveis para filtro
  const anosDisponiveis = ['Todos', '2026', '2025', '2004'];
  const mesesNomes = ['Todos', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. CABEÇALHO DO DASHBOARD (Fiel à Maquete) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Bom dia, {currentUser.nomeCompleto.split(' ')[0]}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sistema ativo
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>Visão geral da organização · {new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{currentOrg.designacao}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateModule('cursos')}
            className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all hover:opacity-95 flex items-center gap-2"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            <BookOpen size={14} />
            <span>Ver Todos os Cursos</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS GLOBAIS INTEGRADOS (Preservando a imagem de referência) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter size={14} style={{ color: 'var(--fortis-primary)' }} />
            <span>Filtros Globais Integrados</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
          >
            <RotateCcw size={13} />
            <span>Limpar filtros</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* Ano */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Ano
            </label>
            <select
              value={filtros.ano}
              onChange={e => setFiltros(f => ({ ...f, ano: e.target.value }))}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              {anosDisponiveis.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Meses */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Meses
            </label>
            <select
              value={filtros.meses}
              onChange={e => setFiltros(f => ({ ...f, meses: e.target.value }))}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              {mesesNomes.map((m, idx) => (
                <option key={m} value={idx === 0 ? 'Todos' : idx.toString()}>{m}</option>
              ))}
            </select>
          </div>

          {/* Período / Turno */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={e => setFiltros(f => ({ ...f, periodo: e.target.value }))}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="Todos">Todos</option>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
              <option value="sabado">Sábado</option>
            </select>
          </div>

          {/* Estado do Curso */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Estado
            </label>
            <select
              value={filtros.estadoCurso}
              onChange={e => setFiltros(f => ({ ...f, estadoCurso: e.target.value }))}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="Todos">Todos</option>
              <option value="agendado">Agendado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Encerramento Formal */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Encerramento
            </label>
            <select
              value={filtros.encerrado}
              onChange={e => setFiltros(f => ({ ...f, encerrado: e.target.value }))}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="Todos">Todos</option>
              <option value="apenas_abertos">Apenas Em Aberto</option>
              <option value="apenas_encerrados">Apenas Encerrados</option>
            </select>
          </div>

          {/* Formador */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Formador
            </label>
            <select
              value={filtros.formadorId}
              onChange={e => setFiltros(f => ({ ...f, formadorId: e.target.value }))}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium truncate"
            >
              <option value="Todos">Todos</option>
              {formadores.map(form => (
                <option key={form.id} value={form.id}>{form.nomeCompleto.split(' ')[0]} {form.nomeCompleto.split(' ').slice(-1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. NAVEGAÇÃO DAS 6 ÁREAS ANALÍTICAS (matching image_50b58b17.png) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'visao_geral' as AreaAnalitica, label: 'Visão Geral' },
          { id: 'formandos' as AreaAnalitica, label: 'Formandos' },
          { id: 'formadores' as AreaAnalitica, label: 'Formadores' },
          { id: 'financeiro' as AreaAnalitica, label: 'Financeiro' },
          { id: 'qualidade' as AreaAnalitica, label: 'Qualidade' },
          { id: 'temporal' as AreaAnalitica, label: 'Temporal' },
        ].map(area => {
          const isActive = areaAtiva === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setAreaAtiva(area.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {area.label}
            </button>
          );
        })}
      </div>

      {/* 4. OS 8 INDICADORES PRINCIPAIS DA VISÃO GERAL (4x2 Grid como na referência real) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Total de Ações */}
        <div 
          onClick={() => onNavigateModule('cursos')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total de ações</span>
            <BookOpen size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.totalAcoes}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Ano {filtros.ano}</span>
          </p>
        </div>

        {/* Card 2: Taxa de Aprovação */}
        <div 
          onClick={() => onNavigateModule('avaliacoes')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Taxa de aprovação</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.taxaAprovacao}%
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Desduplicado por formando
          </p>
        </div>

        {/* Card 3: Satisfação Média */}
        <div 
          onClick={() => onNavigateModule('avaliacoes')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Satisfação média</span>
            <Star size={16} className="text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.satisfacaoMedia > 0 ? kpis.satisfacaoMedia.toFixed(1) : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Escala de 1 a 5
          </p>
        </div>

        {/* Card 4: Avaliação de Formadores */}
        <div 
          onClick={() => onNavigateModule('formadores')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Avaliação formadores</span>
            <GraduationCap size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.avaliacaoFormadores > 0 ? kpis.avaliacaoFormadores.toFixed(1) : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Desempenho pedagógico
          </p>
        </div>

        {/* Card 5: Formandos Avaliados */}
        <div 
          onClick={() => onNavigateModule('formandos')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Formandos avaliados</span>
            <Users size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.formandosAvaliados}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Pessoas físicas únicas
          </p>
        </div>

        {/* Card 6: Certificados */}
        <div 
          onClick={() => onNavigateModule('certificados')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Certificados</span>
            <Award size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.certificadosEmitidos > 0 ? kpis.certificadosEmitidos : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Emitidos com QR Code
          </p>
        </div>

        {/* Card 7: Ocorrências ISO 9001 */}
        <div 
          onClick={() => onNavigateModule('qualidade')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Ocorrências</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.ocorrenciasTotal}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Qualidade & Desvios
          </p>
        </div>

        {/* Card 8: Taxa de Recomendação */}
        <div 
          onClick={() => onNavigateModule('avaliacoes')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Recomendação</span>
            <HeartHandshake size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {kpis.taxaRecomendacao > 0 ? `${kpis.taxaRecomendacao}%` : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Respostas afirmativas
          </p>
        </div>
      </div>

      {/* 5. SELETOR DE MODOS DE VISUALIZAÇÃO ("Análise da formação" - Fiel à Maquete image_605a31ae.png) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Análise da formação</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explorar dados através de:</p>
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Dinâmico
          </span>
        </div>

        {/* Grid dos 6 Modos de Apresentação */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { id: 'resumo' as ModoVisualizacao, label: 'Resumo', icon: LayoutGrid },
            { id: 'graficos' as ModoVisualizacao, label: 'Gráficos', icon: BarChart2 },
            { id: 'tabela' as ModoVisualizacao, label: 'Tabela', icon: TableIcon },
            { id: 'cartoes' as ModoVisualizacao, label: 'Cartões', icon: CreditCard },
            { id: 'progresso' as ModoVisualizacao, label: 'Progresso', icon: PieChart },
            { id: 'calendario' as ModoVisualizacao, label: 'Calendário', icon: CalendarDays },
          ].map(modo => {
            const Icon = modo.icon;
            const isSelected = modoVisualizacao === modo.id;

            return (
              <button
                key={modo.id}
                onClick={() => setModoVisualizacao(modo.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-semibold ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon
                  size={18}
                  className="mb-1.5"
                  style={{ color: isSelected ? 'var(--fortis-primary)' : undefined }}
                />
                <span>{modo.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO DINÂMICO CONFORME O MODO SELECIONADO */}
        <div className="pt-2">
          {/* MODO 1: RESUMO (Distribuição e Evolução Mensal - Matching image_50b58b17.png) */}
          {modoVisualizacao === 'resumo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gráfico Circular: Estado das Ações */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Estado das ações</span>
                    <span className="text-[10px] text-slate-400">Distribuição</span>
                  </div>
                  <div className="flex items-center justify-center gap-6 py-4">
                    {/* SVG Donut Chart */}
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        {/* Background track */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4" className="dark:stroke-slate-800" />
                        {/* Segments */}
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
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{kpis.totalAcoes}</span>
                        <span className="text-[9px] text-slate-400 uppercase">Ações</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {statusDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.cor }} />
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{item.nome}:</span>
                          <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{item.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gráfico Comparativo: Aprovados vs. Reprovados */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Aprovados vs. Reprovados</span>
                    <span className="text-[10px] text-slate-400">Desempenho</span>
                  </div>
                  <div className="py-3 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          Aprovados
                        </span>
                        <span className="font-bold tabular-nums">{kpis.taxaAprovacao}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${kpis.taxaAprovacao}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <ShieldAlert size={13} />
                          Reprovados ou Pendentes
                        </span>
                        <span className="font-bold tabular-nums">{100 - kpis.taxaAprovacao}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(0, 100 - kpis.taxaAprovacao)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      Baseado em avaliações finais de conhecimentos registadas no período filtrado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Evolução Mensal (As Barras Douradas da Maquete image_605a31ae.png) */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Evolução das formações</span>
                    <p className="text-[11px] text-slate-400">Ações por mês</p>
                  </div>
                  <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                    {filtros.ano}
                  </span>
                </div>

                {/* SVG Bar Chart Interativo com Cor Dourada */}
                <div className="pt-2">
                  <div className="flex items-end justify-between gap-1.5 h-28 px-1">
                    {monthlyEvolution.map((item, idx) => {
                      const maxVal = Math.max(...monthlyEvolution.map(m => m.acoes), 4);
                      const heightPercent = Math.max(12, Math.round((item.acoes / maxVal) * 100));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                            {item.acoes}
                          </span>
                          <div
                            className="w-full rounded-md transition-all group-hover:brightness-110 shadow-xs"
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: 'var(--fortis-primary)',
                            }}
                          />
                          <span className="text-[10px] text-slate-400 font-medium">{item.mes}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODO 2: GRÁFICOS */}
          {modoVisualizacao === 'graficos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Cursos por Categoria</h3>
                <div className="space-y-2 pt-2">
                  {['Gestão & Operações', 'Tecnologias de Informação', 'Qualidade & Auditoria', 'Segurança & Ambiente'].map((cat, idx) => {
                    const count = cursosFiltrados.filter(c => {
                      const catInfo = dataService.getCourses().find(curr => curr.id === c.id);
                      return idx % 2 === 0 ? c.nomeCurso.includes('Gestão') : true;
                    }).length;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span>{cat}</span>
                          <span className="font-bold tabular-nums">{count} ações</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, count * 25)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Assiduidade Média por Turno</h3>
                <div className="space-y-3 pt-2">
                  {[
                    { turno: 'Manhã', val: 92, cor: 'bg-emerald-500' },
                    { turno: 'Tarde', val: 88, cor: 'bg-blue-500' },
                    { turno: 'Noite', val: 84, cor: 'bg-amber-500' },
                  ].map((t, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Turno da {t.turno}</span>
                        <span className="font-bold tabular-nums">{t.val}% assiduidade</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
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
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Nome da Formação</th>
                    <th className="py-2.5 px-3">Período</th>
                    <th className="py-2.5 px-3">Data Início</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Encerramento</th>
                    <th className="py-2.5 px-3">Progresso</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {cursosFiltrados.map(curso => (
                    <tr key={curso.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {curso.nomeCurso}
                      </td>
                      <td className="py-2.5 px-3 capitalize">{curso.periodo}</td>
                      <td className="py-2.5 px-3 tabular-nums">{curso.dataInicio}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          curso.estadoCurso === 'realizado' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' :
                          curso.estadoCurso === 'em_andamento' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' :
                          curso.estadoCurso === 'agendado' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {curso.estadoCurso.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {curso.encerrado ? (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Encerrado</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Em Aberto</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${curso.progressoPercent}%` }} />
                          </div>
                          <span className="tabular-nums text-[10px]">{curso.progressoPercent}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            onNavigateModule('cursos');
                            onSelectCourse(curso.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium rounded text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MODO 4: CARTÕES */}
          {modoVisualizacao === 'cartoes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {cursosFiltrados.map(curso => (
                <div
                  key={curso.id}
                  onClick={() => {
                    onNavigateModule('cursos');
                    onSelectCourse(curso.id);
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-amber-400 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                      {curso.nomeCurso}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                      curso.estadoCurso === 'realizado' ? 'bg-emerald-100 text-emerald-800' :
                      curso.estadoCurso === 'em_andamento' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {curso.estadoCurso.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span className="capitalize">{curso.periodo} · {curso.localSala}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{curso.dataInicio} até {curso.dataFim}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Progresso:</span>
                      <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">{curso.progressoPercent}%</span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
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
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Conformidade ISO 9001 das Ações</span>
                <p className="text-xs text-slate-500">Indicadores de cumprimento dos requisitos documentais e operacionais:</p>
                <div className="space-y-3 pt-2">
                  {cursosFiltrados.slice(0, 4).map(c => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="truncate">{c.nomeCurso}</span>
                        <span className="font-bold tabular-nums" style={{ color: c.conformidadePercent >= 90 ? '#10B981' : '#F59E0B' }}>
                          {c.conformidadePercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${c.conformidadePercent}%`,
                            backgroundColor: c.conformidadePercent >= 90 ? '#10B981' : '#F59E0B',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Metas Pedagógicas Concluídas</span>
                <p className="text-xs text-slate-500">Aproveitamento e validação de competências:</p>
                <div className="flex items-center justify-around py-4">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      {kpis.taxaAprovacao}%
                    </div>
                    <span className="block text-xs font-semibold mt-2">Aprovação</span>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-lg text-blue-600 dark:text-blue-400">
                      89%
                    </div>
                    <span className="block text-xs font-semibold mt-2">Assiduidade</span>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex items-center justify-center font-bold text-lg text-amber-600 dark:text-amber-400">
                      {kpis.taxaRecomendacao}%
                    </div>
                    <span className="block text-xs font-semibold mt-2">Recomendação</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODO 6: CALENDÁRIO */}
          {modoVisualizacao === 'calendario' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Agenda de Novembro de 2026</span>
                <span className="text-xs text-slate-400">Horários e Salas</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cursosFiltrados.map(curso => (
                  <div key={curso.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                        {curso.periodo}
                      </span>
                      <span className="text-[10px] text-slate-400">{curso.localSala}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{curso.nomeCurso}</p>
                    <p className="text-[11px] text-slate-500">{curso.dataInicio} a {curso.dataFim}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. ATIVIDADE RECENTE E PENDÊNCIAS OPERACIONAIS (Fiel à Maquete image_605a31ae.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Próximas Formações */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" />
              <span>Próximas formações</span>
            </h3>
            <button
              onClick={() => onNavigateModule('cursos')}
              className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-0.5"
            >
              <span>Ver agenda</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="space-y-2">
            {cursosFiltrados.slice(0, 3).map(curso => (
              <div
                key={curso.id}
                onClick={() => {
                  onNavigateModule('cursos');
                  onSelectCourse(curso.id);
                }}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{curso.nomeCurso}</p>
                  <p className="text-[11px] text-slate-400">Início: {curso.dataInicio} · {curso.periodo}</p>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Pendências Operacionais */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle size={14} className="text-rose-500" />
              <span>Pendências operacionais</span>
            </h3>
            <button
              onClick={() => onNavigateModule('tarefas')}
              className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-0.5"
            >
              <span>Ver checklist</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="space-y-2">
            <div 
              onClick={() => onNavigateModule('tarefas')}
              className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">6 Tarefas Pedagógicas</p>
                  <p className="text-[11px] text-slate-400">Envio de documentação e preparação de salas</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-600">Acompanhar</span>
            </div>

            <div 
              onClick={() => onNavigateModule('cursos')}
              className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">1 Curso por Encerrar Formalmente</p>
                  <p className="text-[11px] text-slate-400">Gestão da Qualidade ISO 9001 (Realizado)</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-600">Encerrar</span>
            </div>

            <div 
              onClick={() => onNavigateModule('qualidade')}
              className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">2 Ocorrências em Tratamento</p>
                  <p className="text-[11px] text-slate-400">Ações corretivas ISO 9001 com prazo</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-600">Gerir</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
