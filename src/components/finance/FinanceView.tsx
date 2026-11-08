/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * FinanceView: Controlo orçamental previsto vs. realizado, receitas e despesas gerais
 */

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { TipoFinanceiro, CategoriaFinanceiro } from '../../types';

export const FinanceView: React.FC = () => {
  const { currentUser, currentOrg, hasRole } = useAuth();
  const [records, setRecords] = useState(() => dataService.getFinancialRecords(currentOrg.id));
  const [filterCourse, setFilterCourse] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newFinForm, setNewFinForm] = useState({
    cursoId: '',
    tipo: 'custo_direto' as TipoFinanceiro,
    categoria: 'honorarios_formador' as CategoriaFinanceiro,
    descricao: '',
    valor: 50000,
    data: new Date().toISOString().split('T')[0],
  });

  React.useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setRecords(dataService.getFinancialRecords(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const courses = dataService.getCourses(currentOrg.id);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchCourse = filterCourse === 'Todos' || r.cursoId === filterCourse;
      const matchType = filterType === 'Todos' || r.tipo === filterType;
      return matchCourse && matchType;
    });
  }, [records, filterCourse, filterType]);

  const totals = useMemo(() => {
    let receitas = 0;
    let custos = 0;
    filteredRecords.forEach(r => {
      if (r.tipo === 'receita') receitas += r.valor;
      else custos += r.valor;
    });

    const orcamentoTotal = courses.reduce((acc, c) => acc + c.orcamentoPrevisto, 0);

    return {
      receitas,
      custos,
      saldo: receitas - custos,
      orcamentoTotal,
    };
  }, [filteredRecords, courses]);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.addFinancialRecord({
      empresaId: currentOrg.id,
      cursoId: newFinForm.cursoId || undefined,
      tipo: newFinForm.tipo,
      categoria: newFinForm.categoria,
      descricao: newFinForm.descricao,
      valor: Number(newFinForm.valor),
      data: newFinForm.data,
    }, currentUser.id);

    setShowAddModal(false);
    setNewFinForm({
      cursoId: '',
      tipo: 'custo_direto',
      categoria: 'honorarios_formador',
      descricao: '',
      valor: 50000,
      data: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Controlo Financeiro & Orçamentos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestão de orçamentos previstos, despesas diretas das ações e receitas de inscrições
          </p>
        </div>

        {hasRole(['superadmin_org', 'admin']) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm hover:opacity-95 flex items-center gap-1.5 shrink-0"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            <Plus size={14} />
            <span>Registar Movimento</span>
          </button>
        )}
      </div>

      {/* KPI Cards Financeiros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Orçamento Alocado Global</span>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {totals.orcamentoTotal.toLocaleString()} Kz
          </p>
          <span className="text-[10px] text-slate-400">Total previsto nas ações</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp size={13} /> Receitas Realizadas
          </span>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {totals.receitas.toLocaleString()} Kz
          </p>
          <span className="text-[10px] text-slate-400">Taxas pagas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
            <TrendingDown size={13} /> Despesas Realizadas
          </span>
          <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1">
            {totals.custos.toLocaleString()} Kz
          </p>
          <span className="text-[10px] text-slate-400">Honorários e logística</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Saldo Operacional</span>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {totals.saldo.toLocaleString()} Kz
          </p>
          <span className={`text-[10px] font-semibold ${totals.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totals.saldo >= 0 ? 'Margem Positiva' : 'Défice'}
          </span>
        </div>
      </div>

      {/* Tabela de Movimentos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Extrato Financeiro de Movimentos</span>
          
          <div className="flex items-center gap-2">
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Todos">Todos os Cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.nomeCurso}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Todos">Todas as Naturezas</option>
              <option value="receita">Receitas</option>
              <option value="custo_direto">Custos Diretos</option>
              <option value="custo_indireto">Custos Gerais</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Descrição</th>
                <th className="py-2.5 px-4">Ação / Curso</th>
                <th className="py-2.5 px-4">Categoria</th>
                <th className="py-2.5 px-4 text-right">Valor (Kz)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-4 tabular-nums text-slate-400">{r.data}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{r.descricao}</td>
                  <td className="py-2.5 px-4 text-slate-500">{r.cursoNome || 'Geral da Organização'}</td>
                  <td className="py-2.5 px-4 capitalize">{r.categoria.replace('_', ' ')}</td>
                  <td className={`py-2.5 px-4 text-right font-bold tabular-nums ${
                    r.tipo === 'receita' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {r.tipo === 'receita' ? '+' : '-'}{r.valor.toLocaleString()} Kz
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Registo Financeiro */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Registar Lançamento Financeiro</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={newFinForm.descricao}
                  onChange={e => setNewFinForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Aquisição de manuais técnicos"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                  <select
                    value={newFinForm.tipo}
                    onChange={e => setNewFinForm(f => ({ ...f, tipo: e.target.value as any }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="receita">Receita</option>
                    <option value="custo_direto">Custo Direto</option>
                    <option value="custo_indireto">Despesa Geral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor (Kz)</label>
                  <input
                    type="number"
                    required
                    value={newFinForm.valor}
                    onChange={e => setNewFinForm(f => ({ ...f, valor: Number(e.target.value) }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Curso Alocado (Opcional)</label>
                <select
                  value={newFinForm.cursoId}
                  onChange={e => setNewFinForm(f => ({ ...f, cursoId: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">Geral da Organização (Sem curso específico)</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCurso}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={newFinForm.data}
                  onChange={e => setNewFinForm(f => ({ ...f, data: e.target.value }))}
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
                  Registar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
