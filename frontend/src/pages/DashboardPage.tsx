import React from 'react';
import { Company, IntelligenceSignal, Brief, Source } from '../types';
import {
  ShieldAlert,
  TrendingUp,
  Radio,
  FileText,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Clock,
  Sparkles,
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
  if (!company) {
    return (
      <div className="p-12 text-center text-slate-400">
        Please select or create a company to view the dashboard.
      </div>
    );
  }

  const latestBrief = briefs.length > 0 ? briefs[0] : null;
  const criticalSignals = signals.filter((s) => s.overall_priority === 'CRITICAL' || s.overall_priority === 'HIGH');
  const oppCount = signals.filter((s) => s.opportunity_threat === 'OPPORTUNITY').length;
  const threatCount = signals.filter((s) => s.opportunity_threat === 'THREAT').length;
  const healthySources = sources.filter((s) => s.health_status === 'HEALTHY').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome / Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE INTELLIGENCE TARGET</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{company.name}</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {company.industry || 'Multi-vertical Enterprise'} •{' '}
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                {company.website} <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            {company.current_focus && (
              <p className="text-xs text-slate-300 mt-2 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700/60 inline-block">
                <strong className="text-emerald-400">Strategic Focus:</strong> {company.current_focus}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('brief')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>View Latest Brief</span>
            </button>
            <button
              onClick={onGenerateBrief}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Synthesize Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical / High Signals</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{criticalSignals.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {signals.length} total signals evaluated
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Opportunities Identified</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{oppCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Actionable strategic tailwinds
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Identified Risks & Threats</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{threatCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Regulatory & competitive threats
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Signal Stack Sources</span>
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{sources.length}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
            {healthySources} Healthy / Monitored
          </span>
        </div>
      </div>

      {/* Grid: Latest Monday Brief Teaser & High Priority Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: High Priority Intelligence Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">High Priority Signals</h3>
              <p className="text-xs text-slate-400">
                Ranked by relevance, business impact, and evidence reliability
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('feed')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All ({signals.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {signals.slice(0, 4).map((sig) => (
              <div
                key={sig.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-4 rounded-xl transition-all space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
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
                    <span className="text-xs text-slate-400 font-medium">• {sig.category}</span>
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
                  </div>

                  <a
                    href={sig.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <h4 className="text-sm font-semibold text-white leading-snug">{sig.title}</h4>

                {/* Evidence snippet box */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 font-mono">
                  <span className="text-emerald-400 font-sans font-semibold mr-1">Evidence:</span>
                  "{sig.evidence_snippet}"
                </div>

                {/* Interpretation */}
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-200">Why It Matters:</strong> {sig.why_it_matters}
                </p>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
                  <span>
                    Source: <strong className="text-slate-300">{sig.source_name}</strong>
                  </span>
                  <span>{sig.affected_business_area}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Latest Brief Spotlight */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Latest Executive Brief</h3>
            <button
              onClick={() => onNavigateTab('brief')}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              History
            </button>
          </div>

          {latestBrief ? (
            <div className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Monday Morning Brief
                </span>
                <h4 className="text-sm font-bold text-white mt-2 leading-tight">{latestBrief.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(latestBrief.generated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Executive Summary Top Items */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="text-xs font-semibold text-slate-300">Top Strategic Takeaways:</div>
                {latestBrief.executive_summary?.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="font-semibold text-slate-200">{item.title}</div>
                    <div className="text-slate-400 mt-1">{item.why_it_matters}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigateTab('brief')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <span>Read Full 10-Section Brief</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No executive brief generated yet.</p>
              <button
                onClick={onGenerateBrief}
                className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500"
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
