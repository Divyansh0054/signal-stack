import React, { useState, useEffect } from 'react';
import { Company, IntelligenceSignal } from '../types';
import { apiClient } from '../api/client';
import {
  Rss,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface IntelligenceFeedPageProps {
  company: Company | null;
}

export const IntelligenceFeedPage: React.FC<IntelligenceFeedPageProps> = ({ company }) => {
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [expandedSignals, setExpandedSignals] = useState<Record<string, boolean>>({});

  // Filters
  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [oppThreat, setOppThreat] = useState<string>('');
  const [verification, setVerification] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchSignals = async () => {
    if (!company) return;
    setIsLoading(true);
    try {
      const data = await apiClient.getSignals(company.id, {
        category: category || undefined,
        priority: priority || undefined,
        opportunity_threat: oppThreat || undefined,
        verification_status: verification || undefined,
        search: search.trim() || undefined,
      });
      setSignals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [company?.id, category, priority, oppThreat, verification]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSignals();
  };

  const toggleEvidence = (id: string) => {
    setExpandedSignals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!company) {
    return <div className="p-16 text-center text-slate-500">Please select a company to view the intelligence feed.</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Rss className="w-3.5 h-3.5 text-slate-400" />
          <span>Real-Time Stream</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Intelligence Feed</h2>
        <p className="text-sm text-slate-600 mt-1">
          Every signal strictly separates <strong className="text-slate-900 font-semibold">Factual Evidence</strong> (crawled ground truth) from <strong className="text-slate-900 font-semibold">Strategic Interpretation</strong> (business implications & recommended actions).
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl space-y-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, impact area, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-500">Filter:</span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Customers">Customers</option>
            <option value="Competitors">Competitors</option>
            <option value="Market">Market</option>
            <option value="Internal">Internal</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={oppThreat}
            onChange={(e) => setOppThreat(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">Opportunity / Threat</option>
            <option value="OPPORTUNITY">Opportunity Only</option>
            <option value="THREAT">Threat Only</option>
            <option value="NEUTRAL">Neutral Only</option>
          </select>

          <select
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">All Verification</option>
            <option value="OFFICIAL">Official Disclosures</option>
            <option value="VERIFIED">Verified Ground Truth</option>
          </select>

          <div className="ml-auto text-slate-500 text-xs">
            Showing <strong className="text-slate-900 font-semibold">{signals.length}</strong> signals
          </div>
        </div>
      </div>

      {/* Signals Stream */}
      <div className="space-y-4">
        {signals.map((sig) => {
          const isExpanded = !!expandedSignals[sig.id];
          return (
            <div
              key={sig.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Top Meta Line */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase ${
                      sig.overall_priority === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : sig.overall_priority === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {sig.overall_priority}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">· {sig.category}</span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      sig.opportunity_threat === 'OPPORTUNITY'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sig.opportunity_threat === 'THREAT'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {sig.opportunity_threat}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-mono">
                    {sig.verification_status}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-600 font-medium">{sig.source_name}</span>
                  {sig.publication_date && (
                    <span> · {new Date(sig.publication_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-slate-900 leading-snug">
                {sig.title}
              </h3>

              {/* 3-Layer Information Model */}
              <div className="space-y-2 text-sm text-slate-600 pt-0.5">
                {/* Layer 1: What happened */}
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-24 pt-0.5">
                    Development
                  </span>
                  <p className="text-slate-700 leading-relaxed">{sig.summary}</p>
                </div>

                {/* Layer 2: Why it matters */}
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-24 pt-0.5">
                    Implication
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {sig.why_it_matters}
                  </p>
                </div>

                {/* Layer 3: Action */}
                {sig.recommended_action && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider shrink-0 w-24 pt-0.5">
                      Action
                    </span>
                    <p className="text-slate-700 bg-emerald-50/50 border border-emerald-100 rounded-lg px-2.5 py-1 text-xs leading-relaxed flex-1">
                      {sig.recommended_action}
                    </p>
                  </div>
                )}
              </div>

              {/* Expandable Evidence Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleEvidence(sig.id)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Source Evidence</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>View Source Evidence</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Impact Score:</span>
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {sig.ranking_score.toFixed(0)}/100
                  </span>
                </div>
              </div>

              {/* Expandable Evidence Drawer */}
              {isExpanded && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-600 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Source Endpoint:</span>
                      <span className="text-slate-600">{sig.source_name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                      Status: {sig.verification_status}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-slate-700 font-mono text-[11px] leading-relaxed">
                    <span className="font-sans font-semibold text-slate-900 block mb-1">
                      Crawled Verbatim Snippet:
                    </span>
                    "{sig.evidence_snippet}"
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400" />
                      <span>{sig.ranking_explanation}</span>
                    </span>
                    <a
                      href={sig.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
                    >
                      <span>Direct Citation URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {signals.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-2 text-slate-500">
            <Rss className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-base font-semibold text-slate-800">No Signals Match Filter</h4>
            <p className="text-xs">Adjust search query or category filters to view recorded intelligence.</p>
          </div>
        )}
      </div>
    </div>
  );
};
