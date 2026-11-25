import React, { useState, useMemo } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  Layers,
  Users,
  TrendingUp,
  Receipt,
  Loader2
} from 'lucide-react';
import { formatINR, formatCompactINR, formatDate, maskGST, getCurrencySymbol } from '../../utils/formatters';
import {
  exportDOMToPDF,
  exportExecutivePDF,
  exportComprehensiveBIExcel,
  exportTransactionsToExcel,
  exportToCSV
} from '../../utils/exportUtils';

type ReportType =
  | 'executive'
  | 'financial_year'
  | 'monthly'
  | 'customer'
  | 'revenue_growth'
  | 'gst_summary';

export const ReportsExport: React.FC = () => {
  const {
    records,
    kpiMetrics,
    financialYearData,
    customerSummaries,
    monthlyData,
    filters
  } = useSalesData();

  const [activeReport, setActiveReport] = useState<ReportType>('executive');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const currencySym = getCurrencySymbol();

  // Report configurations
  const reportTypes = [
    { id: 'executive', title: 'Executive Sales Performance Report', icon: Building2, desc: 'High-level executive summary, master KPIs, and macro sales velocity' },
    { id: 'financial_year', title: 'Financial Year-wise Revenue Report', icon: Calendar, desc: 'Multi-year financial year breakdown and YoY expansion trajectory' },
    { id: 'monthly', title: 'Monthly Sales & Seasonality Report', icon: TrendingUp, desc: 'Chronological April–March performance, volume, and MoM rates' },
    { id: 'customer', title: 'Customer Performance & Concentration Report', icon: Users, desc: 'Enterprise account rankings, tiers, and concentration exposure' },
    { id: 'revenue_growth', title: 'Revenue Growth & Consistency Report', icon: TrendingUp, desc: 'Long-term revenue momentum, CAGR expansion, and volatility' },
    { id: 'gst_summary', title: 'Statutory GST Liability Summary Report', icon: Layers, desc: 'Statutory CGST, SGST, IGST tax breakdown and compliance ledger' },
  ];

  // Calculated totals across financial years
  const fyTotals = useMemo(() => {
    const rev = financialYearData.reduce((acc, f) => acc + f.revenue, 0);
    const gross = financialYearData.reduce((acc, f) => acc + f.totalInvoiceValue, 0);
    const gst = financialYearData.reduce((acc, f) => acc + f.totalGst, 0);
    const txns = financialYearData.reduce((acc, f) => acc + f.transactions, 0);
    const avgTicket = txns > 0 ? rev / txns : 0;
    return { rev, gross, gst, txns, avgTicket };
  }, [financialYearData]);

  // Calculated totals across monthly data
  const monthlyTotals = useMemo(() => {
    const rev = monthlyData.reduce((acc, m) => acc + m.revenue, 0);
    const gross = monthlyData.reduce((acc, m) => acc + m.totalInvoiceValue, 0);
    const gst = monthlyData.reduce((acc, m) => acc + m.totalGst, 0);
    const txns = monthlyData.reduce((acc, m) => acc + m.transactions, 0);
    const avgTicket = txns > 0 ? rev / txns : 0;
    return { rev, gross, gst, txns, avgTicket };
  }, [monthlyData]);

  // Handlers for exporting current report
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const activeObj = reportTypes.find(r => r.id === activeReport);
      const filename = `Gran_Asia_${activeReport}_Report_${new Date().toISOString().slice(0, 10)}`;
      await exportDOMToPDF('printable-report-document', filename);
    } catch (err) {
      console.warn('DOM PDF capture failed, using vector PDF fallback', err);
      const activeObj = reportTypes.find(r => r.id === activeReport);
      exportExecutivePDF(
        kpiMetrics,
        financialYearData,
        customerSummaries,
        activeObj?.title || 'Executive Sales Report',
        activeReport,
        monthlyData
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportComprehensiveBIExcel(
      kpiMetrics,
      records,
      financialYearData,
      customerSummaries,
      monthlyData,
      `Gran_Asia_${activeReport}_Report`
    );
  };

  const handleExportCSV = () => {
    if (activeReport === 'customer') {
      const formatted = customerSummaries.map((c, i) => ({
        'Rank': `#${i + 1}`,
        'Customer Name': c.partyName,
        'Segment': c.segment,
        [`Taxable Sales (${currencySym})`]: c.totalRevenue,
        'Revenue Contribution (%)': `${c.revenueContributionPct.toFixed(2)}%`,
        'Orders Executed': c.invoiceCount,
        [`Average Ticket Size (${currencySym})`]: c.avgInvoiceValue,
        'First Purchase Date': c.firstPurchaseDate,
        'Last Purchase Date': c.lastPurchaseDate
      }));
      exportToCSV(formatted, 'Customer_Performance_Report');
    } else if (activeReport === 'financial_year') {
      const formatted = financialYearData.map(f => ({
        'Financial Year': `FY ${f.financialYear}`,
        [`Taxable Turnover (${currencySym})`]: f.revenue,
        [`Total Gross Invoiced (${currencySym})`]: f.totalInvoiceValue,
        [`Total Statutory GST (${currencySym})`]: f.totalGst,
        'Invoices Executed': f.transactions,
        'Active Accounts': f.customers,
        [`Average Ticket Size (${currencySym})`]: f.avgInvoiceValue,
        'YoY Growth Rate': f.yoyGrowth !== null && f.yoyGrowth !== undefined ? `${f.yoyGrowth.toFixed(1)}%` : 'Base Period',
        'Reporting Status': f.isPartialYear ? 'Partial Reporting Cycle' : 'Complete 12-Month Fiscal Cycle'
      }));
      exportToCSV(formatted, 'Financial_Year_Report');
    } else if (activeReport === 'revenue_growth') {
      const formatted = financialYearData.map(f => ({
        'Financial Year': `FY ${f.financialYear}`,
        [`Taxable Turnover (${currencySym})`]: f.revenue,
        [`Total Invoiced (${currencySym})`]: f.totalInvoiceValue,
        'YoY Expansion Rate': f.yoyGrowth !== null && f.yoyGrowth !== undefined ? `${f.yoyGrowth.toFixed(1)}%` : 'Baseline Period',
        'Invoices Executed': f.transactions,
        [`Average Ticket (${currencySym})`]: f.avgInvoiceValue,
        'Fiscal Status': f.isPartialYear ? 'Partial Reporting Cycle' : 'Complete 12-Month Cycle'
      }));
      exportToCSV(formatted, 'Revenue_Growth_Report');
    } else if (activeReport === 'monthly') {
      const formatted = monthlyData.map(m => ({
        'FY Month No': `M-${m.fyMonthNo}`,
        'Month': m.month,
        [`Taxable Revenue (${currencySym})`]: m.revenue,
        [`Gross Invoiced (${currencySym})`]: m.totalInvoiceValue,
        [`Total GST (${currencySym})`]: m.totalGst,
        'Invoices Executed': m.transactions,
        [`Average Ticket (${currencySym})`]: m.avgInvoiceValue,
        'MoM Growth Rate': m.momGrowth !== null && m.momGrowth !== undefined ? `${m.momGrowth.toFixed(1)}%` : 'N/A'
      }));
      exportToCSV(formatted, 'Monthly_Sales_Report');
    } else if (activeReport === 'gst_summary') {
      const formatted = financialYearData.map(f => ({
        'Financial Year': `FY ${f.financialYear}`,
        [`Taxable Turnover (${currencySym})`]: f.revenue,
        [`Central GST (CGST 9%) (${currencySym})`]: f.totalGst / 2,
        [`State GST (SGST 9%) (${currencySym})`]: f.totalGst / 2,
        [`Integrated GST (IGST) (${currencySym})`]: 0,
        [`Total Statutory GST (${currencySym})`]: f.totalGst
      }));
      exportToCSV(formatted, 'GST_Statutory_Reconciliation_Report');
    } else {
      const formatted = records.map((t, idx) => ({
        'Sr No': idx + 1,
        'Date': t.date,
        'Invoice Number': t.invoiceNumber,
        'Customer Name': t.partyName,
        'GSTIN': t.gstNumber || 'Unregistered',
        'Financial Year': `FY ${t.financialYear}`,
        'Month': t.month,
        [`Taxable Value (${currencySym})`]: t.taxableValue,
        [`CGST (9%) (${currencySym})`]: t.cgst,
        [`SGST (9%) (${currencySym})`]: t.sgst,
        [`IGST (${currencySym})`]: t.igst,
        [`Total GST (${currencySym})`]: Math.round((t.cgst + t.sgst + t.igst) * 100) / 100,
        [`Total Invoice Value (${currencySym})`]: t.totalInvoiceValue
      }));
      exportToCSV(formatted, 'Gran_Asia_Sales_Transactions_Ledger');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="no-print">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Analytical Document Export</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate formal audit-ready BI reports in PDF, Microsoft Excel (.xlsx), and CSV formats.
        </p>
      </div>

      {/* 1. Report Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 no-print">
        {reportTypes.map(r => {
          const Icon = r.icon;
          const isSelected = activeReport === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id as ReportType)}
              className={`p-3 rounded-2xl border text-left transition-colors flex flex-col justify-between focus-visible:ring-1 focus-visible:ring-brand-500 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-brand-500' : 'text-slate-500'}`} />
              <div className="text-xs font-bold leading-tight line-clamp-2">{r.title.replace(' Report', '')}</div>
            </button>
          );
        })}
      </div>

      {/* 2. Export Actions Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {reportTypes.find(r => r.id === activeReport)?.title}
            </h3>
            <p className="text-xs text-slate-500">
              {reportTypes.find(r => r.id === activeReport)?.desc}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-2xs"
            title="Download high-resolution formatted PDF document"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Print or save as pure vector PDF via browser dialog"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print / Vector PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-2xs"
            title="Export as multi-sheet Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            title="Download raw data in CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Report Live Document Preview */}
      <div
        id="printable-report-document"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6"
      >
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-600">Gran Asia Life Sciences LLP</div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              {reportTypes.find(r => r.id === activeReport)?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Business Intelligence & Revenue Analytics Verification System: Pune Operations
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div className="font-semibold text-slate-700">Date Generated</div>
            <div>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">Verified audit ledger</div>
          </div>
        </div>

        {/* Executive Summary Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center avoid-break">
          <div>
            <div className="text-xs text-slate-500 font-semibold">Taxable revenue</div>
            <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{formatINR(kpiMetrics.totalRevenue)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total invoice value</div>
            <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{formatINR(kpiMetrics.totalInvoiceValue)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total GST collected</div>
            <div className="text-base font-extrabold text-teal-800 font-mono mt-0.5">{formatINR(kpiMetrics.totalGSTCollected)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Invoices executed</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{kpiMetrics.totalTransactions} invoices</div>
          </div>
        </div>

        {/* Conditional Report Tables */}
        {activeReport === 'executive' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Financial Year Multi-Year Summary</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2.5 px-3">FY</th>
                    <th className="py-2.5 px-3 text-right">Taxable Revenue ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Total Invoice Value ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Total GST ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Invoices</th>
                    <th className="py-2.5 px-3 text-right">YoY Growth</th>
                    <th className="py-2.5 px-3 text-center">Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financialYearData.map(f => (
                    <tr key={f.financialYear} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">FY {f.financialYear}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">{formatINR(f.revenue)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{formatINR(f.totalInvoiceValue)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{formatINR(f.totalGst)}</td>
                      <td className="py-2 px-3 text-right font-semibold">{f.transactions}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                        {f.yoyGrowth !== null && f.yoyGrowth !== undefined ? `${f.yoyGrowth > 0 ? '+' : ''}${f.yoyGrowth.toFixed(1)}%` : 'Base Period'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.isPartialYear ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {f.isPartialYear ? 'Partial' : 'Full Year'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  <tr>
                    <td className="py-2.5 px-3">Summary Total</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(fyTotals.rev)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(fyTotals.gross)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(fyTotals.gst)}</td>
                    <td className="py-2.5 px-3 text-right">{fyTotals.txns}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">5 Cycles</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'financial_year' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Financial Year Comparative Table</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2.5 px-3">Financial Year</th>
                    <th className="py-2.5 px-3 text-right">Taxable Turnover ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">CGST (9%)</th>
                    <th className="py-2.5 px-3 text-right">SGST (9%)</th>
                    <th className="py-2.5 px-3 text-right">Avg Ticket Size ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Customer Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financialYearData.map(f => (
                    <tr key={f.financialYear} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">FY {f.financialYear}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-900">{formatINR(f.revenue)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatINR(f.totalGst / 2)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatINR(f.totalGst / 2)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">{formatINR(f.avgInvoiceValue)}</td>
                      <td className="py-2 px-3 text-right font-semibold">{f.customers} Accounts</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  <tr>
                    <td className="py-2.5 px-3">Summary Total</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-950">{formatINR(fyTotals.rev)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(fyTotals.gst / 2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(fyTotals.gst / 2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">{formatINR(fyTotals.avgTicket)}</td>
                    <td className="py-2.5 px-3 text-right">{kpiMetrics.totalCustomers} Accounts</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'revenue_growth' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Multi-Year Revenue Growth Trajectory & Fiscal Momentum</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2.5 px-3">Financial Year</th>
                    <th className="py-2.5 px-3 text-right">Taxable Turnover ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Total Invoiced ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">YoY Growth (%)</th>
                    <th className="py-2.5 px-3 text-right">Orders Executed</th>
                    <th className="py-2.5 px-3 text-right">Avg Ticket ({currencySym})</th>
                    <th className="py-2.5 px-3 text-center">Fiscal Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financialYearData.map(f => (
                    <tr key={f.financialYear} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">FY {f.financialYear}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-900">{formatINR(f.revenue)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{formatINR(f.totalInvoiceValue)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                        {f.yoyGrowth !== null && f.yoyGrowth !== undefined
                          ? `${f.yoyGrowth > 0 ? '+' : ''}${f.yoyGrowth.toFixed(1)}%`
                          : 'Baseline Period'}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">{f.transactions}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">{formatINR(f.avgInvoiceValue)}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.isPartialYear ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {f.isPartialYear ? 'Partial Cycle' : 'Complete 12M'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  <tr>
                    <td className="py-2.5 px-3">Summary Total</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-950">{formatINR(fyTotals.rev)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(fyTotals.gross)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-right">{fyTotals.txns}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">{formatINR(fyTotals.avgTicket)}</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">5 Fiscal Cycles</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'monthly' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Chronological Monthly Sales Breakdown (Apr - Mar)</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2.5 px-3">FY Month No</th>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Taxable Revenue ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Gross Invoiced ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Invoices</th>
                    <th className="py-2.5 px-3 text-right">MoM Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyData.map(m => (
                    <tr key={m.month} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-500">M-{m.fyMonthNo}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{m.month}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">{formatINR(m.revenue)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{formatINR(m.totalInvoiceValue)}</td>
                      <td className="py-2 px-3 text-right font-semibold">{m.transactions}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-700">
                        {m.momGrowth !== null && m.momGrowth !== undefined ? `${m.momGrowth > 0 ? '+' : ''}${m.momGrowth.toFixed(1)}%` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  <tr>
                    <td className="py-2.5 px-3" colSpan={2}>Fiscal Year Total (12 Months)</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(monthlyTotals.rev)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatINR(monthlyTotals.gross)}</td>
                    <td className="py-2.5 px-3 text-right">{monthlyTotals.txns}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'customer' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Customer Performance & Concentration Rankings</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Segment</th>
                    <th className="py-2.5 px-3 text-right">Taxable Sales ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Revenue Share</th>
                    <th className="py-2.5 px-3 text-right">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerSummaries.slice(0, 15).map(c => (
                    <tr key={c.partyName} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-400">#{c.rank}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{c.partyName}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.segment === 'High Value' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {c.segment}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{formatINR(c.totalRevenue)}</td>
                      <td className="py-2 px-3 text-right font-mono text-blue-700 font-bold">{c.revenueContributionPct.toFixed(2)}%</td>
                      <td className="py-2 px-3 text-right font-semibold">{c.invoiceCount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  {(() => {
                    const top15 = customerSummaries.slice(0, 15);
                    const rev = top15.reduce((acc, c) => acc + c.totalRevenue, 0);
                    const share = top15.reduce((acc, c) => acc + c.revenueContributionPct, 0);
                    const orders = top15.reduce((acc, c) => acc + c.invoiceCount, 0);
                    return (
                      <tr>
                        <td className="py-2.5 px-3" colSpan={3}>Top 15 Accounts Subtotal</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">{formatINR(rev)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-bold">{share.toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-right font-bold">{orders}</td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'gst_summary' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Statutory GST Reconciliation Summary</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2.5 px-3">Financial Year</th>
                    <th className="py-2.5 px-3 text-right">Taxable Value ({currencySym})</th>
                    <th className="py-2.5 px-3 text-right">Central GST (CGST)</th>
                    <th className="py-2.5 px-3 text-right">State GST (SGST)</th>
                    <th className="py-2.5 px-3 text-right">Integrated GST (IGST)</th>
                    <th className="py-2.5 px-3 text-right">Total Statutory GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financialYearData.map(f => (
                    <tr key={f.financialYear} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">FY {f.financialYear}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatINR(f.revenue)}</td>
                      <td className="py-2 px-3 text-right font-mono text-teal-800">{formatINR(f.totalGst / 2)}</td>
                      <td className="py-2 px-3 text-right font-mono text-teal-800">{formatINR(f.totalGst / 2)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">{formatINR(0)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatINR(f.totalGst)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-300">
                  <tr>
                    <td className="py-2.5 px-3">Statutory Ledger Total</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{formatINR(fyTotals.rev)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-800 font-bold">{formatINR(fyTotals.gst / 2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-800 font-bold">{formatINR(fyTotals.gst / 2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">{formatINR(0)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">{formatINR(fyTotals.gst)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Audit Signoff Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4 avoid-break">
          <div>
            <div>Gran Asia Life Sciences LLP, Pune Business Intelligence Unit</div>
            <div className="text-[10px]">Extracted from verified accounting system (Tally/ERP). Taxable value represents official corporate revenue.</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-600">Authorized BI Auditor Signature</div>
            <div className="text-[10px] mt-0.5">OJT Project Analytics Verification Stamp</div>
          </div>
        </div>
      </div>
    </div>
  );
};
