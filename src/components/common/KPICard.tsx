import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: number | null;
  changePeriodLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  tooltip?: string;
  accentColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subValue,
  change,
  changePeriodLabel = 'vs prev period',
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  tooltip,
  accentColor
}) => {
  const isPositive = change !== null && change !== undefined && change > 0;
  const isNegative = change !== null && change !== undefined && change < 0;
  const isNeutral = change === null || change === undefined || change === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-card transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500">{title}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{value}</span>
          </div>
          {subValue && (
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{subValue}</div>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} ${iconColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {change !== null && change !== undefined ? (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : isNegative
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              {isNeutral && <Minus className="w-3 h-3" />}
              {isPositive ? `+${change.toFixed(1)}%` : isNegative ? `${change.toFixed(1)}%` : '0.0%'}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              Baseline
            </span>
          )}
          <span className="text-slate-400 font-normal">{changePeriodLabel}</span>
        </div>
      </div>
    </div>
  );
};
