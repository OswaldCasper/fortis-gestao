/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * QualityView: Módulo de Qualidade e Gestão de Não Conformidades baseado na ISO 9001
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Ocorrencia, TipoOcorrencia, EstadoOcorrencia } from '../../types';

export const QualityView: React.FC = () => {
  const { currentUser, currentOrg, hasRole } = useAuth();
  const [occurrences, setOccurrences] = useState(() => dataService.getOccurrences(currentOrg.id));
  const [filterState, setFilterState] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOc, setSelectedOc] = useState<Ocorrencia | null>(null);

  const [newOcForm, setNewOcForm] = useState({
    cursoId: '',
    tipo: 'nao_conformidade' as TipoOcorrencia,
    origem: 'auditoria' as Ocorrencia['origem'],
    descricaoProblema: '',
    causaRaiz: '',
    acaoCorretiva: '',
    prazoResolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  React.useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setOccurrences(dataService.getOccurrences(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const courses = dataService.getCourses(currentOrg.id);

  const filteredOccurrences = occurrences.filter(o => {
    const matchState = filterState === 'todos' || o.estado === filterState;
    const matchSearch = o.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.descricaoProblema.toLowerCase().includes(searchTerm.toLowerCase());
    return matchState && matchSearch;
  });

  const handleCreateOc = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveOccurrence({
      empresaId: currentOrg.id,
      cursoId: newOcForm.cursoId || undefined,
      tipo: newOcForm.tipo,
      origem: newOcForm.origem,
      descricaoProblema: newOcForm.descricaoProblema,
      causaRaiz: newOcForm.causaRaiz,
      acaoCorretiva: newOcForm.acaoCorretiva,
      responsavelId: currentUser.id,
      prazoResolucao: newOcForm.prazoResolucao,
      estado: 'aberta',
    }, currentUser.id);

    setShowAddModal(false);
    setNewOcForm({
      cursoId: '',
      tipo: 'nao_conformidade',
      origem: 'auditoria',
      descricaoProblema: '',
      causaRaiz: '',
      acaoCorretiva: '',
      prazoResolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const handleCloseOc = (ocId: string) => {
    dataService.updateOccurrence(ocId, {
      estado: 'encerrada',
      dataEncerramento: new Date().toISOString(),
      encerradoPor: currentUser.id,
      avaliacaoEficacia: 'Ação corretiva verificada e comprovada a sua eficácia segundo os padrões ISO 9001.',
    }, currentUser.id);
    setSelectedOc(null);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            <span>Qualidade & Não Conformidades (ISO 9001)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rastreabilidade de desvios operacionais, análise de causa-raiz e planos de ação corretiva
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm hover:opacity-95 flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: 'var(--fortis-primary)' }}
        >
          <Plus size={14} />
          <span>Registar Ocorrência</span>
        </button>
      </div>

      {/* KPIs de Qualidade */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Total Registadas</span>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">{occurrences.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-amber-500 font-medium">Em Tratamento</span>
          <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {occurrences.filter(o => o.estado === 'em_tratamento' || o.estado === 'aberta').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-blue-500 font-medium">Em Verificação</span>
          <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400 mt-1">
            {occurrences.filter(o => o.estado === 'em_verificacao').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-500 font-medium">Eficácia Comprovada</span>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {occurrences.filter(o => o.estado === 'encerrada').length}
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Procurar por código ou descrição do problema..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['todos', 'aberta', 'em_tratamento', 'encerrada'].map(st => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterState === st
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Ocorrências ISO 9001 */}
      <div className="space-y-3">
        {filteredOccurrences.map(oc => (
          <div
            key={oc.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">{oc.codigo}</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {oc.tipo.replace('_', ' ')}
                </span>
                {oc.curso && (
                  <span className="text-[11px] text-slate-400">· {oc.curso.nomeCurso}</span>
                )}
              </div>

              <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                oc.estado === 'encerrada' ? 'bg-emerald-100 text-emerald-800' :
                oc.estado === 'em_tratamento' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {oc.estado.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Descrição do Desvio:</span>
                <p className="text-slate-600 dark:text-slate-400">{oc.descricaoProblema}</p>
              </div>

              {oc.causaRaiz && (
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Análise de Causa-Raiz (5 Porquês):</span>
                  <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg">{oc.causaRaiz}</p>
                </div>
              )}

              {oc.acaoCorretiva && (
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Plano de Ação Corretiva:</span>
                  <p className="text-slate-600 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">{oc.acaoCorretiva}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span>Responsável: {oc.responsavel.nomeCompleto}</span>
                <span>·</span>
                <span>Prazo: {oc.prazoResolucao}</span>
              </div>

              {oc.estado !== 'encerrada' && hasRole(['superadmin_org', 'admin', 'gestor']) && (
                <button
                  onClick={() => handleCloseOc(oc.id)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1 self-end sm:self-auto"
                >
                  <CheckCircle2 size={13} />
                  <span>Verificar Eficácia e Encerrar</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Ocorrência */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Registar Não Conformidade / Ocorrência</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateOc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Ocorrência</label>
                  <select
                    value={newOcForm.tipo}
                    onChange={e => setNewOcForm(f => ({ ...f, tipo: e.target.value as any }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="nao_conformidade">Não Conformidade</option>
                    <option value="desvio_operacional">Desvio Operacional</option>
                    <option value="reclamacao">Reclamação de Formando</option>
                    <option value="oportunidade_melhoria">Oportunidade de Melhoria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Origem</label>
                  <select
                    value={newOcForm.origem}
                    onChange={e => setNewOcForm(f => ({ ...f, origem: e.target.value as any }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="auditoria">Auditoria Interna</option>
                    <option value="formando">Formando / Participante</option>
                    <option value="formador">Formador Docente</option>
                    <option value="coordenacao">Coordenação Pedagógica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Curso Associado (Opcional)</label>
                <select
                  value={newOcForm.cursoId}
                  onChange={e => setNewOcForm(f => ({ ...f, cursoId: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">Geral da Organização (Sem curso específico)</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCurso}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição Detalhada do Problema</label>
                <textarea
                  rows={2}
                  required
                  value={newOcForm.descricaoProblema}
                  onChange={e => setNewOcForm(f => ({ ...f, descricaoProblema: e.target.value }))}
                  placeholder="Descreva com rigor o desvio observado..."
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Análise de Causa-Raiz</label>
                <input
                  type="text"
                  value={newOcForm.causaRaiz}
                  onChange={e => setNewOcForm(f => ({ ...f, causaRaiz: e.target.value }))}
                  placeholder="Por que ocorreu o desvio?"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Ação Corretiva Proposta</label>
                <input
                  type="text"
                  value={newOcForm.acaoCorretiva}
                  onChange={e => setNewOcForm(f => ({ ...f, acaoCorretiva: e.target.value }))}
                  placeholder="Medida preventiva ou corretiva a executar"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Prazo de Resolução</label>
                <input
                  type="date"
                  required
                  value={newOcForm.prazoResolucao}
                  onChange={e => setNewOcForm(f => ({ ...f, prazoResolucao: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
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
                  Submeter Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
