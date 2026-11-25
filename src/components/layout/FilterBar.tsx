import React from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import { FY_MONTHS } from '../../utils/formatters';
import {
  RotateCcw,
  X
} from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    filteredRecords,
    records
  } = useSalesData();

  const activeCount = [
    filters.financialYear !== 'ALL',
    filters.selectedMonths.length > 0,
    filters.customerName !== 'ALL',
    filters.startDate !== '',
    filters.endDate !== '',
    filters.searchQuery !== ''
  ].filter(Boolean).length;

  const toggleMonth = (mCode: string) => {
    const exists = filters.selectedMonths.includes(mCode);
    const updated = exists
      ? filters.selectedMonths.filter(m => m !== mCode)
      : [...filters.selectedMonths, mCode];
    setFilters({ selectedMonths: updated });
  };

  return (
    <div className="bg-white border-b border-slate-100 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Month Filter Selector Pills (Indian Fiscal Cycle: Apr to Mar) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-500 mr-1">Fiscal Months:</span>
        {FY_MONTHS.map(m => {
          const isSelected = filters.selectedMonths.includes(m.code);
          return (
            <button
              key={m.code}
              onClick={() => toggleMonth(m.code)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-colors ${
                isSelected
                  ? 'bg-[var(--color-brand)] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {m.code}
            </button>
          );
        })}

        {filters.selectedMonths.length > 0 && (
          <button
            onClick={() => setFilters({ selectedMonths: [] })}
            className="text-[11px] text-[var(--color-brand)] hover:underline font-bold ml-1 transition-colors"
          >
            Clear Months
          </button>
        )}
      </div>

      {/* Right side: Active Filters summary & Reset */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-500 font-medium">
          Showing <strong className="text-slate-900 font-extrabold">{filteredRecords.length}</strong> of {records.length} sales records
        </span>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ({activeCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
