import React, { useState } from 'react';
import { Company, IntelligenceSignal, Brief, Source } from '../types';
import {
  ExternalLink,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Radio,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  company: Company | null;
  signals: IntelligenceSignal[];
  briefs: Brief[];
  sources: Source[];
  onNavigateTab: (tab: any) => void;
  onGenerateBrief: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  company,
  signals,
  briefs,
  sources,
  onNavigateTab,
  onGenerateBrief,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedSignals, setExpandedSignals] = useState<Record<string, boolean>>({});

  if (!company) {
    return (
      <div className="p-16 text-center text-slate-500 max-w-md mx-auto">
        <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">No Target Company Selected</h3>
        <p className="text-sm text-slate-500 mt-1">
          Select an existing company from the header dropdown or initialize a new company profile.
        </p>
      </div>
    );
  }

  const latestBrief = briefs.length > 0 ? briefs[0] : null;
  const criticalSignals = signals.filter(
    (s) => s.overall_priority === 'CRITICAL' || s.overall_priority === 'HIGH'
  );
  const oppCount = signals.filter((s) => s.opportunity_threat === 'OPPORTUNITY').length;
  const threatCount = signals.filter((s) => s.opportunity_threat === 'THREAT').length;
  const healthySources = sources.filter((s) => s.health_status === 'HEALTHY').length;

  const toggleEvidence = (id: string) => {
    setExpandedSignals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSignals = signals.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Dashboard Hero Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name}</h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {company.industry || 'Enterprise SaaS'}
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition-colors"
              >
                <span>{company.website.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {company.current_focus ? (
              <p className="text-sm text-slate-600 flex items-center gap-1.5 pt-0.5">
                <span className="font-semibold text-slate-800">Strategic Focus:</span>
                <span>{company.current_focus}</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Continuous autonomous monitoring active across customer, competitor, and market vectors.
              </p>
            )}
          </div>

          {/* Direct Hero Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('brief')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Brief</span>
            </button>
            <button
              onClick={() => onNavigateTab('sources')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all shadow-xs flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-slate-500" />
              <span>Monitor Sources</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Critical Signals
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{criticalSignals.length}</div>
          <p className="text-xs text-slate-500 mt-1">
            ↑ {signals.length} total signals evaluated
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Opportunities
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{oppCount}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            Actionable strategic tailwinds
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Risks & Threats
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{threatCount}</div>
          <p className="text-xs text-amber-600 font-medium mt-1">
            Requires executive attention
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monitored Sources
            </span>
            <Radio className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{sources.length}</div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-emerald-600">{healthySources}</span> healthy endpoints
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Intelligence Feed + Latest Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Intelligence Overview */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Intelligence Overview</h3>
              <p className="text-xs text-slate-500">
                Prioritized signals separated into factual evidence, strategic interpretation, and recommended actions.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'Customers', 'Competitors', 'Market', 'Internal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Intelligence Signals List */}
          <div className="space-y-4">
            {filteredSignals.slice(0, 5).map((sig, idx) => {
              const isExpanded = !!expandedSignals[sig.id];
              return (
                <div
                  key={sig.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-400 font-mono">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
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
                    </div>

                    <div className="text-xs text-slate-400">
                      <span>{sig.source_name}</span>
                      {sig.publication_date && (
                        <span> · {new Date(sig.publication_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-semibold text-slate-900 leading-snug">
                    {sig.title}
                  </h4>

                  {/* 3-Layer Information Model */}
                  <div className="space-y-2 text-sm text-slate-600 pt-1">
                    {/* Layer 1: What happened */}
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-24 pt-0.5">
                        Development
                      </span>
                      <p className="text-slate-700 leading-relaxed">{sig.summary}</p>
                    </div>

                    {/* Layer 2: Why it matters */}
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-24 pt-0.5">
                        Why It Matters
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {sig.why_it_matters}
                      </p>
                    </div>

                    {/* Layer 3: Recommended action */}
                    {sig.recommended_action && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider shrink-0 w-24 pt-0.5">
                          Action
                        </span>
                        <p className="text-slate-700 bg-emerald-50/50 border border-emerald-100 rounded-lg px-2.5 py-1 text-xs leading-relaxed flex-1">
                          {sig.recommended_action}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expandable Evidence Toggle */}
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

                  {/* Expanded Evidence Drawer */}
                  {isExpanded && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-600 font-sans animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">Original Source:</span>
                          <span className="text-slate-600">{sig.source_name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                          {sig.verification_status}
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-slate-700 font-mono text-[11px] leading-relaxed">
                        <span className="font-sans font-semibold text-slate-900 block mb-1">
                          Crawled Verbatim Snippet:
                        </span>
                        "{sig.evidence_snippet}"
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400 text-[11px]">
                          Reliability: {sig.source_reliability} · Scoring: {sig.ranking_explanation}
                        </span>
                        <a
                          href={sig.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
                        >
                          <span>Open Direct URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredSignals.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                No signals found for category: {selectedCategory}
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigateTab('feed')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All {signals.length} Signals in Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Latest Executive Brief Spotlight */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Latest Executive Brief</h3>
            <button
              onClick={() => onNavigateTab('brief')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Full Brief
            </button>
          </div>

          {latestBrief ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  Monday Morning Brief
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {latestBrief.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Generated {new Date(latestBrief.generated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Top 3 Strategic Takeaways */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Top 3 Strategic Takeaways:
                </div>
                {latestBrief.executive_summary?.slice(0, 3).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="text-xs font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                      {item.why_it_matters}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigateTab('brief')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Open Full 10-Section Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800">No Executive Brief Generated</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Synthesize monitored intelligence across approved sources into the official Monday Morning Brief.
              </p>
              <button
                onClick={onGenerateBrief}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Generate First Brief
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
