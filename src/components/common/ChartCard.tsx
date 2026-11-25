import React from 'react';
import { Info } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  tooltip?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-blue-50 text-blue-700',
  tooltip,
  action,
  children,
  className = '',
  headerClassName = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col ${className}`}>
      <div className={`flex flex-wrap items-start justify-between gap-2 mb-4 pb-3 border-b border-slate-100 ${headerClassName}`}>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
            {badge && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                {badge}
              </span>
            )}
            {tooltip && (
              <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                <Info className="w-4 h-4" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-20 pointer-events-none flex-col">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-normal">{subtitle}</p>}
        </div>

        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
