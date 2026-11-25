import * as XLSX from 'xlsx';
import { SaleRecord, ValidationResult, ValidationIssue } from '../types/sales';
import { FY_MONTH_ORDER } from './formatters';

// Column aliases for flexible auto-detection
const COLUMN_MAPPINGS: Record<string, string[]> = {
  month: ['month', 'mth', 'mon'],
  financialYear: ['financial year', 'fy', 'financialyear', 'fin year'],
  fyMonthNo: ['fy month no', 'fy month', 'fymonthno', 'month no', 'month num'],
  date: ['date', 'invoice date', 'bill date', 'inv date'],
  invoiceNumber: ['invoice number', 'invoice no', 'inv no', 'bill no', 'invoice_number'],
  partyName: ['party name', 'customer name', 'party', 'customer', 'client', 'buyer'],
  gstNumber: ['gst number', 'gstin', 'gst no', 'gst', 'gstin/uin'],
  taxableValue: ['taxable value', 'taxable amount', 'taxable amt', 'taxable val', 'subtotal', 'net amount'],
  igst: ['igst', 'igst amount', 'igst amt'],
  cgst: ['cgst', 'cgst amount', 'cgst amt'],
  sgst: ['sgst', 'sgst amount', 'sgst amt'],
  totalInvoiceValue: ['total invoice value', 'total value', 'total amount', 'invoice total', 'grand total', 'net total']
};

function normalizeHeader(h: string): string {
  return String(h || '').trim().toLowerCase().replace(/[_\-\.]+/g, ' ');
}

function matchColumn(header: string): string | null {
  const norm = normalizeHeader(header);
  for (const [key, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.includes(norm)) {
      return key;
    }
  }
  return null;
}

/**
 * Helper to determine Financial Year from a Date
 * In India, FY starts 1st April and ends 31st March.
 * E.g. 2024-04-15 -> '2024-25', 2025-02-10 -> '2024-25'
 */
export function getFYFromDate(date: Date): { fy: string; monthCode: string; fyMonthNo: number } {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 3 = Apr
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthCode = monthNames[month];
  
  let fyStart = year;
  let fyEnd = year + 1;
  let fyMonthNo = month >= 3 ? month - 2 : month + 10; // Apr=1, May=2 ... Mar=12

  if (month < 3) {
    // Jan, Feb, Mar belong to previous calendar year's FY
    fyStart = year - 1;
    fyEnd = year;
  }

  const fy = `${fyStart}-${String(fyEnd).substring(2)}`;
  return { fy, monthCode, fyMonthNo };
}

/**
 * Parse and validate an Excel file buffer or array buffer
 */
export function parseExcelFile(fileBuffer: ArrayBuffer): ValidationResult {
  const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
  
  // Find 'Sale' sheet or use first sheet
  const sheetNames = workbook.SheetNames;
  const targetSheetName = sheetNames.find(s => s.toLowerCase().includes('sale')) || sheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];

  if (!worksheet) {
    return {
      isValid: false,
      totalRows: 0,
      validRows: 0,
      duplicateCount: 0,
      missingValuesCount: 0,
      issues: [{ row: 0, type: 'missing_field', field: 'Sheet', value: null, message: 'No valid worksheet found in workbook' }],
      previewRecords: []
    };
  }

  // Convert to JSON with raw values
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
  if (rawRows.length < 2) {
    return {
      isValid: false,
      totalRows: 0,
      validRows: 0,
      duplicateCount: 0,
      missingValuesCount: 0,
      issues: [{ row: 0, type: 'missing_field', field: 'Data', value: null, message: 'Worksheet is empty or has no header row' }],
      previewRecords: []
    };
  }

  // Map header row
  const headerRow = rawRows[0] as string[];
  const fieldMap: Record<number, string> = {};
  
  headerRow.forEach((colName, idx) => {
    const matched = matchColumn(colName);
    if (matched) {
      fieldMap[idx] = matched;
    }
  });

  const parsedRecords: SaleRecord[] = [];
  const issues: ValidationIssue[] = [];
  const invoiceSeenMap = new Map<string, number>(); // invoice -> first seen row
  let duplicateCount = 0;
  let missingValuesCount = 0;

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every((c: any) => c === undefined || c === null || String(c).trim() === '')) {
      continue; // Skip empty row
    }

    const rowObj: any = {};
    for (const [colIdxStr, fieldKey] of Object.entries(fieldMap)) {
      const colIdx = parseInt(colIdxStr, 10);
      rowObj[fieldKey] = row[colIdx];
    }

    // Check mandatory fields
    const invoiceNum = String(rowObj.invoiceNumber || '').trim();
    const partyName = String(rowObj.partyName || '').trim();
    const rawTaxable = rowObj.taxableValue;

    if (!invoiceNum) {
      issues.push({ row: r + 1, type: 'missing_field', field: 'Invoice Number', value: invoiceNum, message: 'Missing Invoice Number' });
      missingValuesCount++;
    }
    if (!partyName) {
      issues.push({ row: r + 1, type: 'missing_field', field: 'Party Name', value: partyName, message: 'Missing Party Name' });
      missingValuesCount++;
    }

    // Duplicate Invoice check
    if (invoiceNum) {
      if (invoiceSeenMap.has(invoiceNum)) {
        duplicateCount++;
        issues.push({
          row: r + 1,
          type: 'duplicate_invoice',
          field: 'Invoice Number',
          value: invoiceNum,
          message: `Duplicate Invoice Number "${invoiceNum}" (first seen on row ${invoiceSeenMap.get(invoiceNum)})`
        });
      } else {
        invoiceSeenMap.set(invoiceNum, r + 1);
      }
    }

    // Parse Taxable and Tax numbers
    const cleanNum = (v: any) => {
      if (v === undefined || v === null || v === '') return 0;
      if (typeof v === 'number') return v;
      const cleaned = String(v).replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const taxableVal = cleanNum(rawTaxable);
    const cgstVal = cleanNum(rowObj.cgst);
    const sgstVal = cleanNum(rowObj.sgst);
    const igstVal = cleanNum(rowObj.igst);
    let totalInvVal = cleanNum(rowObj.totalInvoiceValue);

    // If total invoice value is missing or 0, calculate it: taxable + cgst + sgst + igst
    if (totalInvVal === 0 && taxableVal > 0) {
      totalInvVal = Math.round((taxableVal + cgstVal + sgstVal + igstVal) * 100) / 100;
    }

    // Parse Date and FY
    let dateStr = String(rowObj.date || '').trim();
    let monthCode = String(rowObj.month || '').trim();
    let fy = String(rowObj.financialYear || '').trim();
    let fyMonthNo = parseInt(String(rowObj.fyMonthNo || '0'), 10);

    // Normalize date string if standard date object or timestamp
    let parsedDate: Date | null = null;
    if (dateStr) {
      // Check if it's already YYYY-MM-DD or DD/MM/YYYY or excel serial
      if (!isNaN(Number(dateStr)) && Number(dateStr) > 40000) {
        // Excel serial date
        const jsDate = new Date((Number(dateStr) - 25569) * 86400 * 1000);
        parsedDate = jsDate;
      } else {
        parsedDate = new Date(dateStr);
      }
    }

    if (parsedDate && !isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const monthIdx = parsedDate.getMonth();
      const monthPadded = String(monthIdx + 1).padStart(2, '0');
      const dayPadded = String(parsedDate.getDate()).padStart(2, '0');
      dateStr = `${year}-${monthPadded}-${dayPadded}`;

      const computed = getFYFromDate(parsedDate);
      if (!monthCode) monthCode = computed.monthCode;
      if (!fy) fy = computed.fy;
      if (!fyMonthNo || isNaN(fyMonthNo)) fyMonthNo = computed.fyMonthNo;
    } else {
      if (!monthCode) monthCode = 'Apr';
      if (!fyMonthNo) fyMonthNo = FY_MONTH_ORDER[monthCode] || 1;
    }

    parsedRecords.push({
      id: `IMP-${r}-${invoiceNum || Math.random().toString(36).substring(7)}`,
      month: monthCode,
      financialYear: fy || 'Unknown',
      fyMonthNo: fyMonthNo,
      date: dateStr || '2024-04-01',
      invoiceNumber: invoiceNum || `INV-${r}`,
      partyName: partyName || 'Unknown Customer',
      gstNumber: String(rowObj.gstNumber || '').trim(),
      taxableValue: Math.round(taxableVal * 100) / 100,
      igst: Math.round(igstVal * 100) / 100,
      cgst: Math.round(cgstVal * 100) / 100,
      sgst: Math.round(sgstVal * 100) / 100,
      totalInvoiceValue: Math.round(totalInvVal * 100) / 100
    });
  }

  return {
    isValid: parsedRecords.length > 0 && issues.filter(i => i.type === 'missing_field').length === 0,
    totalRows: rawRows.length - 1,
    validRows: parsedRecords.length,
    duplicateCount,
    missingValuesCount,
    issues,
    previewRecords: parsedRecords
  };
}
