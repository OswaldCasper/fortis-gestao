/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * CatalogView: Gestão de Matrizes Pedagógicas e Catálogo de Formações (image 6)
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { FormacaoCatalogo } from '../../types';

export const CatalogView: React.FC = () => {
  const { currentOrg, currentUser, hasRole } = useAuth();
  const [catalog, setCatalog] = useState(() => (dataService as any).db.formacoes as FormacaoCatalogo[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFormacao, setSelectedFormacao] = useState<FormacaoCatalogo | null>(null);

  const [form, setForm] = useState({
    codigo: '',
    titulo: '',
    categoria: 'Gestão & Negócios',
    cargaHorariaPadrao: 40,
    objetivos: '',
    precoBase: 85000,
  });

  const filtered = catalog.filter(f => 
    f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cat-${Date.now()}`;
    const nova: FormacaoCatalogo = {
      id,
      empresaId: currentOrg.id,
      codigo: form.codigo.toUpperCase(),
      titulo: form.titulo,
      categoria: form.categoria,
      cargaHorariaPadrao: Number(form.cargaHorariaPadrao),
      objetivos: form.objetivos,
      conteudoProgramatico: ['Módulo 01: Fundamentos', 'Módulo 02: Aplicações Práticas', 'Módulo 03: Avaliação'],
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
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Formações — Catálogo e Fichas Técnicas ({catalog.length})</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Matriz curricular, cargas horárias e objetivos pedagógicos acreditados
          </p>
        </div>

        {hasRole(['superadmin_org', 'admin', 'gestor']) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm hover:opacity-95 flex items-center gap-1.5 shrink-0"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            <Plus size={14} />
            <span>Adicionar Formação</span>
          </button>
        )}
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Procurar Formações por código ou título..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>
      </div>

      {/* Lista de Formações (Fiel ao AppSheet image 6) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-5 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {item.codigo}
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {item.titulo}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {item.categoria} · Carga Horária: {item.cargaHorariaPadrao} Horas · Preço Sugerido: {item.precoBase.toLocaleString()} Kz
              </p>
              <p className="text-[11px] text-slate-400 line-clamp-1 max-w-2xl">{item.objetivos}</p>
            </div>

            {/* Ícones de Operação da Formação (Image 6) */}
            <div className="flex items-center gap-1 text-slate-400 self-end md:self-center">
              <button
                onClick={() => setSelectedFormacao(item)}
                title="Ver Ficha Curricular"
                className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded"
              >
                <FileText size={15} />
              </button>
              <button
                onClick={() => {
                  alert(`Resumo Curricular: ${item.titulo} com ${item.cargaHorariaPadrao}h e ${item.conteudoProgramatico.length} módulos estruturados.`);
                }}
                title="Resumo Inteligente"
                className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded"
              >
                <Sparkles size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Formação */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Criar Matriz de Formação</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={form.codigo}
                    onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                    placeholder="Ex: GEST-QUAL"
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Carga Horária (h)</label>
                  <input
                    type="number"
                    required
                    value={form.cargaHorariaPadrao}
                    onChange={e => setForm(f => ({ ...f, cargaHorariaPadrao: Number(e.target.value) }))}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Título da Formação</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Gestão de Projetos Ágeis (Scrum & Kanban)"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Categoria</label>
                <input
                  type="text"
                  value={form.categoria}
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Objetivos Pedagógicos</label>
                <textarea
                  rows={3}
                  value={form.objetivos}
                  onChange={e => setForm(f => ({ ...f, objetivos: e.target.value }))}
                  placeholder="Objetivos e competências a adquirir..."
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Guardar Formação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ficha Curricular */}
      {selectedFormacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-mono text-xs font-bold text-amber-600">{selectedFormacao.codigo}</span>
              <button onClick={() => setSelectedFormacao(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedFormacao.titulo}</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedFormacao.categoria} · {selectedFormacao.cargaHorariaPadrao} Horas</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Objetivos Gerais:</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedFormacao.objetivos}</p>
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-2">Módulos Programáticos:</span>
              <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                {selectedFormacao.conteudoProgramatico.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
