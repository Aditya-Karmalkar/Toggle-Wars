# Sales Performance & Revenue Growth Analytics Platform
### Gran Asia Life Sciences LLP, Pune · Power BI Architecture

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React 18](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)

A modern, executive-grade Business Intelligence (BI) web platform titled **"Sales Performance & Revenue Growth Analytics Using Power BI – Gran Asia Life Sciences LLP, Pune"**. Designed to provide senior leadership with instant visibility into commercial performance, customer revenue concentration, multi-year sales velocity, automated audit observations, and statutory tax compliance.

The platform combines the analytical depth and visual sophistication of **Microsoft Power BI** with the responsiveness, clean typography, and fluid interactivity of modern enterprise SaaS applications (inspired by Stripe Analytics and AlignUI).

---

## 📊 Ground-Truth Business Verification

The application is pre-loaded and validated against the verified corporate ledger (`OJT.xlsx` / `initialSalesData.json`, Sheet: `Sale`, 265 transactions across 37 corporate accounts):

| Strategic Executive KPI | Verified Ground Truth | Analytical & Accounting Context |
| :--- | :--- | :--- |
| **Total Net Turnover (Taxable Value)** | **₹ 1,11,47,783.66** (~₹ 1.11 Cr) | Primary business revenue measure (excludes pass-through GST) |
| **Total Gross Invoice Value** | **₹ 1,31,54,384.72** (~₹ 1.32 Cr) | Total billed value across all corporate commercial invoices |
| **Total Statutory GST Collected** | **₹ 20,06,601.06** (~₹ 20.07 L) | 100% Intra-State (CGST 9%: ₹ 10.03 L, SGST 9%: ₹ 10.03 L, 0 IGST) |
| **Total Sales Transactions** | **265 Invoices** | Complete historical ledger covering FY 2021-22 through FY 2025-26 |
| **Unique Corporate Accounts** | **37 Verified Customers** | B2B industrial clients across Maharashtra |
| **Average Invoice Ticket Size (AOV)** | **₹ 42,067.11** | Taxable turnover divided by total transaction volume |
| **Latest YoY Expansion (FY 25-26)** | **+59.2%** YoY Surge | Revenue expanded from ₹ 25.25 L to a record ₹ 40.20 L |
| **Top Account Contribution** | **41.51%** (PS Auto Systems) | Single-account concentration of ₹ 46.28 L across 57 invoices |

---

## 📅 Indian Financial Year Analysis (April 1 – March 31)

Revenue is strictly recognized according to Indian Fiscal Years. Partial financial years are isolated and tagged to avoid misleading benchmarking against complete 12-month periods:

| Financial Year | Taxable Turnover | Invoices | Avg Ticket Size | Total GST Collected | YoY Growth | Reporting Period Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **FY 2021-22** | ₹ 8,29,740.00 | 29 | ₹ 28,611.72 | ₹ 1,49,353.20 | *Baseline Period* | ⚠️ Partial Cycle (29 invoices) |
| **FY 2022-23** | ₹ 9,72,600.00 | 24 | ₹ 40,525.00 | ₹ 1,75,068.00 | **+17.2%** | ⚠️ Partial Cycle (24 invoices) |
| **FY 2023-24** | ₹ 28,00,886.00 | 56 | ₹ 50,015.82 | ₹ 5,04,159.48 | **+188.0%** | ✅ Complete 12-Month Cycle |
| **FY 2024-25** | ₹ 25,24,586.48 | 63 | ₹ 40,072.80 | ₹ 4,54,425.56 | **-9.9%** | ✅ Complete 12-Month Cycle |
| **FY 2025-26** | ₹ 40,19,971.18 | 93 | ₹ 43,225.50 | ₹ 7,23,594.82 | **+59.2%** | 🏆 Peak Fiscal Cycle (93 invoices) |

---

## 🚀 Key Modules & Capabilities

### 1. Executive Overview Dashboard
* **8 Core KPI Cards**: Total Revenue, Total Invoice Value, Sales Invoices, Unique Customers, Average Ticket, YoY Growth, Top Account, and Total GST.
* **8 Interactive Visualizations**:
  * Monthly Revenue Trend (Spline Wave with dynamic cyan-blue high-contrast tooltips).
  * Financial Year-wise Revenue Comparison.
  * Customer-wise Revenue Contribution (Ranked horizontal bars).
  * Revenue Distribution by Customer (Donut chart).
  * Monthly Sales Transactions (Area volume).
  * Statutory GST Distribution (Stacked CGST/SGST/IGST).
  * Top 10 Customers ranking.
  * Average Invoice Value Trend (AOV tracking).

### 2. Sales Performance Analytics
* Multi-year sales velocity, quarterly distribution (Q1: Apr–Jun, Q2: Jul–Sep, Q3: Oct–Dec, Q4: Jan–Mar).
* Side-by-side Financial Year comparison tool (e.g. FY 2024-25 vs FY 2025-26) with automated variance calculations.
* Month-over-Month (MoM) and Year-over-Year (YoY) growth tracking with partial-year indicators.

### 3. Customer Performance & Concentration
* **Top 10 Accounts Breakdown**: Revenue contribution %, invoice volume, and ticket sizes.
* **Configurable 3-Tier Segmentation**: High Value (&ge; 5%), Medium Value (1%–5%), and Low Value (&lt; 1%).
* Customer Concentration analysis: Highlights that Top 3 accounts generate **70.28%** of total business turnover.
* Searchable customer ledger with single-click modal displaying historical order logs.

### 4. Revenue Growth & Momentum
* 5-Year cumulative expansion curve and compound growth trajectory.
* **12-Month Fiscal Heatmap Matrix**: Identifies peak revenue months (December: ₹ 20.85 L) and low periods (September: ₹ 3.90 L).
* Volatility Index and coefficient of variation analysis.

### 5. Automated Business Insights & Action Roadmap
* **Positive Observations**: FY 2025-26 acceleration (+59.2%), Q3 peak seasonal strength, strong corporate partnership performance.
* **Warning Alerts**: Single-account concentration exposure (PS Auto Systems: 41.5%), dormant historical accounts, duplicate invoice detection (`25-26/23`).
* **Executive Action Roadmap**: Diversification plan, 15% ticket size uplift initiative, and key account retention directives with mathematical citations.

### 6. Sales Transaction Explorer
* Searchable, filterable, and sortable 265-transaction master ledger.
* Granular date range, financial year, and account filters.
* **GSTIN Privacy Masking**: Toggleable masking (`27AAP****1Z5`) to prevent exposure of tax identifiers.
* Individual invoice details inspection modal.

### 7. Global Multi-Dimensional Filters
* Unified filter bar across Financial Year, Date Range, Month, and Customer Name.
* Synchronizes instantly across all KPI cards, Recharts, tables, and insight computations.
* One-click filter reset button.

### 8. Data Management & Excel Import
* Support for `.xlsx`, `.xls`, and `.csv` files.
* Automatic column detection and alias mapping (normalizes column variants like `Party Name`, `Customer`, `Buyer`).
* Validation engine: detects duplicates, missing values, and date anomalies with detailed error reporting.
* Dataset replacement or append modes, with a 1-click restore to the original verified dataset.

### 9. Multi-Format Report & Document Export
* **High-Resolution DOM Capture (`Download PDF`)**: Renders the styled preview via `html2canvas` at 2x retina scale into A4 pages.
* **Native Vector Print (`Print / Vector PDF`)**: Uses `window.print()` with `@media print` rules for razor-sharp vector typography and clean page breaks.
* **Multi-Sheet Excel Workbook (`.xlsx`)**: Comprehensive workbook with formatted column widths across Executive Summary, Multi-Year FY, Monthly Breakdown, Top Accounts, GST Ledger, and Master Transactions.
* **CSV Export**: Clean CSV data exports with UTF-8 Byte Order Mark (`\uFEFF`) for compatibility with Microsoft Excel on Windows.

### 10. Reactive Global Currency Engine
* Dynamically switches formatting across all cards, graphs, tables, and exports:
  * **INR (Lakhs & Crores)**: Standard Indian financial format (`₹ 1.11 Cr`, `₹ 46.28 L`).
  * **INR (Full Integer)**: Full rupee precision (`₹ 1,11,47,783.66`).
  * **USD ($)**: Converted with active FX index.
  * **EUR (€)**: European currency format.
  * **GBP (£)**: British pound format.
* Persisted in `localStorage` across user sessions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18 (TypeScript 5.7) |
| **Bundler & Dev Server** | Vite 6.0 |
| **Styling & Design System** | Tailwind CSS 3.4, Custom Design Tokens (`tokens.css`) |
| **Data Visualizations** | Recharts 2.15 |
| **Icons & Badges** | Lucide React |
| **Excel & Spreadsheet Engine** | SheetJS (`xlsx` 0.18.5) |
| **PDF Generation Engine** | `html2canvas` 1.4.1, `jspdf` 2.5.2, `jspdf-autotable` 3.8.4 |
| **State Management** | React Context API with typed reactive dispatch & `localStorage` caching |

---

## 🚢 Deploying to Vercel

The project is pre-configured for **zero-configuration deployment on Vercel**.

### Method 1: Deploy via Vercel Web Dashboard (Recommended)
1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Vercel automatically detects the Vite framework and applies the settings from [vercel.json](file:///d:/pbl/Apps/JS/vercel.json):
   * **Framework Preset**: `Vite`
   * **Build Command**: `pnpm run build`
   * **Output Directory**: `dist`
5. Click **Deploy**. Your BI application will be live on an HTTPS domain within 60 seconds!

### Method 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Log in to your Vercel account
vercel login

# Deploy to preview
vercel

# Deploy directly to production
vercel --prod
```

### Vercel Configuration Highlights (`vercel.json`)
* **SPA Routing Fallback**: All client-side routes route through `/index.html` preventing 404 errors on refresh.
* **Immutable Static Asset Caching**: Optimized headers for files in `/assets/` (`public, max-age=31536000, immutable`).

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **pnpm**: v8.0.0 or higher (or npm / yarn)

### Installation
```bash
# 1. Clone repository
git clone <your-repo-url>
cd JS

# 2. Install dependencies
pnpm install

# 3. Start live development server
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build and Preview
```bash
# Run TypeScript type check and compile production bundle
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## 📑 Excel Data Dictionary (`Sale` Sheet)

When uploading custom or updated sales ledgers (`.xlsx`, `.xls`, `.csv`), the workbook should contain a sheet named `Sale` (or placed as the first sheet) with the following structure:

| Column Name | Data Type | Sample Value | Purpose & Accounting Rule |
| :--- | :--- | :--- | :--- |
| `Month` | Text | `Apr`, `May`, `Dec` | Fiscal month name |
| `Financial Year` | Text | `2024-25`, `2025-26` | Indian financial year (April–March) |
| `FY Month No` | Integer | `1` (Apr) to `12` (Mar) | Chronological fiscal sequencing |
| `Date` | Date / Serial | `2024-04-15` | Commercial invoice billing date |
| `Invoice Number` | Text | `24-25/102` | Unique invoice sequence identifier |
| `Party Name` | Text | `PS Auto Systems And Services` | Corporate buyer / client name |
| `GST number` | Text | `27BXWPS4483D1ZQ` | 15-character GSTIN identifier |
| `Taxable Value` | Decimal | `45000.00` | Net business turnover (excludes GST) |
| `IGST` | Decimal | `0.00` | Integrated GST (Inter-State) |
| `CGST` | Decimal | `4050.00` | Central GST (9% Intra-State) |
| `SGST` | Decimal | `4050.00` | State GST (9% Intra-State) |
| `Total Invoice Value` | Decimal | `53100.00` | Gross billed value (`Taxable + IGST + CGST + SGST`) |

---

## 🔒 Confidentiality & Accounting Adherence
* **Taxable Value Revenue Measure**: In strict accordance with Indian Accounting Standards (Ind AS 115) and statutory GST rules, GST is a pass-through indirect tax collected on behalf of the government and is not recognized as business revenue.
* **GSTIN Privacy**: Customer GSTIN identifiers can be masked on screen to safeguard client tax credentials during presentations.
* **Audit Trail**: Every automated observation and metric is 100% deterministic, computed mathematically from the loaded dataset with zero simulated or fabricated figures.

---

**Developed for Gran Asia Life Sciences LLP, Pune**  
*Business Intelligence, Revenue Analytics & Executive Decision Support System*
