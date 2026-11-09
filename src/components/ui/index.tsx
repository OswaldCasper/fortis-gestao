/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * Design System UI Components: Card, PageHeader, StatCard, StatusBadge, DataTable, FilterBar, EmptyState, Tabs, SegmentedControl
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

/* 1. Card */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl shadow-xs transition-colors ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* 2. PageHeader */
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E3E8EF] dark:border-[#223347] ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-lg bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)]">
              <Icon size={20} />
            </div>
          )}
          <h1 className="text-[22px] font-semibold text-[#1B2A3A] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {badge}
          </h1>
        </div>
        {description && (
          <p className="text-xs text-[#5B6B7C] dark:text-[#94A3B8] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/* 3. StatCard */
interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl p-4 shadow-xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-[var(--fortis-primary)] hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#5B6B7C] dark:text-[#94A3B8] uppercase tracking-wider truncate">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)] flex items-center justify-center shrink-0">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-[#1B2A3A] dark:text-[#F1F5F9] tabular-nums tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
              trend.isPositive
                ? 'bg-[#E8F5F1] text-[#16866A] dark:bg-[#0C3328] dark:text-[#20A785]'
                : 'bg-[#FDF2F2] text-[#D32F2F] dark:bg-[#381414] dark:text-[#EF4444]'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] mt-1.5 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};

/* 4. StatusBadge */
export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<StatusBadgeVariant, { bg: string; text: string; dot: string }> = {
    success: {
      bg: 'bg-[#E8F5F1] dark:bg-[#0C3328]',
      text: 'text-[#16866A] dark:text-[#20A785]',
      dot: 'bg-[#16866A]',
    },
    warning: {
      bg: 'bg-[#FEF7EB] dark:bg-[#382808]',
      text: 'text-[#D99B24] dark:text-[#E8AA35]',
      dot: 'bg-[#D99B24]',
    },
    danger: {
      bg: 'bg-[#FDF2F2] dark:bg-[#381414]',
      text: 'text-[#D32F2F] dark:text-[#EF4444]',
      dot: 'bg-[#D32F2F]',
    },
    info: {
      bg: 'bg-[#EFF6FF] dark:bg-[#122645]',
      text: 'text-[#183B5B] dark:text-[#60A5FA]',
      dot: 'bg-[#183B5B]',
    },
    primary: {
      bg: 'bg-[var(--fortis-primary-soft)]',
      text: 'text-[var(--fortis-primary)]',
      dot: 'bg-[var(--fortis-primary)]',
    },
    neutral: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-[#5B6B7C] dark:text-[#94A3B8]',
      dot: 'bg-[#5B6B7C]',
    },
  };

  const style = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md uppercase tracking-wider font-mono ${style.bg} ${style.text} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      <span>{children}</span>
    </span>
  );
};

/* 5. DataTable */
interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto border border-[#E3E8EF] dark:border-[#223347] rounded-xl bg-white dark:bg-[#152232] shadow-xs ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        {children}
      </table>
    </div>
  );
};

/* 6. FilterBar */
interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#152232] border border-[#E3E8EF] dark:border-[#223347] rounded-xl shadow-xs ${className}`}>
      {children}
    </div>
  );
};

/* 7. EmptyState */
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-[#E3E8EF] dark:border-[#223347] bg-white/50 dark:bg-[#152232]/50 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)] flex items-center justify-center">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#1B2A3A] dark:text-[#F1F5F9]">
        {title}
      </h3>
      <p className="text-xs text-[#5B6B7C] dark:text-[#94A3B8] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div className="inline-flex justify-center">{action}</div>}
    </div>
  );
};

/* 8. Tabs (Sublinhado) */
interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 border-b border-[#E3E8EF] dark:border-[#223347] overflow-x-auto ${className}`}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[var(--fortis-primary)] text-[var(--fortis-primary)]'
                : 'border-transparent text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9]'
            }`}
          >
            {Icon && <Icon size={16} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-[var(--fortis-primary-soft)] text-[var(--fortis-primary)]'
                    : 'bg-slate-100 dark:bg-slate-800 text-[#5B6B7C]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* 9. SegmentedControl */
interface SegmentedOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'p-0.5 text-xs' : 'p-1 text-xs';
  const itemClasses = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <div
      className={`inline-flex items-center bg-[#F4F6F9] dark:bg-[#0B111B] border border-[#E3E8EF] dark:border-[#223347] rounded-lg ${sizeClasses} ${className}`}
    >
      {options.map(opt => {
        const Icon = opt.icon;
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 font-medium rounded-md transition-all ${itemClasses} ${
              isSelected
                ? 'bg-white dark:bg-[#152232] text-[#1B2A3A] dark:text-[#F1F5F9] shadow-xs font-semibold'
                : 'text-[#5B6B7C] dark:text-[#94A3B8] hover:text-[#1B2A3A] dark:hover:text-[#F1F5F9]'
            }`}
          >
            {Icon && <Icon size={14} className={isSelected ? 'text-[var(--fortis-primary)]' : ''} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
