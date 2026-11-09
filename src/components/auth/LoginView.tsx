/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * LoginView: Ecrã de autenticação oficial Supabase (Entrar, Primeiro Acesso, Recuperar Senha)
 */

import React, { useState } from 'react';
import { LogIn, Lock, Mail, ShieldCheck, AlertCircle, KeyRound, User, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot_password';

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, signUp, resetPassword, currentOrg, isSupabaseReady } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('oseiasgaspar96@gmail.com');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.ok) {
          if (onSuccess) onSuccess();
        } else {
          setErrorMsg(res.error || 'Credenciais inválidas. Verifique o email e a palavra-passe.');
        }
      } else if (mode === 'signup') {
        const res = await signUp(email, password, nomeCompleto);
        if (res.ok) {
          setSuccessMsg('Conta criada com sucesso! Se a confirmação de email estiver ativa, verifique a sua caixa de entrada.');
          setMode('login');
        } else {
          setErrorMsg(res.error || 'Não foi possível concluir o registo. Verifique os dados.');
        }
      } else if (mode === 'forgot_password') {
        const res = await resetPassword(email);
        if (res.ok) {
          setSuccessMsg('Ligação de recuperação enviada para o seu email com sucesso.');
        } else {
          setErrorMsg(res.error || 'Não foi possível solicitar a recuperação.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] dark:bg-[#0B111B] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#152232] rounded-3xl border border-[#E3E8EF] dark:border-[#223347] shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Logótipo e Cabeçalho */}
        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-extrabold text-2xl text-white shadow-md"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1B2A3A] dark:text-[#F1F5F9] flex items-center justify-center gap-1.5">
            FORTIS
            <span className="text-xs uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#5B6B7C] dark:text-[#94A3B8]">
              ELM SaaS
            </span>
          </h1>
          <p className="text-xs text-[#5B6B7C] dark:text-[#94A3B8]">
            {currentOrg?.designacao || 'Sistema Integrado de Gestão da Formação'}
          </p>
        </div>

        {/* Banner informativo caso as credenciais Supabase não estejam nas variáveis */}
        {!isSupabaseReady && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <span className="font-bold block">Modo de demonstração local</span>
              <span>
                Para ativar a persistência e autenticação Supabase real, defina <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.2 rounded">VITE_SUPABASE_URL</code> e <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.2 rounded">VITE_SUPABASE_ANON_KEY</code>.
              </span>
            </div>
          </div>
        )}

        {/* Alternador de Modo: Entrar / Primeiro Acesso */}
        {mode !== 'forgot_password' ? (
          <div className="grid grid-cols-2 p-1 bg-[#F4F6F9] dark:bg-[#0B111B] rounded-xl border border-[#E3E8EF] dark:border-[#223347] text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-1.5 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#152232] text-[#1B2A3A] dark:text-[#F1F5F9] font-bold shadow-xs'
                  : 'text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A]'
              }`}
            >
              Iniciar Sessão
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-1.5 rounded-lg font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#152232] text-[#1B2A3A] dark:text-[#F1F5F9] font-bold shadow-xs'
                  : 'text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A]'
              }`}
            >
              Primeiro Acesso
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9] flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={14} /> Voltar ao início de sessão
            </button>
          </div>
        )}

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-1.5">
                Nome Completo *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={e => setNomeCompleto(e.target.value)}
                  placeholder="Nome e apelidos"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] text-[#1B2A3A] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[var(--fortis-primary)]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9] mb-1.5">
              Email do Utilizador *
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] text-[#1B2A3A] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[var(--fortis-primary)]"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
                  Palavra-passe *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-[var(--fortis-primary)] hover:underline font-medium"
                  >
                    Esqueceu-se da senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E3E8EF] dark:border-[#223347] bg-[#F8FAFC] dark:bg-[#101B2A] text-[#1B2A3A] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[var(--fortis-primary)]"
                />
              </div>
              <p className="mt-1 text-[10px] text-[#8896A6]">
                A palavra-passe deve conter pelo menos 8 caracteres.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: 'var(--fortis-primary)' }}
            >
              {isSubmitting ? (
                <span>A processar…</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={15} />
                  <span>Entrar no Sistema</span>
                </>
              ) : mode === 'signup' ? (
                <>
                  <ShieldCheck size={15} />
                  <span>Concluir Primeiro Acesso</span>
                </>
              ) : (
                <>
                  <Mail size={15} />
                  <span>Enviar Ligação de Recuperação</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E3E8EF] dark:border-[#223347] text-center text-[11px] text-[#8896A6] space-y-1">
          <p className="flex items-center justify-center gap-1 font-medium">
            <ShieldCheck size={13} className="text-[#16866A]" /> Autenticação Supabase com Row-Level Security (RLS)
          </p>
          <p>FORTIS ELM Enterprise · Conforme ISO 9001:2015</p>
        </div>
      </div>
    </div>
  );
};
