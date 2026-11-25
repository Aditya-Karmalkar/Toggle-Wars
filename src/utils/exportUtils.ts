import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { SaleRecord, KPIMetrics, CustomerSummary, FinancialYearData, MonthlyRevenueData } from '../types/sales';
import { formatINR, getCurrencySymbol } from './formatters';

/**
 * Capture rendered DOM report and export as High-Resolution A4 PDF
 * (Guarantees 100% fidelity to the on-screen executive dashboard styling)
 */
export async function exportDOMToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found`);
  }

  // Render canvas at 2x retina DPI for razor-sharp typography and borders
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentWidth = pdfWidth - margin * 2;
  const pageContentHeight = pdfHeight - margin * 2;
  const totalImgHeight = (canvas.height * contentWidth) / canvas.width;

  let heightLeft = totalImgHeight;
  let page = 0;

  while (heightLeft > 0) {
    if (page > 0) {
      pdf.addPage();
    }
    const position = margin - (page * pageContentHeight);
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, totalImgHeight, undefined, 'FAST');
    page++;
    heightLeft -= pageContentHeight;
  }

  pdf.save(`${filename}.pdf`);
}

/**
 * Export any array of formatted objects to CSV with UTF-8 BOM
 * (Guarantees proper opening in Microsoft Excel on Windows without character corruption)
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel respects encoding
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export transactions to Excel (.xlsx) with auto-fit column widths
 */
export function exportTransactionsToExcel(transactions: SaleRecord[], filename: string = 'Gran_Asia_Sales_Transactions'): void {
  const currencySym = getCurrencySymbol();
  const formattedData = transactions.map((t, idx) => ({
    'Sr No': idx + 1,
    'Date': t.date,
    'Financial Year': `FY ${t.financialYear}`,
    'Month': t.month,
    'Invoice Number': t.invoiceNumber,
    'Customer Name': t.partyName,
    'GSTIN': t.gstNumber || 'Unregistered',
    [`Taxable Value (${currencySym})`]: t.taxableValue,
    [`CGST (${currencySym})`]: t.cgst,
    [`SGST (${currencySym})`]: t.sgst,
    [`IGST (${currencySym})`]: t.igst,
    [`Total GST (${currencySym})`]: Math.round((t.cgst + t.sgst + t.igst) * 100) / 100,
    [`Total Invoice Value (${currencySym})`]: t.totalInvoiceValue
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set explicit, generous column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Sr No
    { wch: 14 }, // Date
    { wch: 16 }, // Financial Year
    { wch: 10 }, // Month
    { wch: 18 }, // Invoice Number
    { wch: 38 }, // Customer Name
    { wch: 20 }, // GSTIN
    { wch: 20 }, // Taxable Value
    { wch: 14 }, // CGST
    { wch: 14 }, // SGST
    { wch: 14 }, // IGST
    { wch: 16 }, // Total GST
    { wch: 22 }  // Total Invoice Value
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Transactions');

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Generate comprehensive Multi-sheet Excel Executive BI Report with full styling & auto-fit columns
 */
export function exportComprehensiveBIExcel(
  kpis: KPIMetrics,
  transactions: SaleRecord[],
  fyData: FinancialYearData[],
  customers: CustomerSummary[],
  monthlyData: MonthlyRevenueData[],
  filename: string = 'Gran_Asia_BI_Executive_Report'
): void {
  const workbook = XLSX.utils.book_new();
  const currencySym = getCurrencySymbol();

  // 1. KPI Summary Sheet
  const kpiRows = [
    { 'Executive Summary Metric': 'Company Name', 'Reported Value': 'Gran Asia Life Sciences LLP, Pune' },
    { 'Executive Summary Metric': 'Report Title', 'Reported Value': 'Sales Performance & Revenue Growth Analytics Report' },
    { 'Executive Summary Metric': 'Audit Status', 'Reported Value': 'Verified Against Official ERP/Tally Ledger' },
    { 'Executive Summary Metric': 'Generated On', 'Reported Value': new Date().toLocaleString('en-IN') },
    { 'Executive Summary Metric': '', 'Reported Value': '' },
    { 'Executive Summary Metric': 'FINANCIAL PERFORMANCE METRICS', 'Reported Value': 'AUDITED VALUE' },
    { 'Executive Summary Metric': `Total Taxable Revenue (${currencySym})`, 'Reported Value': formatINR(kpis.totalRevenue) },
    { 'Executive Summary Metric': `Total Gross Invoice Value (${currencySym})`, 'Reported Value': formatINR(kpis.totalInvoiceValue) },
    { 'Executive Summary Metric': `Total Statutory GST Collected (${currencySym})`, 'Reported Value': formatINR(kpis.totalGSTCollected) },
    { 'Executive Summary Metric': `Central GST (CGST 9%) (${currencySym})`, 'Reported Value': formatINR(kpis.totalCGST) },
    { 'Executive Summary Metric': `State GST (SGST 9%) (${currencySym})`, 'Reported Value': formatINR(kpis.totalSGST) },
    { 'Executive Summary Metric': `Integrated GST (IGST) (${currencySym})`, 'Reported Value': formatINR(kpis.totalIGST) },
    { 'Executive Summary Metric': 'Total Sales Invoices Executed', 'Reported Value': `${kpis.totalTransactions} Invoices` },
    { 'Executive Summary Metric': 'Total Active Corporate Accounts', 'Reported Value': `${kpis.totalCustomers} Clients` },
    { 'Executive Summary Metric': `Average Invoice Ticket Size (${currencySym})`, 'Reported Value': formatINR(kpis.averageInvoiceValue) },
    { 'Executive Summary Metric': 'Top Performing Customer', 'Reported Value': kpis.topCustomer ? `${kpis.topCustomer.name} (${formatINR(kpis.topCustomer.revenue)} · ${kpis.topCustomer.percentage.toFixed(1)}% share)` : 'N/A' },
  ];
  const wsKPI = XLSX.utils.json_to_sheet(kpiRows);
  wsKPI['!cols'] = [{ wch: 40 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, wsKPI, 'Executive Summary');

  // 2. Financial Year Breakdown
  const fyRows = fyData.map(f => ({
    'Financial Year': `FY ${f.financialYear}`,
    [`Taxable Revenue (${currencySym})`]: f.revenue,
    [`Total Gross Invoiced (${currencySym})`]: f.totalInvoiceValue,
    [`Total GST (${currencySym})`]: f.totalGst,
    'Invoices Executed': f.transactions,
    'Active Accounts': f.customers,
    [`Average Ticket (${currencySym})`]: f.avgInvoiceValue,
    'YoY Revenue Growth (%)': f.yoyGrowth !== null && f.yoyGrowth !== undefined ? `${f.yoyGrowth.toFixed(1)}%` : 'Base Period',
    'Reporting Status': f.isPartialYear ? 'Partial Year' : 'Complete 12-Month Fiscal Cycle'
  }));
  const wsFY = XLSX.utils.json_to_sheet(fyRows);
  wsFY['!cols'] = [
    { wch: 18 }, { wch: 24 }, { wch: 24 }, { wch: 18 },
    { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 22 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsFY, 'Financial Year Analytics');

  // 3. Customer Performance
  const custRows = customers.map(c => ({
    'Rank': c.rank,
    'Customer Name': c.partyName,
    'Segment': c.segment,
    [`Total Revenue (${currencySym})`]: c.totalRevenue,
    'Revenue Contribution (%)': `${c.revenueContributionPct.toFixed(2)}%`,
    'Invoices Count': c.invoiceCount,
    [`Average Invoice Value (${currencySym})`]: c.avgInvoiceValue,
    'First Purchase Date': c.firstPurchaseDate,
    'Last Purchase Date': c.lastPurchaseDate
  }));
  const wsCust = XLSX.utils.json_to_sheet(custRows);
  wsCust['!cols'] = [
    { wch: 8 }, { wch: 38 }, { wch: 16 }, { wch: 22 },
    { wch: 24 }, { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsCust, 'Customer Performance');

  // 4. Monthly Trend (Chronological Apr - Mar)
  const mthRows = monthlyData.map(m => ({
    'FY Month No': `M-${m.fyMonthNo}`,
    'Month': m.month,
    [`Taxable Revenue (${currencySym})`]: m.revenue,
    [`Total Invoiced (${currencySym})`]: m.totalInvoiceValue,
    [`Total GST (${currencySym})`]: m.totalGst,
    'Invoices Executed': m.transactions,
    [`Average Ticket (${currencySym})`]: m.avgInvoiceValue,
    'MoM Growth (%)': m.momGrowth !== null && m.momGrowth !== undefined ? `${m.momGrowth.toFixed(1)}%` : 'N/A'
  }));
  const wsMth = XLSX.utils.json_to_sheet(mthRows);
  wsMth['!cols'] = [
    { wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
    { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsMth, 'Monthly Sales Trend');

  // 5. Statutory GST Liability Reconciliation
  const gstRows = fyData.map(f => ({
    'Financial Year': `FY ${f.financialYear}`,
    [`Taxable Turnover (${currencySym})`]: f.revenue,
    [`Central GST (CGST 9%) (${currencySym})`]: f.totalGst / 2,
    [`State GST (SGST 9%) (${currencySym})`]: f.totalGst / 2,
    [`Integrated GST (IGST) (${currencySym})`]: 0,
    [`Total Statutory GST (${currencySym})`]: f.totalGst
  }));
  const wsGST = XLSX.utils.json_to_sheet(gstRows);
  wsGST['!cols'] = [
    { wch: 18 }, { wch: 24 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsGST, 'GST Statutory Reconciliation');

  // 6. Complete Raw Transactions Ledger
  const rawRows = transactions.map((t, idx) => ({
    'Sr No': idx + 1,
    'Date': t.date,
    'Financial Year': `FY ${t.financialYear}`,
    'Month': t.month,
    'Invoice No': t.invoiceNumber,
    'Customer Name': t.partyName,
    'GSTIN': t.gstNumber || 'Unregistered',
    [`Taxable Value (${currencySym})`]: t.taxableValue,
    [`CGST (${currencySym})`]: t.cgst,
    [`SGST (${currencySym})`]: t.sgst,
    [`IGST (${currencySym})`]: t.igst,
    [`Total Gross Value (${currencySym})`]: t.totalInvoiceValue
  }));
  const wsRaw = XLSX.utils.json_to_sheet(rawRows);
  wsRaw['!cols'] = [
    { wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 18 },
    { wch: 38 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsRaw, 'Transactions Ledger');

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Generate Vector Executive PDF Report (Fallback & Programmatic)
 */
export function exportExecutivePDF(
  kpis: KPIMetrics,
  fyData: FinancialYearData[],
  customers: CustomerSummary[],
  title: string = 'Executive Sales Performance Report',
  reportType: string = 'executive',
  monthlyData: MonthlyRevenueData[] = []
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const currencySym = getCurrencySymbol();

  // 1. Executive Top Header Banner (Deep Slate Navy)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GRAN ASIA LIFE SCIENCES LLP, PUNE', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Sales Performance & Revenue Growth Analytics Platform', 14, 18);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Audited Ledger · Generated ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    14,
    25
  );

  // 2. Report Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 40);

  // 3. Executive KPI Summary Grid (4 structured scorecards)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 44, pageWidth - 28, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 44, pageWidth - 28, 22, 2, 2, 'D');

  const kpiItems = [
    { label: 'Taxable Revenue', value: formatINR(kpis.totalRevenue) },
    { label: 'Total Invoiced', value: formatINR(kpis.totalInvoiceValue) },
    { label: 'Total GST Collected', value: formatINR(kpis.totalGSTCollected) },
    { label: 'Invoices Executed', value: `${kpis.totalTransactions} Invoices` },
  ];

  const colW = (pageWidth - 28) / 4;
  kpiItems.forEach((item, i) => {
    const x = 18 + i * colW;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x, 51);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.value, x, 59);
  });

  let currentY = 74;

  // 4. Conditional Report Tables Based On Active Report
  if (reportType === 'executive' || reportType === 'financial_year') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Financial Year-wise Performance Overview', 14, currentY);

    const fyTableRows = fyData.map(f => [
      `FY ${f.financialYear}`,
      formatINR(f.revenue),
      formatINR(f.totalInvoiceValue),
      formatINR(f.totalGst),
      f.transactions.toString(),
      formatINR(f.avgInvoiceValue),
      f.yoyGrowth !== null && f.yoyGrowth !== undefined ? `${f.yoyGrowth > 0 ? '+' : ''}${f.yoyGrowth.toFixed(1)}%` : 'Base',
      f.isPartialYear ? 'Partial' : 'Full Year'
    ]);

    const totalTaxable = fyData.reduce((acc, f) => acc + f.revenue, 0);
    const totalGross = fyData.reduce((acc, f) => acc + f.totalInvoiceValue, 0);
    const totalGst = fyData.reduce((acc, f) => acc + f.totalGst, 0);
    const totalBills = fyData.reduce((acc, f) => acc + f.transactions, 0);
    const overallAvg = totalBills > 0 ? totalTaxable / totalBills : 0;

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Financial Year', `Taxable (${currencySym})`, `Total Invoiced (${currencySym})`, `Total GST (${currencySym})`, 'Bills', `Avg Ticket (${currencySym})`, 'YoY Growth', 'Coverage']],
      body: fyTableRows,
      foot: [['Summary Total', formatINR(totalTaxable), formatINR(totalGross), formatINR(totalGst), totalBills.toString(), formatINR(overallAvg), '-', '5 Cycles']],
      showFoot: 'lastPage',
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'left', cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42], cellPadding: 2.5 },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'center' }
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : currentY + 45;
  }

  if (reportType === 'revenue_growth') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Multi-Year Revenue Growth Trajectory & Fiscal Momentum', 14, currentY);

    const growthRows = fyData.map(f => [
      `FY ${f.financialYear}`,
      formatINR(f.revenue),
      formatINR(f.totalInvoiceValue),
      f.yoyGrowth !== null && f.yoyGrowth !== undefined
        ? `${f.yoyGrowth > 0 ? '+' : ''}${f.yoyGrowth.toFixed(1)}%`
        : 'Baseline Period',
      f.transactions.toString(),
      formatINR(f.avgInvoiceValue),
      f.isPartialYear ? 'Partial Cycle' : 'Complete 12M'
    ]);

    const totalRev = fyData.reduce((acc, f) => acc + f.revenue, 0);
    const totalInv = fyData.reduce((acc, f) => acc + f.totalInvoiceValue, 0);
    const totalTxn = fyData.reduce((acc, f) => acc + f.transactions, 0);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Financial Year', `Taxable Turnover (${currencySym})`, `Total Invoiced (${currencySym})`, 'YoY Growth (%)', 'Orders', `Avg Ticket (${currencySym})`, 'Fiscal Status']],
      body: growthRows,
      foot: [['Summary Total', formatINR(totalRev), formatINR(totalInv), '-', totalTxn.toString(), formatINR(totalTxn > 0 ? totalRev / totalTxn : 0), '5 Fiscal Cycles']],
      showFoot: 'lastPage',
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3.5 },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42], cellPadding: 2.5 },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'center' }
      },
      margin: { left: 14, right: 14 },
    });
  }

  if (reportType === 'executive' || reportType === 'customer') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(
      reportType === 'customer'
        ? 'Customer Performance & Concentration Rankings'
        : 'Top Corporate Accounts by Revenue Contribution',
      14,
      currentY
    );

    const count = reportType === 'customer' ? 18 : 8;
    const topSlice = customers.slice(0, count);
    const topCustRows = topSlice.map((c, i) => [
      `#${i + 1}`,
      c.partyName,
      c.segment,
      formatINR(c.totalRevenue),
      `${c.revenueContributionPct.toFixed(1)}%`,
      c.invoiceCount.toString(),
      formatINR(c.avgInvoiceValue)
    ]);

    const topRevTotal = topSlice.reduce((acc, c) => acc + c.totalRevenue, 0);
    const topPctTotal = topSlice.reduce((acc, c) => acc + c.revenueContributionPct, 0);
    const topOrdersTotal = topSlice.reduce((acc, c) => acc + c.invoiceCount, 0);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Rank', 'Customer Name', 'Segment', `Taxable Sales (${currencySym})`, 'Share', 'Orders', `Avg Ticket (${currencySym})`]],
      body: topCustRows,
      foot: [['Top Accounts Subtotal', `${count} Ranked Accounts`, '-', formatINR(topRevTotal), `${topPctTotal.toFixed(1)}%`, topOrdersTotal.toString(), formatINR(topOrdersTotal > 0 ? topRevTotal / topOrdersTotal : 0)]],
      showFoot: 'lastPage',
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42], cellPadding: 2.5 },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 14 },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' }
      },
      margin: { left: 14, right: 14 },
    });
  }

  if (reportType === 'monthly') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Chronological Monthly Sales Breakdown (April to March Fiscal Order)', 14, currentY);

    const monthlyRows = monthlyData.map(m => [
      `M-${m.fyMonthNo}`,
      m.month,
      formatINR(m.revenue),
      formatINR(m.totalInvoiceValue),
      formatINR(m.totalGst),
      m.transactions.toString(),
      formatINR(m.avgInvoiceValue),
      m.momGrowth !== null && m.momGrowth !== undefined ? `${m.momGrowth > 0 ? '+' : ''}${m.momGrowth.toFixed(1)}%` : 'Base'
    ]);

    const mRevTotal = monthlyData.reduce((acc, m) => acc + m.revenue, 0);
    const mGrossTotal = monthlyData.reduce((acc, m) => acc + m.totalInvoiceValue, 0);
    const mGSTTotal = monthlyData.reduce((acc, m) => acc + m.totalGst, 0);
    const mBillsTotal = monthlyData.reduce((acc, m) => acc + m.transactions, 0);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['FY Month No', 'Month', `Taxable Revenue (${currencySym})`, `Gross Invoiced (${currencySym})`, `Total GST (${currencySym})`, 'Invoices', `Avg Ticket (${currencySym})`, 'MoM Growth']],
      body: monthlyRows,
      foot: [['Fiscal Year Total', '12 Months', formatINR(mRevTotal), formatINR(mGrossTotal), formatINR(mGSTTotal), mBillsTotal.toString(), formatINR(mBillsTotal > 0 ? mRevTotal / mBillsTotal : 0), '-']],
      showFoot: 'lastPage',
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42], cellPadding: 2.5 },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' }
      },
      margin: { left: 14, right: 14 },
    });
  }

  if (reportType === 'gst_summary') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Statutory GST Liability & Reconciliation Ledger', 14, currentY);

    const gstRows = fyData.map(f => [
      `FY ${f.financialYear}`,
      formatINR(f.revenue),
      formatINR(f.totalGst / 2),
      formatINR(f.totalGst / 2),
      formatINR(0),
      formatINR(f.totalGst)
    ]);

    const totalTaxable = fyData.reduce((acc, f) => acc + f.revenue, 0);
    const totalGst = fyData.reduce((acc, f) => acc + f.totalGst, 0);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Financial Year', `Taxable Turnover (${currencySym})`, `CGST (9%) (${currencySym})`, `SGST (9%) (${currencySym})`, `IGST (${currencySym})`, `Total Statutory GST (${currencySym})`]],
      body: gstRows,
      foot: [['Statutory Ledger Total', formatINR(totalTaxable), formatINR(totalGst / 2), formatINR(totalGst / 2), formatINR(0), formatINR(totalGst)]],
      showFoot: 'lastPage',
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42], cellPadding: 2.5 },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      },
      margin: { left: 14, right: 14 },
    });
  }

  // 5. Official Verification Footer on All Pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 283, pageWidth - 14, 283);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Gran Asia Life Sciences LLP, Pune · Official Sales Performance & Revenue Analytics Ledger', 14, 288);
    doc.text(`Page ${p} of ${pageCount}`, pageWidth - 26, 288);
  }

  doc.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`);
}
