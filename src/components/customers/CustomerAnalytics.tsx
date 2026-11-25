import React, { useState, useMemo } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import { ChartCard } from '../common/ChartCard';
import {
  Users,
  Award,
  Repeat,
  DollarSign,
  Search,
  Filter,
  Sliders,
  ArrowUpDown,
  ExternalLink,
  X,
  FileText,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { formatINR, formatCompactINR, maskGST, formatDate } from '../../utils/formatters';
import { CustomerSummary, SaleRecord } from '../../types/sales';

export const CustomerAnalytics: React.FC = () => {
  const {
    customerSummaries,
    segmentationConfig,
    setSegmentationConfig,
    records,
    kpiMetrics,
    setFilters,
    setActiveTab
  } = useSalesData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | 'High Value' | 'Medium Value' | 'Low Value'>('ALL');
  const [sortField, setSortField] = useState<'rank' | 'totalRevenue' | 'invoiceCount' | 'avgInvoiceValue'>('totalRevenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Repeat customer analysis
  const repeatCount = useMemo(() => {
    return customerSummaries.filter(c => c.invoiceCount > 1).length;
  }, [customerSummaries]);
  const repeatRate = customerSummaries.length > 0 ? (repeatCount / customerSummaries.length) * 100 : 0;

  // Segment totals
  const highValueCustomers = customerSummaries.filter(c => c.segment === 'High Value');
  const mediumValueCustomers = customerSummaries.filter(c => c.segment === 'Medium Value');
  const lowValueCustomers = customerSummaries.filter(c => c.segment === 'Low Value');

  const highRev = highValueCustomers.reduce((a, b) => a + b.totalRevenue, 0);
  const medRev = mediumValueCustomers.reduce((a, b) => a + b.totalRevenue, 0);
  const lowRev = lowValueCustomers.reduce((a, b) => a + b.totalRevenue, 0);

  // Filtered & Sorted Customer List
  const filteredCustomers = useMemo(() => {
    let result = customerSummaries.filter(c => {
      const matchSearch = c.partyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSegment = segmentFilter === 'ALL' || c.segment === segmentFilter;
      return matchSearch && matchSegment;
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });

    return result;
  }, [customerSummaries, searchTerm, segmentFilter, sortField, sortAsc]);

  // Selected customer invoices for drawer/modal
  const selectedCustomerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return records.filter(r => r.partyName === selectedCustomer.partyName);
  }, [selectedCustomer, records]);

  const handleSort = (field: 'rank' | 'totalRevenue' | 'invoiceCount' | 'avgInvoiceValue') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Performance Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Account ranking, customer segmentation matrix, repeat purchase behaviors, and concentration risk profiling.
        </p>
      </div>

      {/* 1. Key Customer Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total accounts</span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Buyers
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 mt-1 font-mono">{customerSummaries.length} Clients</div>
          <div className="text-xs text-slate-500 mt-1 truncate">Active purchasing enterprises</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Repeat customer rate</span>
            <span className="badge-pill-positive">
              Retention
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-emerald-600 mt-1 font-mono flex items-baseline gap-2">
            <span>{repeatRate.toFixed(1)}%</span>
            <span className="text-xs text-slate-500 font-normal">({repeatCount}/{customerSummaries.length})</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">Accounts with 2+ purchases</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">High-value segment</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Key tier
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-purple-700 mt-1 font-mono">
            {highValueCustomers.length} Accounts
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            Contributes {((highRev / (kpiMetrics.totalRevenue || 1)) * 100).toFixed(1)}% of revenue
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-2xs hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Single-client reliance</span>
            <span className="badge-pill-negative">
              Risk
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-black text-amber-600 mt-1 font-mono">
            {customerSummaries[0]?.revenueContributionPct.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {customerSummaries[0]?.partyName.substring(0, 22)}
          </div>
        </div>
      </div>

      {/* 2. Customer Segmentation Matrix & Threshold Configurator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Configurable Customer Segmentation</h3>
            <p className="text-xs text-slate-500">Categorize client base based on individual enterprise revenue contribution</p>
          </div>

          {/* Interactive Threshold Setting Controls */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Thresholds (%):
            </span>
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">High &ge;</label>
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
                className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-800"
              />
              <span className="text-slate-500">%</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
              <label className="text-slate-500">Medium &ge;</label>
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
                className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-800"
              />
              <span className="text-slate-500">%</span>
            </div>
          </div>
        </div>

        {/* 3 Segment Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* High Value */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">High-value tier</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                &ge; {segmentationConfig.highValueThresholdPct}% Share
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {formatCompactINR(highRev)}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex justify-between">
              <span>{highValueCustomers.length} Corporate Accounts</span>
              <span className="font-bold text-emerald-700">
                {((highRev / (kpiMetrics.totalRevenue || 1)) * 100).toFixed(1)}% of Revenue
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 truncate">
              {highValueCustomers.map(c => c.partyName.split(' ')[0]).join(', ')}
            </div>
          </div>

          {/* Medium Value */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Medium-value tier</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {segmentationConfig.mediumValueThresholdPct}% to {segmentationConfig.highValueThresholdPct}%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {formatCompactINR(medRev)}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex justify-between">
              <span>{mediumValueCustomers.length} Corporate Accounts</span>
              <span className="font-bold text-blue-700">
                {((medRev / (kpiMetrics.totalRevenue || 1)) * 100).toFixed(1)}% of Revenue
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 truncate">
              {mediumValueCustomers.map(c => c.partyName.split(' ')[0]).join(', ')}
            </div>
          </div>

          {/* Low Value */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Low-value tier</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                &lt; {segmentationConfig.mediumValueThresholdPct}% Share
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {formatCompactINR(lowRev)}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex justify-between">
              <span>{lowValueCustomers.length} Corporate Accounts</span>
              <span className="font-bold text-slate-600">
                {((lowRev / (kpiMetrics.totalRevenue || 1)) * 100).toFixed(1)}% of Revenue
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Long-tail spot customers
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top 10 Customers Visual Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">Top 10 Enterprise Customers Performance Dashboard</h3>
        <p className="text-xs text-slate-500 mb-4">Ranked comparison of sales volume and ticket size for prime accounts</p>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={customerSummaries.slice(0, 10)}
            margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="partyName"
              tick={{ fontSize: 9 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              tickFormatter={(v) => v.length > 15 ? `${v.substring(0, 14)}...` : v}
            />
            <YAxis tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(val: any) => [formatINR(val), 'Taxable Revenue']} />
            <Bar dataKey="totalRevenue" fill="#1e40af" radius={[4, 4, 0, 0]}>
              {customerSummaries.slice(0, 10).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.segment === 'High Value' ? '#1e40af' : entry.segment === 'Medium Value' ? '#0284c7' : '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Complete Customer Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Complete Customer Ledger</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredCustomers.length} accounts
            </span>
          </div>

          {/* Search & Segment Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44"
              />
            </div>

            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Segments</option>
              <option value="High Value">High Value Tier</option>
              <option value="Medium Value">Medium Value Tier</option>
              <option value="Low Value">Low Value Tier</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-600 font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('rank')}>
                  <div className="flex items-center gap-1">Rank <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('totalRevenue')}>
                  <div className="flex items-center justify-end gap-1">Taxable Sales (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 text-right">Contribution (%)</th>
                <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('invoiceCount')}>
                  <div className="flex items-center justify-end gap-1">Invoices <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('avgInvoiceValue')}>
                  <div className="flex items-center justify-end gap-1">Avg Ticket (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3">Active FYs</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCustomers.map(c => (
                <tr
                  key={c.partyName}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomer(c)}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{c.rank}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{c.partyName}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.segment === 'High Value'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : c.segment === 'Medium Value'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.segment}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">{formatINR(c.totalRevenue)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">{c.revenueContributionPct.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{c.invoiceCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatINR(c.avgInvoiceValue)}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500">
                    {c.activeFinancialYears.join(', ')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(c);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="View Customer Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-lg border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Customer profile</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200">
                    Rank #{selectedCustomer.rank}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">{selectedCustomer.partyName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  GSTIN: <span className="font-mono">{maskGST(selectedCustomer.gstNumber, false)}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-1 focus-visible:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Quick KPIs */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total revenue</div>
                <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{formatINR(selectedCustomer.totalRevenue)}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Revenue share</div>
                <div className="text-sm font-bold text-brand-600 font-mono mt-0.5">{selectedCustomer.revenueContributionPct.toFixed(2)}%</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total invoices</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedCustomer.invoiceCount} orders</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Avg ticket size</div>
                <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{formatINR(selectedCustomer.avgInvoiceValue)}</div>
              </div>
            </div>

            {/* Invoice History List */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800">
                  Transaction History ({selectedCustomerInvoices.length} Invoices)
                </h4>
                <button
                  onClick={() => {
                    setFilters({ customerName: selectedCustomer.partyName });
                    setSelectedCustomer(null);
                    setActiveTab('transactions');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
                >
                  <span>View in Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold text-xs">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Invoice No</th>
                      <th className="py-2 px-3">FY / Month</th>
                      <th className="py-2 px-3 text-right">Taxable (₹)</th>
                      <th className="py-2 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCustomerInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-600">{formatDate(inv.date)}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-2 px-3 text-slate-500">FY {inv.financialYear} ({inv.month})</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">{formatINR(inv.taxableValue)}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">{formatINR(inv.totalInvoiceValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
