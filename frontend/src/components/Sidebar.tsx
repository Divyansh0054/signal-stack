import React from 'react';
import {
  LayoutDashboard,
  Building,
  UserCheck,
  Layers,
  Radio,
  Rss,
  FileText,
  UploadCloud,
  Cpu,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'setup'
  | 'profile'
  | 'interview'
  | 'signal_stack'
  | 'sources'
  | 'feed'
  | 'brief'
  | 'documents'
  | 'automation';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  interviewCompleted?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  interviewCompleted,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'setup' as TabType, label: 'Company Setup', icon: Building },
    { id: 'profile' as TabType, label: 'Intelligence Profile', icon: UserCheck },
    {
      id: 'interview' as TabType,
      label: 'Adaptive AI Interview',
      icon: Cpu,
      badge: interviewCompleted ? 'Done' : '10 Qs',
    },
    { id: 'signal_stack' as TabType, label: 'Signal Stack', icon: Layers },
    { id: 'sources' as TabType, label: 'Source Manager', icon: Radio },
    { id: 'feed' as TabType, label: 'Intelligence Feed', icon: Rss },
    { id: 'brief' as TabType, label: 'Monday Morning Brief', icon: FileText, highlight: true },
    { id: 'documents' as TabType, label: 'Internal Documents', icon: UploadCloud },
    { id: 'automation' as TabType, label: 'Automation & Health', icon: Cpu },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between py-6 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${item.highlight && !isActive ? 'hover:border-emerald-500/20' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    interviewCompleted
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-amber-950 border border-amber-800 text-amber-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-5 text-[11px] text-slate-500 space-y-1 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between">
          <span>AI Engine</span>
          <span className="text-emerald-400 font-mono">Offline / Heuristic</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Cost Status</span>
          <span className="text-slate-300 font-mono">$0.00 (Free Tier)</span>
        </div>
      </div>
    </aside>
  );
};
