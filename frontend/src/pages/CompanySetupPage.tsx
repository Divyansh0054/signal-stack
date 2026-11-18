import React, { useState } from 'react';
import { Company } from '../types';
import { Building2, Globe, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface CompanySetupPageProps {
  onCompanyCreated: (company: Company) => void;
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

export const CompanySetupPage: React.FC<CompanySetupPageProps> = ({
  onCompanyCreated,
  companies,
  selectedCompany,
  onSelectCompany,
}) => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [focus, setFocus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let formattedUrl = website.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          website: formattedUrl,
          current_focus: focus.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create company.');
      }

      const newCompany: Company = await res.json();
      onCompanyCreated(newCompany);
      setName('');
      setWebsite('');
      setFocus('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during company creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Company Setup & Intelligence Initialization</h2>
        <p className="text-sm text-slate-400 mt-1">
          Provide any target company name and website URL. The engine performs real website crawling, extracts verified facts, constructs an adaptive 10-question interview, and discovers 20+ category sources automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MeetUniversity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Website URL *</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="https://www.meetuniversity.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Safe SSRF filtering prevents access to private or internal loopback IP networks.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Strategic Focus / Commercial Priority <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Focus on student acquisition and university counseling, or expanding B2B institutional partnerships."
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-xs font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Crawling & Profiling Company...' : 'Initialize Intelligence Stack'}</span>
            </button>
          </form>
        </div>

        {/* Right Col: Active & Switcher */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Configured Demonstrations</h3>
          <div className="space-y-2">
            {companies.map((c) => {
              const isSelected = selectedCompany?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCompany(c)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{c.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{c.website}</div>
                  <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center justify-between">
                    <span>{c.industry ? c.industry.split('/')[0].trim() : 'Tech'}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
