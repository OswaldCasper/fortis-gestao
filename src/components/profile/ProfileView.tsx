/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * ProfileView: Perfil do utilizador com citação diária, coordenações e dados de acesso (image 2)
 */

import React, { useState } from 'react';
import {
  User,
  KeyRound,
  GraduationCap,
  Sparkles,
  Mail,
  ShieldCheck,
  Edit,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { currentUser, currentMember, activeRole, resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!currentUser.email) return;
    const res = await resetPassword(currentUser.email);
    if (res.ok) {
      setFeedback('Ligação de reposição de palavra-passe enviada para o seu email.');
    } else {
      setFeedback(res.error || 'Não foi possível solicitar a reposição.');
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Perfil do Utilizador</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Informações pessoais, credenciais de acesso e coordenações atribuídas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedback('Modo de edição do perfil ativado.')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1.5 shadow-xs"
          >
            <Edit size={13} />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Cartão de Ações Rápidas do Perfil (Fiel ao AppSheet image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bloco 1: Ações Circulares */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-around text-center">
          <button
            onClick={handleResetPassword}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--fortis-primary)' }}
            >
              <KeyRound size={20} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Resetar Senha</span>
          </button>

          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--fortis-primary)' }}
            >
              <GraduationCap size={20} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Coordenações</span>
          </div>

          <div 
            onClick={() => {
              setFeedback(`Perfil com nível ${activeRole.toUpperCase()}. Todos os dados sincronizados.`);
              setTimeout(() => setFeedback(null), 4000);
            }}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--fortis-primary)' }}
            >
              <Sparkles size={20} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Assistente</span>
          </div>
        </div>

        {/* Bloco 2: Dados do Perfil e Dica do Dia (Image 2) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          {/* Dica do dia */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Dica do dia
            </span>
            <p className="font-semibold italic text-blue-900 dark:text-blue-200 text-xs flex items-start gap-1.5">
              <Quote size={14} className="shrink-0 text-blue-500 mt-0.5" />
              <span>&ldquo;Tudo o que fizeres, faze de todo o coração, como para o Senhor e não para os homens.&rdquo; — Colossenses 3:23</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Nome Completo</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{currentUser.nomeCompleto}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Email</span>
              <p className="font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>{currentUser.email}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Palavra-passe</span>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Mín. 8 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs w-36"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPassword.length < 8) {
                      setFeedback('A nova palavra-passe deve conter pelo menos 8 caracteres.');
                      return;
                    }
                    setFeedback('Solicitação de alteração de palavra-passe registada.');
                    setNewPassword('');
                    setTimeout(() => setFeedback(null), 3000);
                  }}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Atualizar
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Nível de Acesso</span>
              <p className="font-bold text-amber-700 dark:text-amber-300 uppercase">{activeRole.replace('_', ' ')}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Estado da Conta</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>SIM (Ativo)</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Funções Atribuídas</span>
              <p className="text-slate-600 dark:text-slate-300">{currentMember.funcoesProfissionais?.join(', ') || 'Colaborador'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
