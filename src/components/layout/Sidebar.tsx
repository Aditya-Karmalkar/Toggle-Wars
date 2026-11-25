import React from 'react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Users,
  ReceiptText,
  Lightbulb,
  FileSpreadsheet,
  Database,
  Settings,
  ChevronRight,
  ChevronsUpDown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, automatedInsights, isPresentationMode } = useSalesData();

  if (isPresentationMode) {
    return null;
  }

  const mainNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'sales', label: 'Analytics', icon: TrendingUp },
    { id: 'growth', label: 'Revenue Growth', icon: BarChart3 },
    { id: 'transactions', label: 'Invoices & Orders', icon: ReceiptText },
    { id: 'customers', label: 'Customers', icon: Users },
    {
      id: 'insights',
      label: 'Business Insights',
      icon: Sparkles,
      badge: automatedInsights.length.toString(),
      badgeColor: 'bg-brand-50 text-brand-700'
    },
  ];

  const managementNavItems = [
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'data-management', label: 'Data Management', icon: Database },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-white text-slate-700 flex flex-col shrink-0 transition-colors select-none z-20 border-r border-slate-100 ${
        collapsed ? 'w-20' : 'w-[230px]'
      }`}
    >
      {/* 1. Brand Widget */}
      {/* <div className="p-4 flex items-center justify-between border-b border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
              GA
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Gran Asia
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                Life Sciences LLP
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 ml-auto" />
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            GA
          </div>
        )}
      </div> */}

      {/* 2. Navigation Section */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Main Group */}
        <div>
          {!collapsed && (
            <div className="text-xs font-semibold text-slate-400 px-3 mb-2">
              Main
            </div>
          )}
          <nav className="space-y-1">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors relative group focus-visible:ring-1 focus-visible:ring-brand-500 ${
                    isActive
                      ? 'bg-slate-50 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-500 rounded-r-full" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}

                  {!collapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Management & Channels Group */}
        <div>
          {!collapsed && (
            <div className="text-xs font-semibold text-slate-400 px-3 mb-2">
              Management
            </div>
          )}
          <nav className="space-y-1">
            {managementNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors relative group focus-visible:ring-1 focus-visible:ring-brand-500 ${
                    isActive
                      ? 'bg-slate-50 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-500 rounded-r-full" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}

                  {!collapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Settings */}
        <div>
          {!collapsed && (
            <div className="text-xs font-semibold text-slate-400 px-3 mb-2">
              Preferences
            </div>
          )}
          <nav className="space-y-1">
            {bottomNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors relative group focus-visible:ring-1 focus-visible:ring-brand-500 ${
                    isActive
                      ? 'bg-slate-50 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-500 rounded-r-full" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. User Profile Card at Bottom */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100">
          <div className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                OJT
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 truncate">OJT</span>
                <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black">
                  ✓
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate"></div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      )}
    </aside>
  );
};
