/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * AppearanceSettings: Secção "Aparência e Personalização" com Color Picker, HEX, Live Preview em tempo real e teste WCAG AA
 */

import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const AppearanceSettings: React.FC = () => {
  const {
    themeMode,
    setThemeMode,
    temaConfig,
    updateOrganizationColors,
    resetToDefaults,
    checkContrast,
    isDarkMode,
  } = useTheme();
  const { currentOrg, hasRole } = useAuth();

  // Cores temporárias para teste ou edição imediata
  const [primaria, setPrimaria] = useState(temaConfig.corPrimaria);
  const [secundaria, setSecundaria] = useState(temaConfig.corSecundaria);
  const [terciaria, setTerciaria] = useState(temaConfig.corTerciaria);

  // Verificação de Contraste WCAG em tempo real
  const contrastCheck = checkContrast(primaria, isDarkMode);

  const handleApplyColors = (p: string, s: string, t: string) => {
    setPrimaria(p);
    setSecundaria(s);
    setTerciaria(t);
    updateOrganizationColors({
      corPrimaria: p,
      corSecundaria: s,
      corTerciaria: t,
    });
  };

  const presetPalettes = [
    { nome: 'FORTIS Dourado Imperial (Padrão)', prim: '#C59B27', sec: '#0F172A', tert: '#3B82F6' },
    { nome: 'Azul Executivo Corporativo', prim: '#1E40AF', sec: '#0F172A', tert: '#10B981' },
    { nome: 'Esmeralda Qualidade & Sustentabilidade', prim: '#059669', sec: '#064E3B', tert: '#D97706' },
    { nome: 'Grafite & Âmbar Minimalista', prim: '#D97706', sec: '#18181B', tert: '#6366F1' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-5xl">
      {/* Cabeçalho */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Palette size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Aparência e Personalização</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalize a identidade visual institucional da organização ({currentOrg.designacao})
          </p>
        </div>

        <button
          onClick={resetToDefaults}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw size={13} />
          <span>Repor Padrões FORTIS</span>
        </button>
      </div>

      {/* 1. SELEÇÃO DE TEMA (CLARO / ESCURO / AUTO) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Modo de Exibição</h2>
          <p className="text-xs text-slate-400">Escolha a sua preferência de contraste e iluminação de ecrã:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'claro' as const, label: 'Tema Claro', desc: 'Fundo branco puro e alto contraste diurno', icon: Sun },
            { id: 'escuro' as const, label: 'Tema Escuro', desc: 'Superfícies em ardósia/obsidiana para menor fadiga visual', icon: Moon },
            { id: 'auto' as const, label: 'Automático', desc: 'Sincronizado com as preferências do dispositivo', icon: Monitor },
          ].map(m => {
            const Icon = m.icon;
            const isSelected = themeMode === m.id;

            return (
              <button
                key={m.id}
                onClick={() => setThemeMode(m.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={18} style={{ color: isSelected ? 'var(--fortis-primary)' : undefined }} />
                  {isSelected && <CheckCircle2 size={16} className="text-amber-500" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SELETOR DE CORES INSTITUCIONAIS (COLOR PICKER & HEX) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cores da Organização</h2>
          <p className="text-xs text-slate-400">
            Defina as cores institucionais que serão aplicadas a todos os utilizadores da sua empresa:
          </p>
        </div>

        {/* Paletas Rápidas Pré-definidas */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Paletas Recomendadas
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {presetPalettes.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyColors(p.prim, p.sec, p.tert)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition-all bg-slate-50 dark:bg-slate-850/50"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: p.prim }} />
                  <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: p.sec }} />
                  <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: p.tert }} />
                </div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{p.nome}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs de Cor Primária, Secundária e Terciária */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Cor Primária */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Cor Primária</span>
              <p className="text-[11px] text-slate-400">Botões principais, abas ativas, destaques</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaria}
                onChange={e => handleApplyColors(e.target.value, secundaria, terciaria)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5 bg-transparent"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={primaria}
                  onChange={e => handleApplyColors(e.target.value, secundaria, terciaria)}
                  className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-bold"
                />
              </div>
            </div>
          </div>

          {/* Cor Secundária */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Cor Secundária</span>
              <p className="text-[11px] text-slate-400">Estruturas, menus e apoios visuais</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secundaria}
                onChange={e => handleApplyColors(primaria, e.target.value, terciaria)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5 bg-transparent"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={secundaria}
                  onChange={e => handleApplyColors(primaria, e.target.value, terciaria)}
                  className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-bold"
                />
              </div>
            </div>
          </div>

          {/* Cor Terciária */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Cor Terciária</span>
              <p className="text-[11px] text-slate-400">Indicadores secundários e badges de contexto</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={terciaria}
                onChange={e => handleApplyColors(primaria, secundaria, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5 bg-transparent"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={terciaria}
                  onChange={e => handleApplyColors(primaria, secundaria, e.target.value)}
                  className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. AVALIAÇÃO DE CONTRASTE E ACESSIBILIDADE WCAG AA */}
        <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
          contrastCheck.passesAA
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
        }`}>
          {contrastCheck.passesAA ? (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <p className="font-bold">
              {contrastCheck.passesAA 
                ? `Contraste em conformidade WCAG AA (${contrastCheck.ratio.toFixed(1)}:1)` 
                : contrastCheck.warning}
            </p>
            <p className="text-[11px] opacity-80">
              A acessibilidade é calculada comparando a cor primária contra o fundo {isDarkMode ? 'escuro' : 'claro'} atual da aplicação.
            </p>
            {contrastCheck.suggestedAlt && (
              <button
                onClick={() => handleApplyColors(contrastCheck.suggestedAlt!, secundaria, terciaria)}
                className="mt-1 px-2.5 py-1 rounded bg-amber-600 text-white font-semibold text-[10px] hover:bg-amber-700 transition-colors"
              >
                Aplicar tom sugerido ({contrastCheck.suggestedAlt})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. PRÉ-VISUALIZAÇÃO EM TEMPO REAL (LIVE PREVIEW) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Eye size={18} style={{ color: 'var(--fortis-primary)' }} />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Pré-Visualização em Tempo Real (Live Preview)</h2>
            <p className="text-xs text-slate-400">Verifique a harmonia visual dos componentes com as cores selecionadas:</p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 space-y-5">
          {/* Componentes de Demonstração */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm hover:opacity-95 transition-all"
              style={{ backgroundColor: 'var(--fortis-primary)' }}
            >
              Botão de Ação Primária
            </button>

            <button
              className="px-4 py-2 text-xs font-bold rounded-lg border transition-all"
              style={{
                borderColor: 'var(--fortis-primary)',
                color: 'var(--fortis-primary)',
                backgroundColor: 'var(--fortis-primary-light)',
              }}
            >
              Botão Secundário Suave
            </button>

            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: 'var(--fortis-primary-light)',
                color: 'var(--fortis-primary)',
              }}
            >
              Badge Institucional
            </span>
          </div>

          {/* Cartão de Exemplo */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-sm space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100">Ação de Exemplo</span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--fortis-primary)' }}>Em Andamento</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demonstração de cartão de curso utilizando as variáveis CSS globais injetadas no sistema.
            </p>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: 'var(--fortis-primary)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
