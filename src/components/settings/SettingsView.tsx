import React from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  Settings,
  Sliders,
  DollarSign,
  Monitor,
  Database,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Code2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currencyFormat,
    setCurrencyFormat,
    segmentationConfig,
    setSegmentationConfig,
    isPresentationMode,
    togglePresentationMode,
    resetToDefaultData,
    records
  } = useSalesData();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Configuration & Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure currency formatting, customer tier thresholds, display preferences, and local data persistence.
        </p>
      </div>

      {/* 1. Display & Currency Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Currency & Numeric Formatting</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Live across all dashboard pages
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <label
            onClick={() => setCurrencyFormat('INR_LAKHS')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-colors ${
              currencyFormat === 'INR_LAKHS'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">INR (Lakhs/Crores)</span>
              {currencyFormat === 'INR_LAKHS' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Preview: <span className="font-mono text-slate-800 font-semibold">₹ 1.11 Cr / ₹ 40.20 L</span></p>
            <span className="text-[10px] text-blue-700 font-semibold mt-2 inline-block">Executive & Boardroom</span>
          </label>

          <label
            onClick={() => setCurrencyFormat('INR_FULL')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-colors ${
              currencyFormat === 'INR_FULL'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">INR (Full Standard)</span>
              {currencyFormat === 'INR_FULL' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Preview: <span className="font-mono text-slate-800 font-semibold">₹ 1,11,47,784</span></p>
            <span className="text-[10px] text-slate-600 font-medium mt-2 inline-block">Audit & Statutory Ledger</span>
          </label>

          <label
            onClick={() => setCurrencyFormat('USD')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-colors ${
              currencyFormat === 'USD'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">US Dollar (USD)</span>
              {currencyFormat === 'USD' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Preview: <span className="font-mono text-slate-800 font-semibold">$ 133.51 K / $ 1.34 M</span></p>
            <span className="text-[10px] text-slate-600 font-medium mt-2 inline-block">Global Investor Format ($)</span>
          </label>

          <label
            onClick={() => setCurrencyFormat('EUR')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-colors ${
              currencyFormat === 'EUR'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Euro (EUR)</span>
              {currencyFormat === 'EUR' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Preview: <span className="font-mono text-slate-800 font-semibold">€ 123.18 K / € 1.23 M</span></p>
            <span className="text-[10px] text-slate-600 font-medium mt-2 inline-block">European Corporate (€)</span>
          </label>

          <label
            onClick={() => setCurrencyFormat('GBP')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-colors ${
              currencyFormat === 'GBP'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">British Pound (GBP)</span>
              {currencyFormat === 'GBP' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Preview: <span className="font-mono text-slate-800 font-semibold">£ 105.37 K / £ 1.05 M</span></p>
            <span className="text-[10px] text-slate-600 font-medium mt-2 inline-block">UK & Commonwealth (£)</span>
          </label>
        </div>
      </div>

      {/* 2. Customer Segmentation Thresholds */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Customer Segmentation Cutoffs</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-800 block">High-Value Tier Threshold (%)</label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Minimum revenue contribution percentage required to be classified as High-Value (default: 5.0%)
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                step="0.5"
                value={segmentationConfig.highValueThresholdPct}
                onChange={(e) => setSegmentationConfig({
                  ...segmentationConfig,
                  highValueThresholdPct: parseFloat(e.target.value) || 5
                })}
                className="w-24 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800"
              />
              <span className="text-xs font-bold text-slate-500">% of Enterprise Sales</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-800 block">Medium-Value Tier Threshold (%)</label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Minimum revenue contribution percentage for Medium-Value classification (default: 1.0%)
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.2"
                value={segmentationConfig.mediumValueThresholdPct}
                onChange={(e) => setSegmentationConfig({
                  ...segmentationConfig,
                  mediumValueThresholdPct: parseFloat(e.target.value) || 1
                })}
                className="w-24 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800"
              />
              <span className="text-xs font-bold text-slate-500">% of Enterprise Sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. View / Kiosk Mode */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Power BI Kiosk / Presentation Mode</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Collapses navigation and maximises dashboard charts for executive boardroom presentation displays.
          </p>
        </div>

        <button
          onClick={togglePresentationMode}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${
            isPresentationMode
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {isPresentationMode ? 'Active (Exit Kiosk)' : 'Enable Kiosk Mode'}
        </button>
      </div>

      {/* 4. Local Data & Cache Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Dataset Storage & Memory</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Currently storing {records.length} transactions locally. Resetting restores original OJT dataset.
          </p>
        </div>

        <button
          onClick={resetToDefaultData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Original Dataset</span>
        </button>
      </div>

      {/* 5. Project Technology Stack Info */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Code2 className="w-4 h-4 text-blue-600" />
          <span>System Architecture & Technologies</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Built with React 18, TypeScript, Tailwind CSS, Recharts BI visualization engine, SheetJS (XLSX parsing), and jsPDF autoTable. Strictly adheres to Indian Financial Year cycles (April–March) with Taxable Value revenue recognition.
        </p>
      </div>
    </div>
  );
};
