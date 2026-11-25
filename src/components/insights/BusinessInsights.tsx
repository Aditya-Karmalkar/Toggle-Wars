import React, { useState } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import { ArrowUpRight } from 'lucide-react';
import { formatCompactINR, formatINR } from '../../utils/formatters';

export const BusinessInsights: React.FC = () => {
  const { automatedInsights, setActiveTab, kpiMetrics, customerSummaries, financialYearData } = useSalesData();
  const [filterCategory, setFilterCategory] = useState<'all' | 'positive' | 'warning' | 'recommendation'>('all');

  const filteredInsights = automatedInsights.filter(insight => {
    if (filterCategory === 'all') return true;
    return insight.category === filterCategory;
  });

  const positiveCount = automatedInsights.filter(i => i.category === 'positive').length;
  const warningCount = automatedInsights.filter(i => i.category === 'warning').length;
  const recommendationCount = automatedInsights.filter(i => i.category === 'recommendation').length;

  const topCustomer = customerSummaries[0];
  const latestFY = financialYearData[financialYearData.length - 1];

  return (
    <div className="space-y-6 w-full">
      {/* 1. Page Header (Editorial Enterprise Style) */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            Business Observations & Executive Briefing
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Quantitative findings, risk assessments, and strategic directives computed directly from the verified Gran Asia sales ledger.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-slate-400 ${
              filterCategory === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All observations ({automatedInsights.length})
          </button>

          <button
            onClick={() => setFilterCategory('positive')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500 ${
              filterCategory === 'positive'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Growth ({positiveCount})
          </button>

          <button
            onClick={() => setFilterCategory('warning')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-rose-500 ${
              filterCategory === 'warning'
                ? 'bg-white text-rose-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Risks ({warningCount})
          </button>

          <button
            onClick={() => setFilterCategory('recommendation')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-brand-500 ${
              filterCategory === 'recommendation'
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Directives ({recommendationCount})
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Summary Row (Matching Overview Card Styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Primary expansion driver</span>
            <span className="badge-pill-positive">Growth</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono">
            +{latestFY?.yoyGrowth ? latestFY.yoyGrowth.toFixed(1) : '59.2'}% YoY
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            FY 2025-26 revenue jump
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Key client concentration</span>
            <span className="badge-pill-negative">Risk</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-amber-600 mt-1 font-mono">
            {topCustomer?.revenueContributionPct.toFixed(1)}% Share
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {topCustomer?.partyName || 'PS Auto Systems'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Client retention rate</span>
            <span className="badge-pill-positive">Stable</span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-emerald-600 mt-1 font-mono">
            60.6% Repeat
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            20 repeat enterprise buyers
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ledger audit verification</span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Audit
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono">
            265 Invoices
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {formatINR(kpiMetrics.totalRevenue)} taxable turnover
          </div>
        </div>
      </div>

      {/* 3. Main Briefing Section: Observations List + Executive Action Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
        {/* Left 2 Columns: Detailed Analytical Findings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Computed Analytical Findings ({filteredInsights.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Ranked by operational priority
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredInsights.map(insight => {
              const isPositive = insight.category === 'positive';
              const isWarning = insight.category === 'warning';

              return (
                <div
                  key={insight.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-card transition-shadow"
                >
                  {/* Category Pill and Impact Value */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isPositive
                            ? 'badge-pill-positive'
                            : isWarning
                            ? 'badge-pill-negative'
                            : 'bg-brand-50 text-brand-800 border border-brand-200'
                        }`}
                      >
                        {isPositive ? 'Growth observation' : isWarning ? 'Risk factor' : 'Strategic directive'}
                      </span>

                      <span className="text-xs text-slate-400">
                        Priority: <strong className="text-slate-700 font-medium capitalize">{insight.priority}</strong>
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-900">
                      {insight.highlightValue}
                    </span>
                  </div>

                  {/* Title and Narrative */}
                  <h4 className="text-base font-bold text-slate-900 mt-2.5">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {insight.description}
                  </p>

                  {/* Mathematical Proof (Editorial Quote Line - No nested card) */}
                  <div className="mt-3 pl-3 border-l-2 border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Calculated proof: </span>
                    <span className="font-mono text-slate-600">{insight.mathematicalProof}</span>
                  </div>

                  {/* Recommended Action (Editorial Accent Line - No nested card) */}
                  {insight.actionableStep && (
                    <div className="mt-2.5 pl-3 border-l-2 border-brand-400 text-xs text-slate-800">
                      <span className="font-semibold text-slate-900">Recommended action: </span>
                      <span>{insight.actionableStep}</span>
                    </div>
                  )}

                  {/* Metadata and Context Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
                      {Object.entries(insight.metrics).map(([key, val]) => (
                        <span key={key}>
                          <span className="text-slate-400">{key}:</span>{' '}
                          <strong className="font-mono text-slate-700">{val}</strong>
                        </span>
                      ))}
                    </div>

                    {isWarning && insight.id === 'warn-1' && (
                      <button
                        onClick={() => setActiveTab('customers')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Customer concentration</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isPositive && insight.id === 'pos-1' && (
                      <button
                        onClick={() => setActiveTab('sales')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>FY comparative</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isWarning && insight.id === 'warn-3' && (
                      <button
                        onClick={() => setActiveTab('transactions')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Audit in ledger</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Executive Directives Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Executive Action Roadmap
            </h3>
            <span className="text-[11px] text-brand-600 font-bold">
              Management Agenda
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-card transition-shadow space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500">Priority 1 · High Impact</div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Diversify Corporate Client Base
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                PS Auto Systems represents 41.5% of total sales. Initiate outreach to mid-tier enterprise buyers to bring single-account concentration below 25%.
              </p>
              <button
                onClick={() => setActiveTab('customers')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>Review client matrix</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500">Priority 2 · Retention</div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Re-engage Inactive Accounts
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Several high-value past clients placed no orders in FY 2025-26. Launch targeted outreach with updated product catalogues.
              </p>
              <button
                onClick={() => setActiveTab('customers')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>Inspect order history</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500">Priority 3 · Governance</div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Audit Duplicate Invoice Sequence
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Invoice sequence 25-26/23 appears twice in the sales ledger. Verify with finance whether this reflects a split delivery or ERP re-entry.
              </p>
              <button
                onClick={() => setActiveTab('transactions')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>View in explorer</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500">Priority 4 · Growth</div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Capitalize on Q3 Peak Momentum
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                December consistently achieves peak revenue velocity (₹ 20.85 L). Plan advance production inventory for October–December quarters.
              </p>
              <button
                onClick={() => setActiveTab('sales')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>Inspect velocity cycles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
