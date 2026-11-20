import React from 'react';
import { Company } from '../types';
import { Building2, Plus, RefreshCw, ChevronDown, Layers } from 'lucide-react';

interface NavbarProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  onOpenCreateModal: () => void;
  onTriggerCrawl: () => void;
  isCrawling: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  onOpenCreateModal,
  onTriggerCrawl,
  isCrawling,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Platform Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
          <Layers className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm tracking-tight text-slate-900">SIGNAL STACK</h1>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Intelligence Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Autonomous Company & Market Intelligence</p>
        </div>
      </div>

      {/* Right Controls: SaaS Workspace Selector + Actions */}
      <div className="flex items-center space-x-3">
        {/* Workspace / Company Selector */}
        <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs transition-colors">
          <Building2 className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <span className="text-slate-400 mr-1.5 font-normal">Target:</span>
          <select
            value={selectedCompany?.id || ''}
            onChange={(e) => {
              const comp = companies.find((c) => c.id === e.target.value);
              if (comp) onSelectCompany(comp);
            }}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer pr-4 appearance-none text-xs"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id} className="bg-white text-slate-900 py-1">
                {c.name} {c.industry ? `· ${c.industry.split('/')[0].trim()}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2.5" />
        </div>

        {/* New Company Action */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-xs"
          title="Initialize intelligence for another company"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>New Company</span>
        </button>

        {/* Monitor / Crawl Action */}
        <button
          onClick={onTriggerCrawl}
          disabled={isCrawling || !selectedCompany}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all shadow-xs ${
            isCrawling
              ? 'bg-slate-400 cursor-not-allowed text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
          }`}
          title="Crawl all approved sources and extract new intelligence"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
          <span>{isCrawling ? 'Monitoring...' : 'Monitor Now'}</span>
        </button>
      </div>
    </header>
  );
};
