import React from 'react';
import { Company } from '../types';
import { Building2, Sparkles, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';

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
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-sm shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
            SIGNAL STACK
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase">
              Autonomous
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Company Intelligence & Executive Briefing Engine</p>
        </div>
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Company Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-medium">Active Company:</span>
          <select
            value={selectedCompany?.id || ''}
            onChange={(e) => {
              const comp = companies.find((c) => c.id === e.target.value);
              if (comp) onSelectCompany(comp);
            }}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name} ({c.industry ? c.industry.split('/')[0].trim() : 'Tech'})
              </option>
            ))}
          </select>
        </div>

        {/* New Company Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Company</span>
        </button>

        {/* Live Crawl Button */}
        <button
          onClick={onTriggerCrawl}
          disabled={isCrawling || !selectedCompany}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all ${
            isCrawling
              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
          <span>{isCrawling ? 'Crawling Sources...' : 'Monitor Now'}</span>
        </button>
      </div>
    </header>
  );
};
