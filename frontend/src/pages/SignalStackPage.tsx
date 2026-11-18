import React, { useState, useEffect } from 'react';
import { Company, Competitor, Source } from '../types';
import { apiClient } from '../api/client';
import {
  Users,
  Swords,
  TrendingUp,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface SignalStackPageProps {
  company: Company | null;
}

export const SignalStackPage: React.FC<SignalStackPageProps> = ({ company }) => {
  const [activeCategory, setActiveCategory] = useState<'Customers' | 'Competitors' | 'Market' | 'Internal'>('Customers');
  const [sources, setSources] = useState<Source[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!company) return;
    setIsLoading(true);
    try {
      const [srcData, compData] = await Promise.all([
        apiClient.getSources(company.id),
        apiClient.getCompetitors(company.id),
      ]);
      setSources(srcData);
      setCompetitors(compData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  if (!company) {
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
  }

  const categorySources = sources.filter((s) => s.category === activeCategory);

  const categories = [
    { id: 'Customers' as const, label: 'Customers', icon: Users, desc: 'Forums, communities, recurring complaints, unmet needs, & customer sentiment' },
    { id: 'Competitors' as const, label: 'Competitors', icon: Swords, desc: '5-10 discovered competitors, product launches, pricing, & why they matter' },
    { id: 'Market' as const, label: 'Market', icon: TrendingUp, desc: 'Regulatory authorities, policy changes, industry benchmarks, & macro shifts' },
    { id: 'Internal' as const, label: 'Internal', icon: FileText, desc: 'Confidential CRM logs, customer objections, lost-deal reasons, & product feedback' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
          <span>Continuous Intelligence Architecture</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Company Signal Stack</h2>
        <p className="text-sm text-slate-400 mt-1">
          Customized monitoring architecture for {company.name}. Every single source has an explicit business justification answering: <strong className="text-slate-200">"Why are we monitoring this source?"</strong>
        </p>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          const count = sources.filter((s) => s.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                  {cat.id === 'Competitors' ? `${competitors.length} Comps` : `${count} Sources`}
                </span>
              </div>
              <div className="font-semibold text-sm text-white mt-2">{cat.label}</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-tight line-clamp-2">{cat.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Competitors List (Only shown when Competitors tab is active) */}
      {activeCategory === 'Competitors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-emerald-400" />
              <span>Discovered Competitors & Market Substitutes ({competitors.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Dynamically extracted via research</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitors.map((comp) => (
              <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{comp.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                      {comp.competitor_type} Competitor
                    </span>
                  </div>
                  {comp.website && (
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Website</span> <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-300">{comp.offering_summary}</p>

                {/* Why It Matters Callout */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300">
                  <strong className="text-emerald-400 font-sans block mb-0.5">Why this competitor matters:</strong>
                  {comp.why_it_matters}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitored Sources in Category with Explicit Justifications */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          Monitored {activeCategory} Sources ({categorySources.length})
        </h3>

        <div className="space-y-3">
          {categorySources.map((source) => (
            <div
              key={source.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4.5 space-y-3 transition-all shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      source.health_status === 'HEALTHY'
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'bg-rose-400'
                    }`}
                  />
                  <h4 className="font-bold text-sm text-white">{source.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {source.source_type}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    Relevance: {source.relevance_score.toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400 font-mono">Check: {source.expected_frequency}</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-xs"
                  >
                    <span>Inspect Feed / URL</span> <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Explicit Justification Callout */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300">
                <strong className="text-cyan-400 font-sans mr-1">Reason for Inclusion:</strong>
                {source.reason_for_inclusion}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>
                  Credibility: <strong className="text-slate-300">{source.credibility_rating}</strong>
                </span>
                <span>
                  Health: <strong className="text-emerald-400">{source.health_status}</strong>
                </span>
                <span>
                  Duplicates Blocked: <strong className="text-slate-300">{source.duplicate_count}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
