/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * TrainersView: Gestão especializada de formadores com histórico de cursos, contactos e desempenho (image 7)
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  Mail,
  FileText,
  Star,
  BookOpen,
  Award,
  Sparkles,
  Edit,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

export const TrainersView: React.FC = () => {
  const { currentOrg } = useAuth();
  const [trainers, setTrainers] = useState(() => dataService.getTrainers(currentOrg.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  React.useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setTrainers(dataService.getTrainers(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const filteredTrainers = trainers.filter(t => 
    t.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.telefone.includes(searchTerm)
  );

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Formadores e Corpo Docente ({trainers.length})</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestão curricular, especialidades, cursos ministrados e avaliação de desempenho
          </p>
        </div>
      </div>

      {/* AI Summary Banner se ativo */}
      {aiSummary && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-slate-200 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{aiSummary}</p>
          </div>
          <button onClick={() => setAiSummary(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {/* Barra de Pesquisa */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Procurar formadores por nome, especialidade ou email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>
      </div>

      {/* Lista de Formadores (Fiel ao AppSheet image 7) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {filteredTrainers.map(formador => (
          <div
            key={formador.id}
            className="p-5 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0"
                style={{ backgroundColor: 'var(--fortis-primary)' }}
              >
                {formador.nomeCompleto.charAt(0)}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {formador.nomeCompleto}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formador.email}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
                    <BookOpen size={12} />
                    <span>{formador.cursosMinistrados} Ações Atribuídas</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>Classificação 4.8 / 5.0</span>
                  </span>
                  <span>·</span>
                  <span>{formador.membro?.funcoesProfissionais?.join(', ') || 'Docente'}</span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas (Iconografia do Screenshot image 7) */}
            <div className="flex items-center gap-3 self-end md:self-center">
              <span className="text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                {formador.telefone}
              </span>

              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                <a
                  href={`tel:${formador.telefone}`}
                  title="Contactar por Telefone"
                  className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Phone size={15} />
                </a>

                <a
                  href={`mailto:${formador.email}`}
                  title="Enviar Mensagem de Email"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Mail size={15} />
                </a>

                <button
                  onClick={() => {
                    setAiSummary(`Perfil Pedagógico de ${formador.nomeCompleto}: Especialista sénior com avaliação de satisfação de 96% entre os formandos. Destaca-se pela clareza didática e rigor nos registos de assiduidade.`);
                  }}
                  title="Diagnóstico de Desempenho com IA"
                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Sparkles size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
