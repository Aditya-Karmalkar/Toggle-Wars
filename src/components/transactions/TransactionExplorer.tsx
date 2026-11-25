import React, { useState, useMemo } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  Calendar,
  X,
  Receipt,
  Printer
} from 'lucide-react';
import { formatINR, formatDate, maskGST } from '../../utils/formatters';
import { exportTransactionsToExcel, exportToCSV } from '../../utils/exportUtils';
import { getCurrencySymbol } from '../../utils/formatters';
import { SaleRecord } from '../../types/sales';

export const TransactionExplorer: React.FC = () => {
  const {
    filteredRecords,
    filters,
    setFilters,
    availableFYs,
    availableCustomers
  } = useSalesData();

  // Local component state
  const [showGST, setShowGST] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<keyof SaleRecord>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<SaleRecord | null>(null);

  // Sorting
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
    return list;
  }, [filteredRecords, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: keyof SaleRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(sortedRecords, 'Gran_Asia_Filtered_Transactions');
  };

  const handleExportCSV = () => {
    const currencySym = getCurrencySymbol();
    const formatted = sortedRecords.map((t, idx) => ({
      'Sr No': idx + 1,
      'Date': t.date,
      'Invoice Number': t.invoiceNumber,
      'Customer Name': t.partyName,
      'GSTIN': showGST ? (t.gstNumber || 'Unregistered') : maskGST(t.gstNumber, false),
      'Financial Year': `FY ${t.financialYear}`,
      'Month': t.month,
      [`Taxable Value (${currencySym})`]: t.taxableValue,
      [`CGST (9%) (${currencySym})`]: t.cgst,
      [`SGST (9%) (${currencySym})`]: t.sgst,
      [`IGST (${currencySym})`]: t.igst,
      [`Total Statutory GST (${currencySym})`]: Math.round((t.cgst + t.sgst + t.igst) * 100) / 100,
      [`Total Invoice Value (${currencySym})`]: t.totalInvoiceValue
    }));
    exportToCSV(formatted, 'Gran_Asia_Filtered_Transactions');
  };

  // Filtered Totals
  const totalTaxable = sortedRecords.reduce((acc, r) => acc + r.taxableValue, 0);
  const totalGross = sortedRecords.reduce((acc, r) => acc + r.totalInvoiceValue, 0);
  const totalGST = sortedRecords.reduce((acc, r) => acc + r.cgst + r.sgst + r.igst, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Transaction Explorer</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed sales ledger with multi-column sorting, granular date & account filters, GST privacy mask, and export capabilities.
        </p>
      </div>

      {/* 1. Quick Totals Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-semibold text-slate-500">Filtered invoices</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{sortedRecords.length} rows</div>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-semibold text-slate-500">Filtered taxable value</div>
          <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{formatINR(totalTaxable)}</div>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-semibold text-slate-500">Filtered GST</div>
          <div className="text-base font-bold text-teal-800 font-mono mt-0.5">{formatINR(totalGST)}</div>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-semibold text-slate-500">Filtered gross billed</div>
          <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">{formatINR(totalGross)}</div>
        </div>
      </div>

      {/* 2. Table Controls & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          {/* Left search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice, customer..."
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters({ searchQuery: e.target.value });
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-52 md:w-64"
              />
            </div>

            {/* Privacy Mask Toggle for GSTIN */}
            <button
              onClick={() => setShowGST(!showGST)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                showGST
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="GST numbers should not be exposed unnecessarily in the dashboard"
            >
              {showGST ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
              <span>{showGST ? 'Mask GSTIN' : 'Reveal GSTIN'}</span>
            </button>
          </div>

          {/* Right Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 3. Detailed Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/90 text-slate-700 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('financialYear')}>
                  <div className="flex items-center gap-1">FY <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('month')}>
                  <div className="flex items-center gap-1">Month <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('invoiceNumber')}>
                  <div className="flex items-center gap-1">Invoice no <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('partyName')}>
                  <div className="flex items-center gap-1">Party name <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                {showGST && <th className="py-2.5 px-3">GSTIN</th>}
                <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('taxableValue')}>
                  <div className="flex items-center justify-end gap-1">Taxable (₹) <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('totalInvoiceValue')}>
                  <div className="flex items-center justify-end gap-1">Total (₹) <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTxn(t)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-600 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-700">FY {t.financialYear}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">{t.month}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">{t.invoiceNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate" title={t.partyName}>
                      {t.partyName}
                    </td>
                    {showGST && (
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {maskGST(t.gstNumber, showGST)}
                      </td>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {formatINR(t.taxableValue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">{formatINR(t.cgst)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">{formatINR(t.sgst)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 whitespace-nowrap">{formatINR(t.igst)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatINR(t.totalInvoiceValue)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxn(t);
                        }}
                        className="p-1 text-slate-400 group-hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Invoice Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showGST ? 12 : 11} className="py-8 text-center text-slate-400 text-xs">
                    No transactions found matching active filters. Try adjusting your search query or date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Toolbar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-medium cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-400">|</span>
            <span>
              Showing {sortedRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, sortedRecords.length)} of {sortedRecords.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-slate-800 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. View Individual Transaction Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-lg border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-semibold text-slate-300">Sales invoice</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">{selectedTxn.invoiceNumber}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Issued on: {formatDate(selectedTxn.date)} (FY {selectedTxn.financialYear}, {selectedTxn.month})
                </p>
              </div>

              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-1 focus-visible:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Customer Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold">Billed to customer</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedTxn.partyName}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  GSTIN: {maskGST(selectedTxn.gstNumber, showGST)}
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 flex justify-between items-center bg-slate-50">
                  <span className="font-semibold text-slate-700">Taxable Value (Revenue)</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{formatINR(selectedTxn.taxableValue)}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center text-slate-600">
                  <span>Central GST (CGST 9%)</span>
                  <span className="font-mono">{formatINR(selectedTxn.cgst)}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center text-slate-600">
                  <span>State GST (SGST 9%)</span>
                  <span className="font-mono">{formatINR(selectedTxn.sgst)}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center text-slate-600">
                  <span>Integrated GST (IGST)</span>
                  <span className="font-mono">{formatINR(selectedTxn.igst)}</span>
                </div>
                <div className="p-3 flex justify-between items-center bg-blue-50/60 font-bold text-slate-900 text-sm">
                  <span>Total Invoice Value (Gross)</span>
                  <span className="font-mono text-blue-900">{formatINR(selectedTxn.totalInvoiceValue)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
