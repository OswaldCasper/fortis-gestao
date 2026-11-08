/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * ThemeContext: Motor de personalização de cores institucionais em tempo real e modo claro/escuro
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TemaConfig } from '../types';

interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  warning?: string;
  suggestedAlt?: string;
}

interface ThemeContextType {
  themeMode: 'claro' | 'escuro' | 'auto';
  setThemeMode: (mode: 'claro' | 'escuro' | 'auto') => void;
  temaConfig: TemaConfig;
  updateOrganizationColors: (newColors: Partial<TemaConfig>) => void;
  resetToDefaults: () => void;
  checkContrast: (hexColor: string, isBackgroundDark?: boolean) => ContrastResult;
  isDarkMode: boolean;
}

const DEFAULT_TEMA_CONFIG: TemaConfig = {
  corPrimaria: '#C59B27', // Dourado nobre padrão FORTIS
  corSecundaria: '#0F172A', // Ardósia / Obsidiana corporativo
  corTerciaria: '#3B82F6', // Azul institucional
  modoPadrao: 'claro',
};

// Utilitário para converter HEX em RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return null;
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(c => c + c).join('') 
    : cleanHex;
  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Cálculo da Luminância Relativa (WCAG 2.1)
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [sR, sG, sB] = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

// Cálculo do Rácio de Contraste WCAG (ex: 4.5:1 para AA)
export function calculateContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const fg = hexToRgb(foregroundHex);
  const bg = hexToRgb(backgroundHex);
  if (!fg || !bg) return 4.5;
  const l1 = getRelativeLuminance(fg.r, fg.g, fg.b);
  const l2 = getRelativeLuminance(bg.r, bg.g, bg.b);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// Gerar variação mais escura para hover
function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.max(0, Math.min(255, Math.floor(rgb.r * (1 + percent / 100))));
  const g = Math.max(0, Math.min(255, Math.floor(rgb.g * (1 + percent / 100))));
  const b = Math.max(0, Math.min(255, Math.floor(rgb.b * (1 + percent / 100))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de modo claro / escuro individual
  const [themeMode, setThemeModeState] = useState<'claro' | 'escuro' | 'auto'>(() => {
    const saved = localStorage.getItem('fortis_theme_mode');
    return (saved as 'claro' | 'escuro' | 'auto') || 'claro';
  });

  // Estado das cores da organização
  const [temaConfig, setTemaConfig] = useState<TemaConfig>(() => {
    const saved = localStorage.getItem('fortis_org_theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_TEMA_CONFIG;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Monitorização de tema do sistema (prefers-color-scheme)
  useEffect(() => {
    const checkDark = () => {
      if (themeMode === 'escuro') return true;
      if (themeMode === 'claro') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const dark = checkDark();
    setIsDarkMode(dark);

    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  // Aplicação das variáveis CSS globais em tempo real
  useEffect(() => {
    const root = document.documentElement;
    const prim = temaConfig.corPrimaria || DEFAULT_TEMA_CONFIG.corPrimaria;
    const sec = temaConfig.corSecundaria || DEFAULT_TEMA_CONFIG.corSecundaria;
    const tert = temaConfig.corTerciaria || DEFAULT_TEMA_CONFIG.corTerciaria;

    root.style.setProperty('--fortis-primary', prim);
    root.style.setProperty('--fortis-primary-hover', adjustColorBrightness(prim, -12));
    
    const rgbPrim = hexToRgb(prim);
    if (rgbPrim) {
      root.style.setProperty('--fortis-primary-ring', `rgba(${rgbPrim.r}, ${rgbPrim.g}, ${rgbPrim.b}, 0.35)`);
      root.style.setProperty('--fortis-primary-light', isDarkMode 
        ? `rgba(${rgbPrim.r}, ${rgbPrim.g}, ${rgbPrim.b}, 0.15)` 
        : `rgba(${rgbPrim.r}, ${rgbPrim.g}, ${rgbPrim.b}, 0.08)`);
    }

    root.style.setProperty('--fortis-secondary', sec);
    root.style.setProperty('--fortis-secondary-hover', adjustColorBrightness(sec, 10));
    root.style.setProperty('--fortis-tertiary', tert);
    root.style.setProperty('--fortis-tertiary-hover', adjustColorBrightness(tert, -10));

    localStorage.setItem('fortis_org_theme', JSON.stringify(temaConfig));
  }, [temaConfig, isDarkMode]);

  const setThemeMode = (mode: 'claro' | 'escuro' | 'auto') => {
    setThemeModeState(mode);
    localStorage.setItem('fortis_theme_mode', mode);
  };

  const updateOrganizationColors = (newColors: Partial<TemaConfig>) => {
    setTemaConfig(prev => ({
      ...prev,
      ...newColors,
    }));
  };

  const resetToDefaults = () => {
    setTemaConfig(DEFAULT_TEMA_CONFIG);
    localStorage.removeItem('fortis_org_theme');
  };

  // Verificação de Contraste com avisos WCAG AA
  const checkContrast = (hexColor: string, isBgDark = isDarkMode): ContrastResult => {
    const bg = isBgDark ? '#0F172A' : '#FFFFFF';
    const ratio = calculateContrastRatio(hexColor, bg);
    const passesAA = ratio >= 4.5;
    
    let warning: string | undefined;
    let suggestedAlt: string | undefined;

    if (!passesAA) {
      warning = `Rácio de contraste ${ratio.toFixed(1)}:1 abaixo do padrão WCAG AA (mínimo 4.5:1). A legibilidade pode ficar comprometida.`;
      suggestedAlt = isBgDark 
        ? adjustColorBrightness(hexColor, 25) 
        : adjustColorBrightness(hexColor, -25);
    }

    return {
      ratio,
      passesAA,
      warning,
      suggestedAlt,
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        temaConfig,
        updateOrganizationColors,
        resetToDefaults,
        checkContrast,
        isDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
