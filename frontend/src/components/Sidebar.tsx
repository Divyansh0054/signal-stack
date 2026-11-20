import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Sparkles,
  Layers,
  Radio,
  Rss,
  FileText,
  UploadCloud,
  Cpu,
  PlusCircle,
  ShieldCheck,
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

interface NavGroup {
  group: string;
  items: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  interviewCompleted,
}) => {
  const groups: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'profile', label: 'Company Profile', icon: UserCheck },
        {
          id: 'interview',
          label: 'AI Interview',
          icon: Sparkles,
          badge: interviewCompleted ? 'Complete' : '10 Qs',
        },
        { id: 'signal_stack', label: 'Signal Stack', icon: Layers },
        { id: 'feed', label: 'Intelligence Feed', icon: Rss },
      ],
    },
    {
      group: 'SOURCES',
      items: [
        { id: 'sources', label: 'Source Manager', icon: Radio },
        { id: 'documents', label: 'Internal Documents', icon: UploadCloud },
      ],
    },
    {
      group: 'REPORTING',
      items: [
        { id: 'brief', label: 'Monday Brief', icon: FileText },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'automation', label: 'Automation & Health', icon: Cpu },
        { id: 'setup', label: 'Target Onboarding', icon: PlusCircle },
      ],
    },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col justify-between py-5 shrink-0 min-h-[calc(100vh-3.5rem)]">
      <div className="px-3 space-y-5">
        {groups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {grp.group}
            </div>
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200/80 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        interviewCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="px-4 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Engine</span>
          </span>
          <span className="font-medium text-slate-700">NLP (Zero-Cost)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Operating Cost</span>
          <span className="font-medium text-emerald-600">$0.00 / Free Tier</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span>EDXSO AI Intern v1.0</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-slate-400" />
            <span>Verified</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
