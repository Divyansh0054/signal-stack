import React, { useState } from 'react';
import { Company } from '../types';
import { Building2, Globe, Sparkles, CheckCircle2, ArrowRight, Target, ShieldCheck } from 'lucide-react';

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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/companies`, {
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
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Target Onboarding</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Company Setup & Intelligence Initialization
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide any company name and public website. The engine autonomously performs live website crawling, extracts verified facts, constructs an adaptive 10-question interview, and discovers 20+ sources.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 p-8 rounded-2xl shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 text-xs">Company Name *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MeetUniversity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 text-xs">Company Website URL *</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="https://www.meetuniversity.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                Current Strategic Focus (Optional)
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Focus on B2B university partnerships & institutional licensing"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !name.trim() || !website.trim()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isLoading
                    ? 'Crawling Website & Initializing Intelligence...'
                    : 'Initialize Target Intelligence'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Target Directory Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Target Directory</h3>
            <div className="space-y-2">
              {companies.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCompany(c)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedCompany?.id === c.id
                      ? 'bg-slate-100 border-slate-300 font-semibold text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/60'
                  }`}
                >
                  <div>
                    <div className="text-slate-900 font-semibold">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">
                      {c.website}
                    </div>
                  </div>
                  {selectedCompany?.id === c.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strict Unseen-Company Support</span>
            </div>
            <p className="leading-relaxed">
              The engine operates fully dynamically. Enter any valid public web domain to generate real intelligence profiles, questions, and sources without pre-configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
