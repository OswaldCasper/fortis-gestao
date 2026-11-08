/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * DocumentsView: Repositório central de documentos da qualidade, regulamentos e dossiês pedagógicos
 */

import React, { useState } from 'react';
import {
  FolderArchive,
  FileText,
  Download,
  Eye,
  Search,
  Upload,
  CheckCircle2,
  FileCheck,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DocumentsView: React.FC = () => {
  const { currentOrg } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const initialDocs = [
    {
      id: 'doc-1',
      title: 'Manual da Qualidade FORTIS — ISO 9001:2015',
      category: 'Qualidade & Normas',
      version: 'v3.2',
      date: '2026-01-15',
      size: '2.4 MB',
      type: 'PDF',
    },
    {
      id: 'doc-2',
      title: 'Regulamento Geral da Formação Profissional',
      category: 'Regulamentos',
      version: 'v2.0',
      date: '2026-02-10',
      size: '850 KB',
      type: 'PDF',
    },
    {
      id: 'doc-3',
      title: 'Dossier Técnico-Pedagógico (Template Oficial)',
      category: 'Pedagógico',
      version: 'v4.1',
      date: '2026-03-01',
      size: '1.2 MB',
      type: 'DOCX',
    },
    {
      id: 'doc-4',
      title: 'Minuta de Contrato de Prestação de Serviços (Formador)',
      category: 'Jurídico & RH',
      version: 'v1.5',
      date: '2026-01-20',
      size: '420 KB',
      type: 'DOCX',
    },
    {
      id: 'doc-5',
      title: 'Ficha de Inscrição e Compromisso de Honra do Formando',
      category: 'Inscrições',
      version: 'v2.3',
      date: '2026-04-05',
      size: '310 KB',
      type: 'PDF',
    },
    {
      id: 'doc-6',
      title: 'Modelo de Pauta Oficial de Frequência e Avaliação',
      category: 'Avaliações',
      version: 'v3.0',
      date: '2026-05-12',
      size: '560 KB',
      type: 'XLSX',
    },
  ];

  const filteredDocs = initialDocs.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (docTitle: string) => {
    setFeedback(`Download iniciado para "${docTitle}".`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderArchive size={22} style={{ color: 'var(--fortis-primary)' }} />
            <span>Repositório de Documentos & Modelos Oficiais</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Modelos de dossiês técnico-pedagógicos, normas ISO 9001 e minutas contratuais
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback('Funcionalidade de upload para o repositório ativada.');
            setTimeout(() => setFeedback(null), 3000);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--fortis-primary)' }}
        >
          <Upload size={14} />
          <span>Carregar Novo Documento</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Barra de pesquisa */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por título de documento ou categoria normativa..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{doc.type} • {doc.size}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-start gap-2 mt-1">
                <FileText size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>{doc.title}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-2">
                Versão: {doc.version} • Atualizado em {doc.date}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Shield size={11} /> Homologado
              </span>
              <button
                onClick={() => handleDownload(doc.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <Download size={13} />
                <span>Descarregar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
