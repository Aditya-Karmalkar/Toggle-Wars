import React, { useState } from 'react';
import { useFlags, useFlagsmith } from '@flagsmith/flagsmith/react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  Search,
  Bell,
  Calendar,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Sparkles
} from 'lucide-react';
import { exportComprehensiveBIExcel } from '../../utils/exportUtils';

export const Header: React.FC = () => {
  const flags = useFlags(['show_demo_button']);
  const flagsmith = useFlagsmith();
  const isDemoEnabled = flags?.['show_demo_button']?.enabled;
  const demoVariant = flags?.['show_demo_button']?.value;

  const {
    filters,
    setFilters,
    availableFYs,
    kpiMetrics,
    records,
    financialYearData,
    customerSummaries,
    monthlyData,
    setActiveTab
  } = useSalesData();

  const [searchOpen, setSearchOpen] = useState(false);

  const handleExportData = () => {
    exportComprehensiveBIExcel(
      kpiMetrics,
      records,
      financialYearData,
      customerSummaries,
      monthlyData,
      'Gran_Asia_Sales_Executive_Report'
    );
  };

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* 1. Left: Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
          <Building2 className="w-5 h-5 text-brand-500" />
        </div>

        <div>
          <div className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
            Gran Asia Life Sciences
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Executive sales & revenue growth analytics
          </div>
        </div>
      </div>

      {/* 2. Center/Right: Action controls & Stylish Pills */}
      <div className="flex items-center gap-2.5">
        {/* Search button / input */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Search metrics, invoices..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                onBlur={() => !filters.searchQuery && setSearchOpen(false)}
                className="bg-transparent text-xs text-slate-800 focus:outline-hidden w-40"
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors focus-visible:ring-1 focus-visible:ring-brand-500"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notifications Icon with Indicator */}
        <button
          onClick={() => setActiveTab('insights')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors relative focus-visible:ring-1 focus-visible:ring-brand-500"
          title="Automated insights & alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>

        {/* Date Selector Pill */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.financialYear}
              onChange={(e) => setFilters({ financialYear: e.target.value })}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Financial Years</option>
              {availableFYs.map(fy => (
                <option key={fy} value={fy}>FY {fy}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter by Pill */}
        <button
          onClick={() => setActiveTab('transactions')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors focus-visible:ring-1 focus-visible:ring-brand-500"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter by</span>
        </button>

        {/* Flagsmith Experimentation Feature Flag Button */}
        {isDemoEnabled && (
          <button
            onClick={() => {
              try {
                flagsmith.trackEvent('demo_button_clicked');
              } catch {}
              setActiveTab('insights');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
            title={`Flagsmith Experiment Variant: ${String(demoVariant)}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{demoVariant === 'treatment' || demoVariant === 'variant_b' ? 'Executive Tour' : 'View Demo'}</span>
          </button>
        )}

        {/* Primary CTA */}
        <button
          onClick={() => setActiveTab('data-management')}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Import Excel</span>
        </button>
      </div>
    </header>
  );
};
