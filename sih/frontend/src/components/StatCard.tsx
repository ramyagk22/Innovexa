import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  colorScheme?: 'teal' | 'blue' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'teal'
}) => {
  const schemeStyles = {
    teal: {
      border: 'border-teal-100',
      bgIcon: 'bg-teal-50 text-teal-600',
      accent: 'text-teal-900'
    },
    blue: {
      border: 'border-blue-100',
      bgIcon: 'bg-blue-50 text-blue-600',
      accent: 'text-blue-900'
    },
    amber: {
      border: 'border-amber-100',
      bgIcon: 'bg-amber-50 text-amber-600',
      accent: 'text-amber-900'
    },
    rose: {
      border: 'border-rose-100',
      bgIcon: 'bg-rose-50 text-rose-600',
      accent: 'text-rose-900'
    }
  }[colorScheme];

  return (
    <div className={`bg-white rounded-2xl p-5 border ${schemeStyles.border} shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-bold mt-1.5 ${schemeStyles.accent}`}>{value}</h3>
        </div>
        <div className={`w-11 h-11 rounded-xl ${schemeStyles.bgIcon} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        <span className="text-slate-500 font-medium">{subtitle}</span>
        {trend && (
          <span className={`flex items-center font-semibold ${trend.isUp ? 'text-emerald-600' : 'text-slate-500'}`}>
            {trend.isUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
