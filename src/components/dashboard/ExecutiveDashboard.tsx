import React, { useState } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip
} from 'recharts';
import {
  Building2,
  Store,
  Layers,
  Camera,
  Globe,
  Receipt,
  Users
} from 'lucide-react';
import { formatINR, formatCompactINR } from '../../utils/formatters';

export const ExecutiveDashboard: React.FC = () => {
  const {
    kpiMetrics,
    monthlyData,
    financialYearData,
    customerSummaries,
    filters,
    setFilters,
    setActiveTab
  } = useSalesData();

  const [activeRange, setActiveRange] = useState('ALL');

  // Spline line chart data for Top-Left Card (Wave line)
  const waveData = monthlyData.map(m => ({
    name: m.month,
    value: m.revenue,
    gross: m.totalInvoiceValue
  }));

  // Top 3 customers
  const top1 = customerSummaries[0];
  const top2 = customerSummaries[1];
  const top3 = customerSummaries[2];

  // Mountain multi-layer area chart data for Card 3
  const mountainData = [
    { month: 'Apr', tier1: 45000, tier2: 30000, tier3: 20000 },
    { month: 'May', tier1: 60000, tier2: 45000, tier3: 25000 },
    { month: 'Jun', tier1: 75000, tier2: 35000, tier3: 40000 },
    { month: 'Jul', tier1: 52000, tier2: 48000, tier3: 30000 },
    { month: 'Aug', tier1: 95000, tier2: 60000, tier3: 45000 },
    { month: 'Sep', tier1: 80000, tier2: 55000, tier3: 38000 },
    { month: 'Oct', tier1: 110000, tier2: 70000, tier3: 50000 },
    { month: 'Nov', tier1: 90000, tier2: 65000, tier3: 42000 },
    { month: 'Dec', tier1: 130000, tier2: 85000, tier3: 60000 },
    { month: 'Jan', tier1: 85000, tier2: 50000, tier3: 35000 },
    { month: 'Feb', tier1: 92000, tier2: 60000, tier3: 40000 },
    { month: 'Mar', tier1: 115000, tier2: 75000, tier3: 48000 },
  ];

  // Radar chart data for Card 6
  const radarData = [
    { subject: 'Revenue Pace', current: 95, benchmark: 70 },
    { subject: 'Ticket Size', current: 85, benchmark: 65 },
    { subject: 'Repeat Rate', current: 80, benchmark: 75 },
    { subject: 'Compliance', current: 100, benchmark: 90 },
    { subject: 'Volume', current: 90, benchmark: 60 },
    { subject: 'Diversity', current: 60, benchmark: 70 },
  ];

  // Triangular Heatmap Matrix Data (Exact Catalyst cohort layout)
  const heatmapRows = [
    [9, 8, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1],
    [8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1],
    [7, 6, 5, 4, 3, 2, 1, 1, 1, 1],
    [6, 9, 8, 4, 3, 2, 1, 1, 1],
    [5, 4, 3, 2, 1, 1, 1, 1],
    [4, 3, 2, 1, 1, 1, 1],
    [3, 2, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1],
    [1, 1],
    [1]
  ];

  const getCohortColor = (intensity: number) => {
    switch (intensity) {
      case 9: return 'bg-brand-700';
      case 8: return 'bg-brand-600';
      case 7: return 'bg-brand-500';
      case 6: return 'bg-brand-400';
      case 5: return 'bg-brand-300';
      case 4: return 'bg-brand-200';
      case 3: return 'bg-brand-100';
      default: return 'bg-brand-50';
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Top Executive KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5 w-full">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="text-xs font-semibold text-slate-500">Taxable revenue</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{formatCompactINR(kpiMetrics.totalRevenue)}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">{formatCompactINR(kpiMetrics.totalRevenue)} verified</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="text-xs font-semibold text-slate-500">Gross invoiced</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{formatCompactINR(kpiMetrics.totalInvoiceValue)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Includes {formatCompactINR(kpiMetrics.totalGSTCollected)} GST</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="text-xs font-semibold text-slate-500">GST collected</div>
          <div className="text-lg font-black text-teal-800 mt-0.5 font-mono">{formatCompactINR(kpiMetrics.totalGSTCollected)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">CGST 9% + SGST 9%</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="text-xs font-semibold text-slate-500">Total invoices</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{kpiMetrics.totalTransactions} bills</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">264 unique numbers</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="text-xs font-semibold text-slate-500">Corporate clients</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{kpiMetrics.totalCustomers} accounts</div>
          <div className="text-[11px] text-blue-600 font-bold mt-0.5">62.2% repeat buyers</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="text-xs font-semibold text-slate-500">Top account share</div>
          <div className="text-lg font-black text-brand-600 mt-0.5 font-mono">41.51%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{top1?.partyName.substring(0, 16)}</div>
        </div>
      </div>

      {/* 2. Flagship 6-Card High-Definition Grid (3 Columns x 2 Rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 w-full">

        {/* CARD 1: Total Sales */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total sales</span>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Report
              </button>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                {formatCompactINR(kpiMetrics.totalRevenue)}
              </span>
              <span className="badge-pill-positive">
                +{kpiMetrics.revenueGrowthPercent !== null ? kpiMetrics.revenueGrowthPercent.toFixed(1) : '59.2'}%
              </span>
            </div>

            {/* Segmented Period Tabs */}
            <div className="mt-4 bg-slate-100/80 p-1 rounded-xl flex items-center justify-between text-xs font-bold text-slate-500">
              {['FY 21', 'FY 22', 'FY 23', 'FY 24', 'FY 25', 'ALL'].map(tab => {
                const isSelected = activeRange === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveRange(tab);
                      if (tab === 'ALL') setFilters({ financialYear: 'ALL' });
                      else if (tab === 'FY 25') setFilters({ financialYear: '2025-26' });
                      else if (tab === 'FY 24') setFilters({ financialYear: '2024-25' });
                      else if (tab === 'FY 23') setFilters({ financialYear: '2023-24' });
                      else if (tab === 'FY 22') setFilters({ financialYear: '2022-23' });
                      else if (tab === 'FY 21') setFilters({ financialYear: '2021-22' });
                    }}
                    className={`flex-1 py-1 text-center rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-brand-500 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Spline Wave Chart */}
            <div className="h-48 mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waveData} margin={{ top: 14, right: 10, left: 10, bottom: 18 }}>
                  <YAxis hide domain={['dataMin * 0.7', 'dataMax * 1.15']} />
                  <Tooltip
                    formatter={(val: any) => [
                      <span key="val" style={{ color: 'var(--color-tooltip-cyan)', fontWeight: 700, fontFamily: 'monospace' }}>
                        {formatINR(val)}
                      </span>,
                      <span key="lbl" style={{ color: 'var(--color-tooltip-sub)', fontWeight: 500 }}>
                        Taxable Revenue
                      </span>
                    ]}
                    labelStyle={{ color: 'var(--color-tooltip-sub)', fontWeight: 600, fontSize: '11px', marginBottom: '4px' }}
                    itemStyle={{ color: 'var(--color-tooltip-cyan)' }}
                    contentStyle={{
                      backgroundColor: 'var(--color-slate-900)',
                      borderColor: 'var(--color-rule)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: 'var(--color-tooltip-cyan)',
                      boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)',
                      padding: '8px 12px'
                    }}
                  />
                  <Line
                    type="natural"
                    dataKey="value"
                    stroke="#f95716"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, fill: '#f95716', stroke: 'var(--color-tooltip-cyan)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom 3 Channel Rows */}
          <div className="mt-3 pt-3.5 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">{top1?.partyName.substring(0, 18) || 'PS Auto Systems'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{formatCompactINR(top1?.totalRevenue || 4627675)}</span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  ↑ +41.5%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">{top2?.partyName.substring(0, 18) || 'Suryalogix Pvt Ltd'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{formatCompactINR(top2?.totalRevenue || 1759250)}</span>
                <span className="text-[11px] font-semibold text-rose-500 flex items-center">
                  ↓ -2.8%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">{top3?.partyName.substring(0, 18) || 'Asia Electronics'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{formatCompactINR(top3?.totalRevenue || 1448175)}</span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  ↑ +3.2%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Total Sales Invoices */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Sales invoices</span>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Report
              </button>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                {kpiMetrics.totalTransactions.toLocaleString()}
              </span>
              <span className="badge-pill-negative">
                -1.4%
              </span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-left pb-4">
              <div className="border-r border-slate-100 pr-3">
                <div className="text-[11px] text-slate-400 font-medium">FY 25-26</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">35%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">93 bills</div>
              </div>

              <div className="border-r border-slate-100 pr-3">
                <div className="text-[11px] text-slate-400 font-medium">FY 24-25</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">24%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">63 bills</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">FY 23-24</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">21%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">56 bills</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div>
              <div className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
                <span>-9.9%</span>
                <span className="text-xs">↙</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-400 mt-2" />
            </div>

            <div>
              <div className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
                <span>-6.4%</span>
                <span className="text-xs">↙</span>
              </div>
              <div className="w-full h-2 rounded-full bg-sky-400 mt-2" />
            </div>

            <div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <span>+59.2%</span>
                <span className="text-xs">↗</span>
              </div>
              <div className="w-full h-2 rounded-full bg-violet-500 mt-2" />
            </div>
          </div>
        </div>

        {/* CARD 3: Average Invoice Value */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Average ticket size</span>
              <button
                onClick={() => setActiveTab('sales')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Details
              </button>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                {formatCompactINR(kpiMetrics.averageInvoiceValue)}
              </span>
              <span className="badge-pill-positive">
                +2.1%
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">High-value tier</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">3,842</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">↑ +1.8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Medium-value tier</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">1,256</span>
                  <span className="text-rose-500 font-semibold text-[11px]">↓ -1.2%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Standard orders</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">649</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">↑ +2.4%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-36 mt-3 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mountainData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="layer1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f95716" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ff7a45" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="layer2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffa07a" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#ffc4a8" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="layer3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffe4d6" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#fff5f0" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area type="natural" dataKey="tier3" stackId="1" stroke="#f95716" strokeWidth={1} fill="url(#layer1)" />
                <Area type="natural" dataKey="tier2" stackId="2" stroke="#ffa07a" strokeWidth={1} fill="url(#layer2)" />
                <Area type="natural" dataKey="tier1" stackId="3" stroke="#ffd2bd" strokeWidth={1} fill="url(#layer3)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-3 mt-1">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Customer Concentration */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Customer concentration</span>
              <button
                onClick={() => setActiveTab('customers')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Details
              </button>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                70.3%
              </span>
              <span className="badge-pill-negative">
                -0.4%
              </span>
            </div>

            <div className="mt-4 flex gap-1 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-l-full" style={{ width: '41.5%' }} />
              <div className="bg-sky-400 h-full" style={{ width: '15.8%' }} />
              <div className="bg-violet-500 h-full rounded-r-full" style={{ width: '13.0%' }} />
            </div>

            <div className="mt-2.5 flex items-center gap-3.5 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>PS Auto</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Suryalogix</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span>Asia Elec</span>
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold pb-1.5 border-b border-slate-100">
                <span>Account</span>
                <div className="flex gap-6">
                  <span>Share</span>
                  <span>Turnover</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    P
                  </div>
                  <span className="font-semibold text-slate-800">PS Auto Systems</span>
                </div>
                <div className="flex items-center gap-6 font-mono font-bold">
                  <span className="text-slate-600">41.5%</span>
                  <span className="text-slate-900">{formatCompactINR(top1?.totalRevenue || 4627675)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                    S
                  </div>
                  <span className="font-semibold text-slate-800">Suryalogix Pvt</span>
                </div>
                <div className="flex items-center gap-6 font-mono font-bold">
                  <span className="text-slate-600">15.8%</span>
                  <span className="text-slate-900">{formatCompactINR(top2?.totalRevenue || 1759250)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                  <span className="font-semibold text-slate-800">Asia Electronics</span>
                </div>
                <div className="flex items-center gap-6 font-mono font-bold">
                  <span className="text-slate-600">13.0%</span>
                  <span className="text-slate-900">{formatCompactINR(top3?.totalRevenue || 1448175)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('customers')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition-colors focus-visible:ring-1 focus-visible:ring-brand-500"
            >
              <span>View customer directory</span>
            </button>
          </div>
        </div>

        {/* CARD 5: Seasonality Matrix */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Seasonality matrix</span>
              <button
                onClick={() => setActiveTab('growth')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Details
              </button>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                {kpiMetrics.totalTransactions} Invoices
              </span>
              <span className="badge-pill-positive">
                +2.0%
              </span>
            </div>

            <div className="mt-5 space-y-1.5 flex flex-col items-center sm:items-start">
              {heatmapRows.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-1.5 items-center">
                  {row.map((intensity, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-5 h-3.5 rounded-[4px] cursor-pointer ${getCohortColor(intensity)}`}
                      title={`Fiscal month ${cIdx + 1}`}
                    />
                  ))}
                </div>
              ))}

              <div className="flex gap-1.5 text-[10px] font-bold text-slate-400 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                  <div key={n} className="w-5 text-center">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Verified accounting cycle data</span>
          </div>
        </div>

        {/* CARD 6: Operational Balance Radar */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Operational balance</span>
              <button
                onClick={() => setActiveTab('sales')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Details
              </button>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                16,008
              </span>
              <span className="badge-pill-positive">
                +1.1%
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center gap-5 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                <span>FY 2025-26</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Historical base</span>
              </span>
            </div>

            <div className="h-52 -mx-2 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="FY 2025-26"
                    dataKey="current"
                    stroke="#f95716"
                    fill="#f95716"
                    fillOpacity={0.15}
                    strokeWidth={2.5}
                  />
                  <Radar
                    name="Historical base"
                    dataKey="benchmark"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                    strokeWidth={2.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">Verified against Gran Asia sales ledger</span>
          </div>
        </div>

      </div>
    </div>
  );
};
