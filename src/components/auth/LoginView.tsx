/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * LoginView: Ecrã de autenticação e início de sessão (image 1)
 */

import React, { useState } from 'react';
import { LogIn, Lock, Mail, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { availableUsers, login, currentOrg } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState(availableUsers[0]?.email || 'domingoscussitala@gmail.com');
  const [pin, setPin] = useState('199822'); // Padrão da captura real (image 1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const ok = login(selectedEmail, pin);
    if (ok) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg('Credenciais inválidas. Insira um PIN de pelo menos 4 dígitos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Logótipo e Cabeçalho */}
        <div className="text-center space-y-2">
          <div 
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-extrabold text-2xl text-white shadow-md"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
            FORTIS
            <span className="text-xs uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              SaaS
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentOrg.designacao} · Sistema Integrado de Gestão da Formação
          </p>
        </div>

        {/* Formulário de Login (Matching image 1) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email do Utilizador *
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedEmail}
                onChange={e => setSelectedEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {availableUsers.map(u => (
                  <option key={u.id} value={u.email}>
                    {u.nomeCompleto} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Senha / Código PIN *
              </label>
              <span className="text-[10px] text-slate-400">Padrão demo: 199822</span>
            </div>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Insira o seu PIN ou Senha"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Entrar ou Encerrar a Sessão *
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPin('')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
              >
                Encerrar / Limpar
              </button>

              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                style={{ backgroundColor: 'var(--fortis-primary)' }}
              >
                <LogIn size={15} />
                <span>Entrar</span>
              </button>
            </div>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
          <p>Autenticação multi-tenant com isolamento de dados Firestore.</p>
          <p className="mt-0.5">Versão comercial 2.4 · Gestão Integrada ISO 9001</p>
        </div>
      </div>
    </div>
  );
};
