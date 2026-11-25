import React, { useState } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import { ChartCard } from '../common/ChartCard';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  BarChart2,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle2,
  GitCompare
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatINR, formatCompactINR, formatPercent, FY_MONTHS } from '../../utils/formatters';

export const SalesAnalytics: React.FC = () => {
  const {
    records,
    monthlyData,
    financialYearData,
    quarterlyData,
    availableFYs,
    kpiMetrics
  } = useSalesData();

  // Financial Year comparison selector
  const [fyA, setFyA] = useState<string>(availableFYs[availableFYs.length - 1] || '2025-26');
  const [fyB, setFyB] = useState<string>(availableFYs[availableFYs.length - 2] || '2024-25');

  // Calculate best and lowest months from non-zero records
  const activeMonths = monthlyData.filter(m => m.revenue > 0);
  const bestMonth = activeMonths.length > 0
    ? [...activeMonths].sort((a, b) => b.revenue - a.revenue)[0]
    : null;
  const lowestMonth = activeMonths.length > 0
    ? [...activeMonths].sort((a, b) => a.revenue - b.revenue)[0]
    : null;
  const avgMonthlyRev = activeMonths.length > 0
    ? activeMonths.reduce((acc, m) => acc + m.revenue, 0) / activeMonths.length
    : 0;

  // Comparison computation between fyA and fyB
  const dataA = records.filter(r => r.financialYear === fyA);
  const dataB = records.filter(r => r.financialYear === fyB);

  const statsA = {
    revenue: dataA.reduce((acc, r) => acc + r.taxableValue, 0),
    invoices: dataA.length,
    avgInvoice: dataA.length > 0 ? dataA.reduce((acc, r) => acc + r.taxableValue, 0) / dataA.length : 0,
    gst: dataA.reduce((acc, r) => acc + r.cgst + r.sgst + r.igst, 0),
    monthsCount: new Set(dataA.map(r => r.month)).size,
    isPartial: new Set(dataA.map(r => r.month)).size < 11
  };

  const statsB = {
    revenue: dataB.reduce((acc, r) => acc + r.taxableValue, 0),
    invoices: dataB.length,
    avgInvoice: dataB.length > 0 ? dataB.reduce((acc, r) => acc + r.taxableValue, 0) / dataB.length : 0,
    gst: dataB.reduce((acc, r) => acc + r.cgst + r.sgst + r.igst, 0),
    monthsCount: new Set(dataB.map(r => r.month)).size,
    isPartial: new Set(dataB.map(r => r.month)).size < 11
  };

  const deltaRev = statsA.revenue - statsB.revenue;
  const pctGrowthRev = statsB.revenue > 0 ? (deltaRev / statsB.revenue) * 100 : null;

  // Month-by-month comparison data for charts
  const comparisonMonthlyChart = FY_MONTHS.map(m => {
    const revA = dataA.filter(r => r.month === m.code).reduce((acc, r) => acc + r.taxableValue, 0);
    const revB = dataB.filter(r => r.month === m.code).reduce((acc, r) => acc + r.taxableValue, 0);
    return {
      month: m.code,
      [fyA]: Math.round(revA),
      [fyB]: Math.round(revB),
    };
  });

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Performance Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive sales velocity, quarterly distribution, best/lowest month benchmarks, and FY comparison analysis.
        </p>
      </div>

      {/* 1. Monthly Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best Month */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Best-performing month</span>
            {bestMonth && (
              <span className="badge-pill-positive">
                Peak
              </span>
            )}
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono flex items-baseline gap-2">
            <span>{bestMonth ? bestMonth.month : 'N/A'}</span>
            <span className="text-xs text-emerald-600 font-bold">
              {bestMonth ? formatCompactINR(bestMonth.revenue) : ''}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {bestMonth ? `${bestMonth.transactions} invoices (${formatINR(bestMonth.avgInvoiceValue)} avg)` : 'No transactions'}
          </div>
        </div>

        {/* Lowest Month */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lowest-performing month</span>
            {lowestMonth && (
              <span className="badge-pill-negative">
                Dip
              </span>
            )}
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono flex items-baseline gap-2">
            <span>{lowestMonth ? lowestMonth.month : 'N/A'}</span>
            <span className="text-xs text-rose-600 font-bold">
              {lowestMonth ? formatCompactINR(lowestMonth.revenue) : ''}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {lowestMonth ? `${lowestMonth.transactions} invoices (${formatINR(lowestMonth.avgInvoiceValue)} avg)` : 'No transactions'}
          </div>
        </div>

        {/* Average Monthly Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average monthly revenue</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Run rate
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCompactINR(avgMonthlyRev)}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {formatINR(avgMonthlyRev)} across active months
          </div>
        </div>

        {/* Quarterly Peak */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Top sales quarter</span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {[...quarterlyData].sort((a, b) => b.revenue - a.revenue)[0]?.pct}% share
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono flex items-baseline gap-2">
            <span>{[...quarterlyData].sort((a, b) => b.revenue - a.revenue)[0]?.code || 'Q3'}</span>
            <span className="text-xs text-brand-600 font-bold">
              {formatCompactINR([...quarterlyData].sort((a, b) => b.revenue - a.revenue)[0]?.revenue || 0)}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            Leading quarterly revenue contributor
          </div>
        </div>
      </div>

      {/* 2. Financial Year Comparison Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Financial Year Side-by-Side Comparison</h3>
              <p className="text-xs text-slate-500">Compare any two financial cycles to evaluate performance variance</p>
            </div>
          </div>

          {/* Selectors for comparison */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="text-xs font-semibold text-blue-700">FY A:</span>
              <select
                value={fyA}
                onChange={(e) => setFyA(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                {availableFYs.map(fy => (
                  <option key={`a-${fy}`} value={fy}>FY {fy}</option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-slate-400">vs</span>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="text-xs font-semibold text-slate-600">FY B:</span>
              <select
                value={fyB}
                onChange={(e) => setFyB(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                {availableFYs.map(fy => (
                  <option key={`b-${fy}`} value={fy}>FY {fy}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Partial Year Warning Banner */}
        {(statsA.isPartial || statsB.isPartial) && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Partial Financial Year Notice: </span>
              {statsA.isPartial && `FY ${fyA} is recorded as a partial year (${statsA.monthsCount}/12 months). `}
              {statsB.isPartial && `FY ${fyB} is recorded as a partial year (${statsB.monthsCount}/12 months). `}
              Comparisons between partial and complete financial years should be interpreted considering seasonal variations.
            </div>
          </div>
        )}

        {/* Side-by-side Metric Table */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Revenue (FY {fyA})</div>
            <div className="text-base font-bold text-blue-900 mt-0.5">{formatCompactINR(statsA.revenue)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{statsA.invoices} invoices</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Revenue (FY {fyB})</div>
            <div className="text-base font-bold text-slate-800 mt-0.5">{formatCompactINR(statsB.revenue)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{statsB.invoices} invoices</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Absolute Variance</div>
            <div className={`text-base font-bold mt-0.5 ${deltaRev >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {deltaRev >= 0 ? '+' : ''}{formatCompactINR(deltaRev)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Taxable value delta</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Growth Rate</div>
            <div className={`text-base font-bold mt-0.5 ${pctGrowthRev && pctGrowthRev > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {pctGrowthRev !== null ? `${pctGrowthRev > 0 ? '+' : ''}${pctGrowthRev.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">YoY Expansion</div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-slate-700 mb-2">Month-by-Month Trajectory (FY {fyA} vs FY {fyB})</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparisonMonthlyChart} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => [formatINR(value), 'Revenue']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey={fyA} name={`FY ${fyA}`} fill="#1e40af" radius={[4, 4, 0, 0]} />
              <Bar dataKey={fyB} name={`FY ${fyB}`} fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Quarterly Performance Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3">Quarterly Performance Breakdown (Indian Fiscal Year)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarterlyData.map(q => (
            <div key={q.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{q.name}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {q.pct}%
                </span>
              </div>
              <div className="text-xl font-extrabold text-blue-900 mt-2 font-mono">
                {formatCompactINR(q.revenue)}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex justify-between">
                <span>Invoices: {q.transactions}</span>
                <span>Avg: {formatCompactINR(q.avgInvoice)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, q.pct * 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Complete Monthly Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Performance & Growth Ledger</h3>
            <p className="text-xs text-slate-500">Chronological April–March performance with Month-over-Month (MoM) growth calculations</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            12 Fiscal Months
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">FY month</th>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3 text-right">Taxable revenue</th>
                <th className="py-2.5 px-3 text-right">Gross total</th>
                <th className="py-2.5 px-3 text-right">Invoices</th>
                <th className="py-2.5 px-3 text-right">Avg ticket size</th>
                <th className="py-2.5 px-3 text-right">Total GST</th>
                <th className="py-2.5 px-3 text-right">MoM growth (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {monthlyData.map(m => (
                <tr key={m.month} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-400">M-{m.fyMonthNo}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{m.month}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">{formatINR(m.revenue)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatINR(m.totalInvoiceValue)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{m.transactions}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatINR(m.avgInvoiceValue)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatINR(m.totalGst)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {m.momGrowth !== null && m.momGrowth !== undefined ? (
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] ${
                        m.momGrowth > 0 ? 'bg-emerald-50 text-emerald-700' : m.momGrowth < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.momGrowth > 0 ? `+${m.momGrowth.toFixed(1)}%` : `${m.momGrowth.toFixed(1)}%`}
                      </span>
                    ) : (
                      <span className="text-slate-400">Baseline</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
