import React, { useState, useEffect } from 'react';
import flagsmith from '@flagsmith/flagsmith';
import { FlagsmithProvider } from '@flagsmith/flagsmith/react';
import { SalesDataProvider, useSalesData } from './context/SalesDataContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FilterBar } from './components/layout/FilterBar';

import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { SalesAnalytics } from './components/sales/SalesAnalytics';
import { RevenueGrowth } from './components/growth/RevenueGrowth';
import { CustomerAnalytics } from './components/customers/CustomerAnalytics';
import { TransactionExplorer } from './components/transactions/TransactionExplorer';
import { BusinessInsights } from './components/insights/BusinessInsights';
import { ReportsExport } from './components/reports/ReportsExport';
import { DataManagement } from './components/data-management/DataManagement';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { activeTab, isPresentationMode, togglePresentationMode } = useSalesData();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'sales':
        return <SalesAnalytics />;
      case 'growth':
        return <RevenueGrowth />;
      case 'customers':
        return <CustomerAnalytics />;
      case 'transactions':
        return <TransactionExplorer />;
      case 'insights':
        return <BusinessInsights />;
      case 'reports':
        return <ReportsExport />;
      case 'data-management':
        return <DataManagement />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="w-full h-screen min-h-screen bg-white text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* 1. Full-Width Top Header */}
      <Header />

      {/* 2. Full-Width Global Filter Strip */}
      <FilterBar />

      {/* 3. Kiosk Mode Notice Banner */}
      {isPresentationMode && (
        <div className="bg-[var(--color-brand)] text-white px-6 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-xs">
          <span>Power BI Kiosk Presentation Mode Active</span>
          <button
            onClick={togglePresentationMode}
            className="px-3 py-0.5 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 text-[11px] transition-colors"
          >
            Exit Presentation
          </button>
        </div>
      )}

      {/* 4. Full-Height Side-by-Side Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Full-Page Main Canvas */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7 xl:p-8 bg-[var(--color-surface-muted)]">
          <div className="w-full max-w-none">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  useEffect(() => {
    try {
      let visitorId = localStorage.getItem('gran_asia_flagsmith_id');
      if (!visitorId) {
        visitorId = 'user_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('gran_asia_flagsmith_id', visitorId);
      }
      flagsmith.identify(visitorId).catch(() => {});
    } catch {
      // LocalStorage or network offline safeguard
    }
  }, []);

  return (
    <FlagsmithProvider
      options={{
        environmentID: 'BkR49oVbZamUfEftPsigVb',
        enableEvents: true,
        defaultFlags: {
          show_demo_button: { enabled: false, value: 'control' }
        }
      }}
      flagsmith={flagsmith}
    >
      <SalesDataProvider>
        <MainLayout />
      </SalesDataProvider>
    </FlagsmithProvider>
  );
};

export default App;
