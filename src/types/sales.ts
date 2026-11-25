export interface SaleRecord {
  id: string;
  month: string;           // 'Apr', 'May', ..., 'Mar'
  financialYear: string;   // '2021-22', '2022-23', etc.
  fyMonthNo: number;       // 1 for Apr .. 12 for Mar
  date: string;            // 'YYYY-MM-DD'
  invoiceNumber: string;
  partyName: string;
  gstNumber: string;
  taxableValue: number;    // Business Revenue
  igst: number;
  cgst: number;
  sgst: number;
  totalInvoiceValue: number; // Gross Invoiced Amount including GST
}

export interface FilterState {
  financialYear: string;   // 'ALL' or specific FY like '2024-25'
  selectedMonths: string[]; // ['Apr', 'May', ...]
  startDate: string;       // 'YYYY-MM-DD' or ''
  endDate: string;         // 'YYYY-MM-DD' or ''
  customerName: string;    // 'ALL' or specific customer name
  searchQuery: string;
}

export interface KPIMetrics {
  totalRevenue: number;         // Sum of Taxable Value
  totalInvoiceValue: number;    // Gross billed value
  totalTransactions: number;    // Total invoices count
  totalCustomers: number;       // Unique party names
  averageInvoiceValue: number;  // Total Revenue / Total Transactions
  revenueGrowthPercent: number | null; // vs previous period
  topCustomer: {
    name: string;
    revenue: number;
    percentage: number;
  } | null;
  totalGSTCollected: number;    // IGST + CGST + SGST
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  // Comparison metrics (previous period)
  prevPeriodRevenue?: number;
  prevPeriodInvoices?: number;
  prevPeriodAvgInvoice?: number;
}

export interface MonthlyRevenueData {
  month: string;
  fyMonthNo: number;
  financialYear?: string;
  revenue: number;
  totalInvoiceValue: number;
  transactions: number;
  avgInvoiceValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  momGrowth?: number | null;
}

export interface FinancialYearData {
  financialYear: string;
  revenue: number;
  totalInvoiceValue: number;
  transactions: number;
  customers: number;
  avgInvoiceValue: number;
  totalGst: number;
  yoyGrowth?: number | null;
  monthsCount: number;
  isPartialYear: boolean;
}

export interface CustomerSummary {
  partyName: string;
  gstNumber: string;
  totalRevenue: number;
  totalInvoiceValue: number;
  invoiceCount: number;
  avgInvoiceValue: number;
  revenueContributionPct: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  activeFinancialYears: string[];
  segment: 'High Value' | 'Medium Value' | 'Low Value';
  rank: number;
  yoyGrowth?: number | null;
}

export interface SegmentationConfig {
  highValueThresholdPct: number; // e.g. top 10% or revenue > 5%
  mediumValueThresholdPct: number; // e.g. 1% to 5%
}

export interface AutomatedInsight {
  id: string;
  category: 'positive' | 'warning' | 'recommendation';
  title: string;
  highlightValue: string;
  description: string;
  mathematicalProof: string;
  actionableStep?: string;
  metrics: Record<string, string | number>;
  priority: 'high' | 'medium' | 'low';
}

export interface ValidationIssue {
  row: number;
  type: 'duplicate_invoice' | 'missing_field' | 'invalid_date' | 'invalid_amount' | 'invalid_fy';
  field: string;
  value: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  duplicateCount: number;
  missingValuesCount: number;
  issues: ValidationIssue[];
  previewRecords: SaleRecord[];
}
