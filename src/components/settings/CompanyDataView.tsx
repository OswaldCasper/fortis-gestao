/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * CompanyDataView: Consulta e edição dos Dados da Empresa / Organização (image 8)
 */

import React, { useState } from 'react';
import {
  Building2,
  Edit,
  Save,
  CheckCircle2,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

export const CompanyDataView: React.FC = () => {
  const { currentOrg, currentUser, hasRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const [form, setForm] = useState({
    designacao: currentOrg.designacao,
    descricaoInstitucional: currentOrg.descricaoInstitucional || 'Centro de Formação Profissional',
    diretor: currentOrg.diretor,
    nif: currentOrg.nif,
    numeroLicenca: currentOrg.numeroLicenca,
    localizacao: currentOrg.localizacao,
    iban: currentOrg.iban,
    expressConta: currentOrg.expressConta,
    telefone: currentOrg.telefone,
    email: currentOrg.email,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateOrganization(currentOrg.id, form, currentUser.id);
    setIsEditing(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  // Cálculo de dias restantes de licença
  const dataTermino = new Date(currentOrg.dataTermino);
  const hoje = new Date();
  const diffTime = dataTermino.getTime() - hoje.getTime();
  const diasRestantes = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const mesesRestantes = Math.round(diasRestantes / 30);

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Dados da Empresa e Licença</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Informações cadastrais oficiais, alvará de formação e vigência da subscrição
          </p>
        </div>

        {hasRole(['superadmin_org', 'admin']) && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Edit size={13} />
            <span>{isEditing ? 'Cancelar Edição' : 'Editar Dados'}</span>
          </button>
        )}
      </div>

      {savedFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Dados da organização atualizados com sucesso e registados em auditoria.</span>
        </div>
      )}

      {/* Cartão de Dados (Fiel ao AppSheet image 8) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Designação da Empresa
              </span>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={form.designacao}
                  onChange={e => setForm(f => ({ ...f, designacao: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              ) : (
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentOrg.designacao}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Descrição Institucional (Apresentada no Menu)
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={form.descricaoInstitucional}
                  onChange={e => setForm(f => ({ ...f, descricaoInstitucional: e.target.value }))}
                  placeholder="Ex: Centro de Formação Profissional"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {currentOrg.descricaoInstitucional || 'Centro de Formação Profissional'}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Diretor Geral
              </span>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={form.diretor}
                  onChange={e => setForm(f => ({ ...f, diretor: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{currentOrg.diretor}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                NIF da Empresa
              </span>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={form.nif}
                  onChange={e => setForm(f => ({ ...f, nif: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              ) : (
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{currentOrg.nif}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Número da Licença / Alvará
              </span>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={form.numeroLicenca}
                  onChange={e => setForm(f => ({ ...f, numeroLicenca: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              ) : (
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{currentOrg.numeroLicenca}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Localização da Empresa
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={form.localizacao}
                  onChange={e => setForm(f => ({ ...f, localizacao: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>{currentOrg.localizacao}</span>
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                IBAN da Empresa
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={form.iban}
                  onChange={e => setForm(f => ({ ...f, iban: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              ) : (
                <p className="text-xs font-mono text-slate-800 dark:text-slate-200">{currentOrg.iban}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Express / Conta Móvel
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={form.expressConta}
                  onChange={e => setForm(f => ({ ...f, expressConta: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              ) : (
                <p className="text-xs font-mono text-slate-800 dark:text-slate-200">{currentOrg.expressConta}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Telefone Oficial
              </span>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              ) : (
                <p className="text-xs font-mono text-slate-800 dark:text-slate-200">{currentOrg.telefone}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Email Institucional
              </span>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              ) : (
                <p className="text-xs text-slate-800 dark:text-slate-200">{currentOrg.email}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Guardar Alterações
              </button>
            </div>
          )}
        </form>

        {/* Informações da Subscrição SaaS (Image 8) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-[10px] text-slate-400 block">Pacote Aderido</span>
            <span className="font-bold text-amber-700 dark:text-amber-300 capitalize">{currentOrg.pacote}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-[10px] text-slate-400 block">Data de Adesão</span>
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              {new Date(currentOrg.dataAdesao).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-[10px] text-slate-400 block">Término da Licença</span>
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              {new Date(currentOrg.dataTermino).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-[10px] text-slate-400 block">Tempo Restante</span>
            <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {diasRestantes} dias ({mesesRestantes} meses)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
