import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import initialDataJson from '../data/initialSalesData.json';
import {
  SaleRecord,
  FilterState,
  KPIMetrics,
  MonthlyRevenueData,
  FinancialYearData,
  CustomerSummary,
  SegmentationConfig,
  AutomatedInsight
} from '../types/sales';
import {
  filterTransactions,
  computeKPIMetrics,
  computeMonthlyData,
  computeFinancialYearData,
  computeCustomerSummaries,
  computeQuarterlyData,
  computeHeatmapMatrix,
  generateAutomatedInsights,
  DEFAULT_SEGMENTATION
} from '../services/analyticsEngine';
import {
  CurrencyFormatType,
  setGlobalCurrencyFormat,
  getGlobalCurrencyFormat
} from '../utils/formatters';

const STORAGE_KEY = 'gran_asia_sales_records_v1';
const FILTER_STORAGE_KEY = 'gran_asia_sales_filters_v1';
const SEGMENTATION_STORAGE_KEY = 'gran_asia_segmentation_v1';

const INITIAL_FILTERS: FilterState = {
  financialYear: 'ALL',
  selectedMonths: [],
  startDate: '',
  endDate: '',
  customerName: 'ALL',
  searchQuery: ''
};

interface SalesDataContextType {
  records: SaleRecord[];
  filteredRecords: SaleRecord[];
  filters: FilterState;
  setFilters: (update: Partial<FilterState> | ((prev: FilterState) => FilterState)) => void;
  resetFilters: () => void;
  kpiMetrics: KPIMetrics;
  monthlyData: MonthlyRevenueData[];
  financialYearData: FinancialYearData[];
  customerSummaries: CustomerSummary[];
  quarterlyData: ReturnType<typeof computeQuarterlyData>;
  heatmapData: ReturnType<typeof computeHeatmapMatrix>;
  automatedInsights: AutomatedInsight[];
  segmentationConfig: SegmentationConfig;
  setSegmentationConfig: (cfg: SegmentationConfig) => void;
  availableFYs: string[];
  availableCustomers: string[];
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  importRecords: (newRecords: SaleRecord[], mode: 'replace' | 'append') => void;
  resetToDefaultData: () => void;
  isCustomData: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currencyFormat: CurrencyFormatType;
  setCurrencyFormat: (fmt: CurrencyFormatType) => void;
}

const SalesDataContext = createContext<SalesDataContextType | undefined>(undefined);

export const SalesDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial records from localStorage if present, otherwise use initialDataJson
  const [records, setRecords] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved records from localStorage, falling back to default', e);
    }
    return initialDataJson as SaleRecord[];
  });

  const [filters, setFiltersState] = useState<FilterState>(INITIAL_FILTERS);
  const [segmentationConfig, setSegmentationConfigState] = useState<SegmentationConfig>(() => {
    try {
      const saved = localStorage.getItem(SEGMENTATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SEGMENTATION;
  });

  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currencyFormat, setCurrencyFormatState] = useState<CurrencyFormatType>(() => {
    return getGlobalCurrencyFormat();
  });

  const setCurrencyFormat = (fmt: CurrencyFormatType) => {
    setGlobalCurrencyFormat(fmt);
    setCurrencyFormatState(fmt);
  };

  const isCustomData = useMemo(() => {
    return records.length !== (initialDataJson as SaleRecord[]).length;
  }, [records]);

  // Persist records
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [records]);

  // Available Filter Options
  const availableFYs = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.financialYear) set.add(r.financialYear);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableCustomers = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.partyName) set.add(r.partyName);
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered transactions
  const filteredRecords = useMemo(() => {
    return filterTransactions(records, filters);
  }, [records, filters]);

  // Analytics Computations
  const kpiMetrics = useMemo(() => {
    return computeKPIMetrics(filteredRecords, records, filters.financialYear);
  }, [filteredRecords, records, filters.financialYear]);

  const monthlyData = useMemo(() => {
    return computeMonthlyData(filteredRecords);
  }, [filteredRecords]);

  const financialYearData = useMemo(() => {
    // If filtered by specific FY, we compute FY breakdown on all records so comparison stays visible,
    // or on filtered records. For standard BI, FY comparison is best shown across all available years in dataset.
    return computeFinancialYearData(records);
  }, [records]);

  const customerSummaries = useMemo(() => {
    return computeCustomerSummaries(filteredRecords, segmentationConfig);
  }, [filteredRecords, segmentationConfig]);

  const quarterlyData = useMemo(() => {
    return computeQuarterlyData(filteredRecords);
  }, [filteredRecords]);

  const heatmapData = useMemo(() => {
    return computeHeatmapMatrix(records);
  }, [records]);

  const automatedInsights = useMemo(() => {
    return generateAutomatedInsights(
      filteredRecords,
      records,
      kpiMetrics,
      financialYearData,
      customerSummaries,
      monthlyData
    );
  }, [filteredRecords, records, kpiMetrics, financialYearData, customerSummaries, monthlyData]);

  // Filter setters
  const setFilters = (update: Partial<FilterState> | ((prev: FilterState) => FilterState)) => {
    setFiltersState(prev => {
      if (typeof update === 'function') {
        return update(prev);
      }
      return { ...prev, ...update };
    });
  };

  const resetFilters = () => {
    setFiltersState(INITIAL_FILTERS);
  };

  const setSegmentationConfig = (cfg: SegmentationConfig) => {
    setSegmentationConfigState(cfg);
    try {
      localStorage.setItem(SEGMENTATION_STORAGE_KEY, JSON.stringify(cfg));
    } catch {}
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(prev => !prev);
  };

  const importRecords = (newRecords: SaleRecord[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setRecords(newRecords);
    } else {
      setRecords(prev => [...prev, ...newRecords]);
    }
  };

  const resetToDefaultData = () => {
    const defaultData = initialDataJson as SaleRecord[];
    setRecords(defaultData);
    setFiltersState(INITIAL_FILTERS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SalesDataContext.Provider
      value={{
        records,
        filteredRecords,
        filters,
        setFilters,
        resetFilters,
        kpiMetrics,
        monthlyData,
        financialYearData,
        customerSummaries,
        quarterlyData,
        heatmapData,
        automatedInsights,
        segmentationConfig,
        setSegmentationConfig,
        availableFYs,
        availableCustomers,
        isPresentationMode,
        togglePresentationMode,
        importRecords,
        resetToDefaultData,
        isCustomData,
        activeTab,
        setActiveTab,
        currencyFormat,
        setCurrencyFormat
      }}
    >
      {children}
    </SalesDataContext.Provider>
  );
};

export function useSalesData(): SalesDataContextType {
  const context = useContext(SalesDataContext);
  if (!context) {
    throw new Error('useSalesData must be used within a SalesDataProvider');
  }
  return context;
}
