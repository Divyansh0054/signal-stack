import React, { useState, useEffect } from 'react';
import { Company, IntelligenceSignal } from '../types';
import { apiClient } from '../api/client';
import {
  Rss,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

interface IntelligenceFeedPageProps {
  company: Company | null;
}

export const IntelligenceFeedPage: React.FC<IntelligenceFeedPageProps> = ({ company }) => {
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<IntelligenceSignal | null>(null);

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

  if (!company) {
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
          <Rss className="w-4 h-4" />
          <span>Continuous Signal Stream</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Intelligence Feed</h2>
        <p className="text-sm text-slate-400 mt-1">
          Every signal enforces a strict boundary between <strong className="text-white">Factual Evidence</strong> (crawled verbatim quotes) and <strong className="text-emerald-400">Strategic Interpretation</strong> (business implications & recommended actions).
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, impact area, or strategic rationale..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-950 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none text-xs"
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
            className="bg-slate-950 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none text-xs"
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
            className="bg-slate-950 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none text-xs"
          >
            <option value="">Opportunity / Threat</option>
            <option value="OPPORTUNITY">Opportunity Only</option>
            <option value="THREAT">Threat Only</option>
            <option value="NEUTRAL">Neutral</option>
          </select>

          <select
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            className="bg-slate-950 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none text-xs"
          >
            <option value="">All Verification</option>
            <option value="OFFICIAL">Official Disclosures</option>
            <option value="VERIFIED">Verified Ground Truth</option>
          </select>

          <div className="ml-auto text-slate-400 font-mono text-xs">
            Showing <strong className="text-white">{signals.length}</strong> signals
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {signals.map((sig) => (
          <div
            key={sig.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all shadow-md space-y-4"
          >
            {/* Top Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    sig.overall_priority === 'CRITICAL'
                      ? 'bg-rose-950 border border-rose-800 text-rose-300'
                      : sig.overall_priority === 'HIGH'
                      ? 'bg-amber-950 border border-amber-800 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {sig.overall_priority} ({sig.ranking_score.toFixed(0)})
                </span>
                <span className="text-xs font-semibold text-slate-300">• {sig.category}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    sig.opportunity_threat === 'OPPORTUNITY'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : sig.opportunity_threat === 'THREAT'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {sig.opportunity_threat}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-950 text-slate-400 border border-slate-800">
                  {sig.verification_status}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span className="font-mono">
                  Pub: {sig.publication_date ? new Date(sig.publication_date).toLocaleDateString() : 'Recent'}
                </span>
                <a
                  href={sig.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-xs"
                >
                  <span>{sig.source_name}</span> <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Title & Summary */}
            <div>
              <h3 className="text-base font-bold text-white leading-snug">{sig.title}</h3>
              <p className="text-xs text-slate-300 mt-1">{sig.summary}</p>
            </div>

            {/* STRICT BOUNDARY: Two-column Evidence vs Interpretation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Box 1: Ground Truth Evidence */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold uppercase">1. Raw Factual Evidence</span>
                  <span className="text-slate-500">Reliability: {sig.source_reliability}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono italic bg-slate-900/60 p-2.5 rounded border border-slate-800/60">
                  "{sig.evidence_snippet}"
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  AI confidence is never presented as proof of truth.
                </div>
              </div>

              {/* Box 2: Strategic Business Interpretation */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold uppercase">2. Strategic Interpretation</span>
                  <span className="text-slate-400">Area: {sig.affected_business_area}</span>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Why It Matters:</strong> {sig.why_it_matters}
                </p>
                <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                  <strong className="text-white">Action:</strong> {sig.recommended_action}
                </p>
              </div>
            </div>

            {/* Ranking Breakdown Callout */}
            <div className="text-[11px] text-slate-400 font-mono bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800/60 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{sig.ranking_explanation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
