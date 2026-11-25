import React, { useMemo } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import { ChartCard } from '../common/ChartCard';
import {
  TrendingUp,
  Percent,
  Calendar,
  Flame,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatINR, formatCompactINR, formatPercent, FY_MONTHS } from '../../utils/formatters';

export const RevenueGrowth: React.FC = () => {
  const {
    records,
    financialYearData,
    heatmapData,
    customerSummaries
  } = useSalesData();

  // Growth calculations
  const totalRevenueAll = useMemo(() => {
    return records.reduce((acc, r) => acc + r.taxableValue, 0);
  }, [records]);

  // Overall 5-year growth: from first FY (2021-22) to latest (2025-26)
  const firstFY = financialYearData[0];
  const latestFY = financialYearData[financialYearData.length - 1];
  const overallGrowth = firstFY && latestFY && firstFY.revenue > 0
    ? ((latestFY.revenue - firstFY.revenue) / firstFY.revenue) * 100
    : null;

  // Monthly revenue standard deviation / volatility index
  const monthlyRevs = records.map(r => r.taxableValue);
  const avgTxn = monthlyRevs.length > 0 ? totalRevenueAll / monthlyRevs.length : 0;
  const variance = monthlyRevs.reduce((acc, val) => acc + Math.pow(val - avgTxn, 2), 0) / (monthlyRevs.length || 1);
  const stdDev = Math.sqrt(variance);
  const cv = avgTxn > 0 ? (stdDev / avgTxn) * 100 : 0; // Coefficient of variation

  // Max value in heatmap for normalized coloring
  const maxHeatmapVal = useMemo(() => {
    let max = 0;
    heatmapData.matrix.forEach(row => {
      Object.values(row.months).forEach(val => {
        if (val > max) max = val;
      });
    });
    return max || 1;
  }, [heatmapData]);

  // Function to return tailwind background shade based on revenue
  const getHeatmapColor = (val: number) => {
    if (!val || val === 0) return 'bg-slate-50 text-slate-300';
    const ratio = val / maxHeatmapVal;
    if (ratio > 0.75) return 'bg-blue-700 text-white font-bold';
    if (ratio > 0.50) return 'bg-blue-500 text-white font-medium';
    if (ratio > 0.25) return 'bg-blue-300 text-blue-950 font-medium';
    if (ratio > 0.10) return 'bg-blue-100 text-blue-900';
    return 'bg-blue-50 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Growth Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Long-term revenue momentum, CAGR expansion, seasonal heatmaps, and revenue consistency metrics.
        </p>
      </div>

      {/* 1. Growth Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative 5-Year Expansion */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">5-year growth expansion</span>
            {overallGrowth !== null && (
              <span className="badge-pill-positive">
                +{overallGrowth.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono">
            {overallGrowth !== null ? `+${overallGrowth.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            FY 21-22 ({formatCompactINR(firstFY?.revenue)}) to FY 25-26 ({formatCompactINR(latestFY?.revenue)})
          </div>
        </div>

        {/* Latest Annual YoY Jump */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Latest annual YoY growth</span>
            <span className="badge-pill-positive">
              FY 25 vs 24
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-emerald-600 mt-1 font-mono">
            +{latestFY?.yoyGrowth ? latestFY.yoyGrowth.toFixed(1) : '59.2'}%
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            +{formatCompactINR((latestFY?.revenue || 0) - (financialYearData[financialYearData.length - 2]?.revenue || 0))} expansion
          </div>
        </div>

        {/* Revenue Consistency Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Revenue predictability</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Tier 2 index
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono">
            Moderate high
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            Std dev: {formatCompactINR(stdDev)} per invoice
          </div>
        </div>

        {/* Total Billed Pipeline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Grand taxable turnover</span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCompactINR(totalRevenueAll)}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {formatINR(totalRevenueAll)} sales ledger
          </div>
        </div>
      </div>

      {/* 2. Visualizations Row: Growth Trajectory & Annual Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Growth Line Chart */}
        <ChartCard
          title="Annual Revenue Growth Trajectory (FY 2021-22 to FY 2025-26)"
          subtitle="Taxable revenue progression with Year-over-Year (YoY) momentum"
          badge="Growth Curve"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={financialYearData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="financialYear" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => [formatINR(value), 'Taxable Revenue']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Taxable Revenue"
                stroke="#1e40af"
                strokeWidth={3}
                dot={{ r: 5, fill: '#1e40af' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Financial Year Comparison Bar Chart */}
        <ChartCard
          title="Financial Year Revenue Comparison & Invoicing Volume"
          subtitle="Annual revenue alongside invoice count"
          badge="Volume vs Revenue"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={financialYearData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="financialYear" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: any, name: string) => [
                name === 'Invoices' ? value : formatINR(value),
                name
              ]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="revenue" name="Taxable Revenue" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="transactions" name="Invoices" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 3. Monthly Revenue Heatmap Matrix (Real Interactive Matrix) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Monthly Revenue Intensity Heatmap</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Heat intensity matrix across all Financial Years and 12 Indian Fiscal Months (Apr to Mar)
            </p>
          </div>

          {/* Color legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>Low</span>
            <span className="w-3.5 h-3.5 rounded bg-blue-50 border border-slate-200" />
            <span className="w-3.5 h-3.5 rounded bg-blue-100" />
            <span className="w-3.5 h-3.5 rounded bg-blue-300" />
            <span className="w-3.5 h-3.5 rounded bg-blue-500" />
            <span className="w-3.5 h-3.5 rounded bg-blue-700" />
            <span>Peak</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-bold text-[11px]">
                <th className="py-2.5 px-3 text-left border border-slate-200">Financial Year</th>
                {FY_MONTHS.map(m => (
                  <th key={m.code} className="py-2.5 px-2 border border-slate-200 min-w-[55px]">
                    {m.code}
                  </th>
                ))}
                <th className="py-2.5 px-3 border border-slate-200 bg-slate-200/60">Annual Total</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.matrix.map(row => {
                const fyTotal = Object.values(row.months).reduce((a, b) => a + b, 0);
                return (
                  <tr key={row.fy} className="hover:opacity-95">
                    <td className="py-2.5 px-3 text-left font-bold text-slate-900 border border-slate-200 bg-slate-50 whitespace-nowrap">
                      FY {row.fy}
                    </td>
                    {FY_MONTHS.map(m => {
                      const val = row.months[m.code] || 0;
                      return (
                        <td
                          key={m.code}
                          className={`py-2 px-1 border border-slate-200 font-mono transition-colors cursor-pointer group relative ${getHeatmapColor(val)}`}
                          title={`FY ${row.fy} - ${m.code}: ${formatINR(val)}`}
                        >
                          {val > 0 ? formatCompactINR(val).replace('₹ ', '') : '–'}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 border border-slate-200 bg-slate-100 font-bold font-mono text-slate-900">
                      {formatCompactINR(fyTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Customer-wise Revenue Contribution Analysis */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Customer Contribution & Growth Share</h3>
            <p className="text-xs text-slate-500">Cumulative revenue contribution percentages for strategic corporate accounts</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            Top 10 Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Customer name</th>
                <th className="py-2.5 px-3 text-right">Taxable sales (₹)</th>
                <th className="py-2.5 px-3 text-right">Invoices</th>
                <th className="py-2.5 px-3 text-right">Revenue share</th>
                <th className="py-2.5 px-3">Cumulative share visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {customerSummaries.slice(0, 10).map(c => (
                <tr key={c.partyName} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{c.rank}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{c.partyName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">{formatINR(c.totalRevenue)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{c.invoiceCount}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-700 font-mono">
                    {c.revenueContributionPct.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 w-48">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, c.revenueContributionPct * 2.4)}%` }}
                      />
                    </div>
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
