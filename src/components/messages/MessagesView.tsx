/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * MessagesView: Comunicação interna, avisos institucionais e notificações aos formandos e formadores
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle2,
  Bell,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

export const MessagesView: React.FC = () => {
  const { currentOrg, currentUser } = useAuth();
  const [destinatario, setDestinatario] = useState('todos_formandos');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const initialCommunications = [
    {
      id: 'msg-1',
      destinatarios: 'Todos os Formadores Ativos',
      assunto: 'Submissão de Pautas e Avaliações Finais — Prazo Limite',
      data: '2026-11-05 14:30',
      enviadoPor: 'Oseias Gaspar',
      estado: 'Entregue (8 formadores)',
    },
    {
      id: 'msg-2',
      destinatarios: 'Formandos — Gestão de Logística e Transporte',
      assunto: 'Disponibilização do Certificado Oficial de Conclusão',
      data: '2026-11-04 10:15',
      enviadoPor: 'Secretaria FORTIS',
      estado: 'Entregue (14 formandos)',
    },
    {
      id: 'msg-3',
      destinatarios: 'Formadores e Gestores',
      assunto: 'Auditoria Interna de Manutenção ISO 9001:2015',
      data: '2026-10-28 09:00',
      enviadoPor: 'Oseias Gaspar',
      estado: 'Entregue (5 membros)',
    },
  ];

  const [communications, setCommunications] = useState(initialCommunications);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim()) return;

    const novaMsg = {
      id: `msg-${Date.now()}`,
      destinatarios: destinatario === 'todos_formandos' ? 'Todos os Formandos' : destinatario === 'todos_formadores' ? 'Todos os Formadores' : 'Equipa Pedagógica',
      assunto: assunto.trim(),
      data: 'Agora',
      enviadoPor: currentUser.nomeCompleto,
      estado: 'Entregue com sucesso',
    };

    setCommunications([novaMsg, ...communications]);
    setAssunto('');
    setMensagem('');
    setFeedback('Mensagem transmitida com sucesso para os destinatários selecionados.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare size={22} style={{ color: 'var(--fortis-primary)' }} />
            <span>Comunicação Interna & Avisos aos Formandos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Envio de avisos operacionais, convocações de aulas e confirmação de emissão de certificados
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Envio */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Send size={16} style={{ color: 'var(--fortis-primary)' }} />
            <span>Nova Mensagem / Notificação</span>
          </h3>

          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Destinatários</label>
              <select
                value={destinatario}
                onChange={e => setDestinatario(e.target.value)}
                className="w-full mt-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="todos_formandos">Todos os Formandos Ativos</option>
                <option value="todos_formadores">Todos os Formadores</option>
                <option value="equipa_gestao">Equipa de Gestão & Secretaria</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assunto</label>
              <input
                type="text"
                value={assunto}
                onChange={e => setAssunto(e.target.value)}
                placeholder="Ex: Confirmação da data da avaliação..."
                required
                className="w-full mt-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Conteúdo</label>
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                rows={4}
                placeholder="Escreva a mensagem ou aviso institucional..."
                required
                className="w-full mt-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--fortis-primary)' }}
            >
              <Send size={14} />
              <span>Enviar Comunicação</span>
            </button>
          </form>
        </div>

        {/* Histórico de Comunicações */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell size={16} className="text-amber-500" />
            <span>Registo de Envios Recentes</span>
          </h3>

          <div className="space-y-3">
            {communications.map(msg => (
              <div
                key={msg.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {msg.assunto}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{msg.data}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {msg.destinatarios}
                  </span>
                  <span>•</span>
                  <span>Enviado por: {msg.enviadoPor}</span>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 size={12} />
                  <span>{msg.estado}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
