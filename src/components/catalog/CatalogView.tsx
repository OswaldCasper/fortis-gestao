/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * CatalogView: Gestão de Matrizes Pedagógicas, Catálogo de Formações e Fichas Técnicas Curriculares
 */

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  BookOpen,
  Clock,
  Sparkles,
  Layers,
  Edit,
  Trash2,
  FileText,
  Mail,
  X,
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { FormacaoCatalogo } from '../../types';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  EmptyState,
} from '../ui';

export const CatalogView: React.FC = () => {
  const { currentOrg, currentUser, hasRole } = useAuth();
  const [catalog, setCatalog] = useState(() => (dataService as any).db.formacoes as FormacaoCatalogo[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [sortBy, setSortBy] = useState<'codigo' | 'titulo' | 'carga' | 'preco'>('codigo');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFormacao, setSelectedFormacao] = useState<FormacaoCatalogo | null>(null);
  const [smartSummaryModal, setSmartSummaryModal] = useState<FormacaoCatalogo | null>(null);

  // Formulário estruturado com validação
  const [form, setForm] = useState({
    codigo: '',
    titulo: '',
    categoria: 'Gestão & Negócios',
    cargaHorariaPadrao: 40,
    objetivos: '',
    precoBase: 85000,
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach(c => {
      if (c.categoria) set.add(c.categoria);
    });
    return ['Todas', ...Array.from(set)];
  }, [catalog]);

  const filtered = useMemo(() => {
    return catalog
      .filter(f => {
        const matchSearch =
          f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.categoria.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'Todas' || f.categoria === selectedCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'codigo') return a.codigo.localeCompare(b.codigo);
        if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo);
        if (sortBy === 'carga') return b.cargaHorariaPadrao - a.cargaHorariaPadrao;
        if (sortBy === 'preco') return b.precoBase - a.precoBase;
        return 0;
      });
  }, [catalog, searchTerm, selectedCategory, sortBy]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cat-${Date.now()}`;
    const nova: FormacaoCatalogo = {
      id,
      empresaId: currentOrg.id,
      codigo: form.codigo.toUpperCase().trim(),
      titulo: form.titulo.trim(),
      categoria: form.categoria.trim(),
      cargaHorariaPadrao: Number(form.cargaHorariaPadrao),
      objetivos: form.objetivos.trim(),
      conteudoProgramatico: [
        'Módulo 01: Enquadramento Normativo e Fundamentos',
        'Módulo 02: Aplicações Práticas e Ferramentas Operacionais',
        'Módulo 03: Avaliação de Competências e Estudo de Casos',
      ],
      precoBase: Number(form.precoBase),
    };

    (dataService as any).db.formacoes.unshift(nova);
    (dataService as any).persist();
    setCatalog([...(dataService as any).db.formacoes]);
    setShowAddModal(false);
    setForm({
      codigo: '',
      titulo: '',
      categoria: 'Gestão & Negócios',
      cargaHorariaPadrao: 40,
      objetivos: '',
      precoBase: 85000,
    });
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* 1. CABEÇALHO UNIFICADO */}
      <PageHeader
        title="Formações (Catálogo)"
        badge={
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)]">
            {catalog.length} Matrizes
          </span>
        }
        description="Matriz curricular padronizada, cargas horárias acreditadas e fichas técnicas pedagógicas"
        icon={FileSpreadsheet}
        actions={
          hasRole(['superadmin_org', 'admin', 'gestor']) ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--fortis-primary)' }}
            >
              <Plus size={14} />
              <span>Adicionar Formação</span>
            </button>
          ) : undefined
        }
      />

      {/* 2. BARRA DE FILTROS E PESQUISA EM 1 LINHA */}
      <div className="p-3 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Pesquisa e Filtro de Categoria */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por código, título ou categoria..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#5B6B7C] dark:text-[#94A3B8] font-medium text-[11px]">Categoria:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2 text-xs rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)]"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown size={13} className="text-[#5B6B7C]" />
          <span className="text-[#5B6B7C] dark:text-[#94A3B8] font-medium text-[11px]">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="py-1.5 px-2 text-xs rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--fortis-primary)]"
          >
            <option value="codigo">Código</option>
            <option value="titulo">Título</option>
            <option value="carga">Carga Horária</option>
            <option value="preco">Preço Base</option>
          </select>
        </div>
      </div>

      {/* 3. TABELA DENSA DE CATÁLOGO (DataTable) */}
      <DataTable>
        <thead className="bg-[#F4F6F9] dark:bg-[#0B111B] text-[#5B6B7C] dark:text-[#94A3B8] font-semibold border-b border-[#E3E8EF] dark:border-[#223347]">
          <tr>
            <th className="py-2.5 px-3">Código</th>
            <th className="py-2.5 px-3">Nome da Formação</th>
            <th className="py-2.5 px-3">Categoria</th>
            <th className="py-2.5 px-3">Carga Horária</th>
            <th className="py-2.5 px-3">Preço Sugerido</th>
            <th className="py-2.5 px-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3E8EF] dark:divide-[#223347] text-[#1B2A3A] dark:text-[#F1F5F9] text-xs">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-[#5B6B7C]">
                Nenhuma formação encontrada no catálogo com os critérios indicados.
              </td>
            </tr>
          ) : (
            filtered.map(item => (
              <tr
                key={item.id}
                className="hover:bg-[#F4F6F9]/50 dark:hover:bg-[#0B111B]/40 transition-colors"
              >
                <td className="py-2.5 px-3 font-mono font-bold text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9]">
                    {item.codigo}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <p className="font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">{item.titulo}</p>
                  <p className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] line-clamp-1 max-w-lg mt-0.5">
                    {item.objetivos}
                  </p>
                </td>
                <td className="py-2.5 px-3 text-[#5B6B7C] dark:text-[#94A3B8] font-medium">
                  {item.categoria}
                </td>
                <td className="py-2.5 px-3 tabular-nums font-mono">
                  <span className="inline-flex items-center gap-1 text-[#1B2A3A] dark:text-[#F1F5F9]">
                    <Clock size={12} className="text-[#5B6B7C]" />
                    {item.cargaHorariaPadrao}h
                  </span>
                </td>
                <td className="py-2.5 px-3 tabular-nums font-mono font-semibold text-[#16866A]">
                  {item.precoBase.toLocaleString()} Kz
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedFormacao(item)}
                      title="Ver Ficha Técnica Curricular"
                      className="px-2.5 py-1 text-[11px] font-semibold rounded text-[var(--fortis-primary)] hover:bg-[var(--fortis-primary-soft)] transition-colors flex items-center gap-1"
                    >
                      <FileText size={13} />
                      <span>Ficha</span>
                    </button>
                    <button
                      onClick={() => setSmartSummaryModal(item)}
                      title="Síntese Curricular"
                      className="p-1 rounded text-[#D99B24] hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </DataTable>

      {/* MODAL 1: ADICIONAR FORMAÇÃO AO CATÁLOGO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-lg w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <div>
                <h3 className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9]">
                  Criar Matriz de Formação
                </h3>
                <p className="text-[11px] text-[#5B6B7C]">Registo de nova ficha curricular no catálogo padrão</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Secção 1: Identificação */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B7C] block">
                  1. Identificação Geral
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5B6B7C] mb-1">Código</label>
                    <input
                      type="text"
                      required
                      value={form.codigo}
                      onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                      placeholder="Ex: QUAL-9001"
                      className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-mono uppercase"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-[#5B6B7C] mb-1">Categoria</label>
                    <input
                      type="text"
                      required
                      value={form.categoria}
                      onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                      placeholder="Ex: Gestão & Qualidade"
                      className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] mb-1">Título da Formação</label>
                  <input
                    type="text"
                    required
                    value={form.titulo}
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                    placeholder="Ex: Auditoria e Controlo da Qualidade ISO 9001:2015"
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  />
                </div>
              </div>

              {/* Secção 2: Parâmetros Pedagógicos & Financeiros */}
              <div className="space-y-2 pt-2 border-t border-[#E3E8EF] dark:border-[#223347]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B7C] block">
                  2. Parâmetros Pedagógicos & Financeiros
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5B6B7C] mb-1">
                      Carga Horária Padrão (h)
                    </label>
                    <input
                      type="number"
                      required
                      min={4}
                      value={form.cargaHorariaPadrao}
                      onChange={e => setForm(f => ({ ...f, cargaHorariaPadrao: Number(e.target.value) }))}
                      className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5B6B7C] mb-1">
                      Preço Base Sugerido (Kz)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.precoBase}
                      onChange={e => setForm(f => ({ ...f, precoBase: Number(e.target.value) }))}
                      className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B6B7C] mb-1">
                    Objetivos Pedagógicos & Perfil de Saída
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.objetivos}
                    onChange={e => setForm(f => ({ ...f, objetivos: e.target.value }))}
                    placeholder="Competências teóricas e práticas a adquirir pelos formandos..."
                    className="w-full py-1.5 px-3 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E8EF] dark:border-[#223347]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[#5B6B7C] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs"
                  style={{ backgroundColor: 'var(--fortis-primary)' }}
                >
                  Guardar Matriz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FICHA TÉCNICA CURRICULAR */}
      {selectedFormacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-lg w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#1B2A3A] dark:text-[#F1F5F9]">
                  {selectedFormacao.codigo}
                </span>
                <span className="text-xs text-[#5B6B7C]">{selectedFormacao.categoria}</span>
              </div>
              <button onClick={() => setSelectedFormacao(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                {selectedFormacao.titulo}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[#5B6B7C] mt-1 font-mono">
                <span>Carga Horária: {selectedFormacao.cargaHorariaPadrao} Horas</span>
                <span>·</span>
                <span className="font-semibold text-[#16866A]">
                  Preço Base: {selectedFormacao.precoBase.toLocaleString()} Kz
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F6F9] dark:bg-[#0B111B] text-xs space-y-1.5">
              <span className="font-bold text-[#1B2A3A] dark:text-[#F1F5F9] block">
                Objetivos Gerais e Perfil de Competências:
              </span>
              <p className="text-[#5B6B7C] leading-relaxed">{selectedFormacao.objetivos}</p>
            </div>

            <div>
              <span className="font-bold text-xs text-[#1B2A3A] dark:text-[#F1F5F9] block mb-2">
                Estrutura Modular Credenciada:
              </span>
              <div className="space-y-1.5">
                {selectedFormacao.conteudoProgramatico.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-[#E3E8EF] dark:border-[#223347] bg-white dark:bg-[#152232] text-xs font-medium text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center gap-2"
                  >
                    <CheckCircle2 size={13} className="text-[#16866A] shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFormacao(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SÍNTESE CURRICULAR INTELIGENTE */}
      {smartSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#152232] rounded-2xl max-w-md w-full p-6 border border-[#E3E8EF] dark:border-[#223347] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF] dark:border-[#223347]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#D99B24]" />
                <h3 className="font-bold text-sm text-[#1B2A3A] dark:text-[#F1F5F9]">
                  Síntese Curricular
                </h3>
              </div>
              <button onClick={() => setSmartSummaryModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs text-[#1B2A3A] dark:text-[#F1F5F9] leading-relaxed">
              <p>
                <strong>Matriz:</strong> {smartSummaryModal.titulo} ({smartSummaryModal.codigo})
              </p>
              <p>
                <strong>Carga e Formato:</strong> {smartSummaryModal.cargaHorariaPadrao} horas letivas estruturadas em {smartSummaryModal.conteudoProgramatico.length} módulos sequenciais com validação por evidências.
              </p>
              <p>
                <strong>Viabilidade Comercial:</strong> Preço sugerido de {smartSummaryModal.precoBase.toLocaleString()} Kz para turmas de 15 a 25 formandos com rentabilidade projetada superior a 35%.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSmartSummaryModal(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
