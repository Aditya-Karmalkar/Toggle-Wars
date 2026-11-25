import React, { useState, useRef } from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import { parseExcelFile } from '../../utils/excelParser';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Info,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatINR, formatDate, maskGST } from '../../utils/formatters';
import { exportTransactionsToExcel } from '../../utils/exportUtils';
import { ValidationResult, SaleRecord } from '../../types/sales';

export const DataManagement: React.FC = () => {
  const {
    records,
    importRecords,
    resetToDefaultData,
    isCustomData
  } = useSalesData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // File handling
  const handleFile = (file: File) => {
    setSelectedFileName(file.name);
    setIsLoading(true);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseExcelFile(buffer);
        setValidationResult(result);
      } catch (err: any) {
        setValidationResult({
          isValid: false,
          totalRows: 0,
          validRows: 0,
          duplicateCount: 0,
          missingValuesCount: 0,
          issues: [{ row: 0, type: 'missing_field', field: 'File', value: null, message: `Failed to read Excel: ${err.message}` }],
          previewRecords: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleCommitImport = () => {
    if (!validationResult || validationResult.previewRecords.length === 0) return;
    importRecords(validationResult.previewRecords, importMode);
    setImportSuccessMsg(
      `Successfully ${importMode === 'replace' ? 'replaced dataset with' : 'appended'} ${validationResult.previewRecords.length} records into analytics memory!`
    );
    setValidationResult(null);
    setSelectedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadSample = () => {
    exportTransactionsToExcel(records.slice(0, 5), 'Gran_Asia_Sales_Template');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Management & Excel Import</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Import new Excel ledgers, validate column mappings, detect duplicate invoices, and maintain corporate sales records.
        </p>
      </div>

      {/* Success Notification */}
      {importSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{importSuccessMsg}</span>
          </div>
          <button
            onClick={() => setImportSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Active Dataset Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Active Working Dataset</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isCustomData ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isCustomData ? 'Custom Data Loaded' : 'Default OJT Dataset Loaded'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {records.length} sales transactions in memory (OJT.xlsx)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCustomData && (
            <button
              onClick={resetToDefaultData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              title="Restore initial 265 transactions from OJT Excel Sheet"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Dataset</span>
            </button>
          )}

          <button
            onClick={() => exportTransactionsToExcel(records, 'Gran_Asia_Current_Sales_Dataset')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Current Dataset</span>
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop File Upload Area */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Sales Excel Sheet (.xlsx, .xls)</h3>
            <p className="text-xs text-slate-500">
              Upload files following the standard “Sale” sheet structure. Columns are detected and mapped automatically.
            </p>
          </div>
          <button
            onClick={handleDownloadSample}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Download Sample Template</span>
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="text-sm font-bold text-slate-800">
            {isLoading ? 'Parsing Excel contents...' : 'Click to upload or drag & drop Excel workbook'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supports Microsoft Excel (.xlsx, .xls) & CSV • Sheet "Sale" auto-detected
          </p>

          {selectedFileName && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{selectedFileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Validation Report & Data Preview */}
      {validationResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <h3 className="text-base font-bold text-slate-900">
                  Pre-Import Data Validation Report
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated verification of columns, invoice uniqueness, and tax consistency.
              </p>
            </div>

            {/* Import Mode Selector */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Replace Dataset</span>
              </label>

              <span className="text-slate-300">|</span>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Append to Existing</span>
              </label>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">Total rows scanned</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{validationResult.totalRows}</div>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <div className="text-xs text-emerald-700 font-semibold">Valid records</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">{validationResult.validRows}</div>
            </div>

            <div className={`p-3 rounded-2xl border ${validationResult.duplicateCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-semibold">Duplicate invoices</div>
              <div className="text-xl font-bold mt-1">{validationResult.duplicateCount}</div>
            </div>

            <div className={`p-3 rounded-2xl border ${validationResult.missingValuesCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-semibold">Missing critical fields</div>
              <div className="text-xl font-bold mt-1">{validationResult.missingValuesCount}</div>
            </div>
          </div>

          {/* Issue Details List (if duplicate or missing values found) */}
          {validationResult.issues.length > 0 && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Validation Observations Detected ({validationResult.issues.length}):</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 text-xs text-amber-800">
                {validationResult.issues.map((iss, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="font-bold">Row <span className="font-mono">{iss.row}</span>:</span>
                    <span>{iss.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Data Preview (First 8 Rows)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">FY</th>
                    <th className="py-2 px-3">Month</th>
                    <th className="py-2 px-3">Invoice No</th>
                    <th className="py-2 px-3">Party Name</th>
                    <th className="py-2 px-3 text-right">Taxable (₹)</th>
                    <th className="py-2 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResult.previewRecords.slice(0, 8).map(row => (
                    <tr key={row.id}>
                      <td className="py-2 px-3 text-slate-600">{row.date}</td>
                      <td className="py-2 px-3 font-semibold">FY {row.financialYear}</td>
                      <td className="py-2 px-3">{row.month}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-900">{row.invoiceNumber}</td>
                      <td className="py-2 px-3 max-w-xs truncate">{row.partyName}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">{formatINR(row.taxableValue)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatINR(row.totalInvoiceValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={() => setValidationResult(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitImport}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-colors"
            >
              <span>Confirm & Load {validationResult.previewRecords.length} Records</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
