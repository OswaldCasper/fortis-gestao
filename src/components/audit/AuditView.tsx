/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * AuditView: Histórico de Auditoria Imutável (Rastreabilidade e Segurança ISO 9001)
 */

import React, { useState } from 'react';
import { History, Shield, Search, Lock, User, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

export const AuditView: React.FC = () => {
  const { currentOrg } = useAuth();
  const [logs] = useState(() => dataService.getAuditHistory(currentOrg.id));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => 
    l.resumoAlteracao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.autorNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Histórico de Auditoria Imutável</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registo protegido contra escrita ou eliminação cliente de todas as operações do sistema
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Lock size={12} />
          <span>Coleção Append-Only Protegida</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar histórico de auditoria..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {filteredLogs.map(l => (
          <div key={l.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-start gap-4">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
              <FileText size={16} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {l.entidade} · {l.operacao}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(l.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                {l.resumoAlteracao}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Executado por: <span className="font-semibold text-slate-700 dark:text-slate-300">{l.autorNome}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
