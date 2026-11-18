import React, { useState, useEffect } from 'react';
import { Company, Brief } from '../types';
import { apiClient } from '../api/client';
import {
  FileText,
  Clock,
  Printer,
  Copy,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface MondayBriefPageProps {
  company: Company | null;
}

export const MondayBriefPage: React.FC<MondayBriefPageProps> = ({ company }) => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBriefs = async () => {
    if (!company) return;
    try {
      const data = await apiClient.getBriefs(company.id);
      setBriefs(data);
      if (data.length > 0 && !selectedBrief) {
        setSelectedBrief(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBriefs();
  }, [company?.id]);

  if (!company) {
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
  }

  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    try {
      const newBrief = await apiClient.generateBrief(company.id, 7);
      setBriefs([newBrief, ...briefs]);
      setSelectedBrief(newBrief);
    } catch (err: any) {
      alert(err.message || 'Brief generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (selectedBrief?.raw_markdown) {
      navigator.clipboard.writeText(selectedBrief.raw_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleAction = async (actionId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await apiClient.updateActionStatus(actionId, nextStatus);
      await fetchBriefs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
            <FileText className="w-4 h-4" />
            <span>Executive Decision Synthesis</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Monday Morning Intelligence Brief</h2>
          <p className="text-sm text-slate-400 mt-1">
            Executive report for {company.name}. Structured across 10 mandatory sections with verifiable source links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleGenerateBrief}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all flex items-center gap-1.5 ${
              isGenerating ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Run Brief Now'}</span>
          </button>
        </div>
      </div>

      {/* Historical Briefs Selector */}
      {briefs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
          <span className="text-slate-500 uppercase tracking-wider shrink-0">Historical Briefs:</span>
          {briefs.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrief(b)}
              className={`px-3 py-1.5 rounded-lg border shrink-0 transition-colors ${
                selectedBrief?.id === b.id
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {new Date(b.generated_at).toLocaleDateString()}
            </button>
          ))}
        </div>
      )}

      {/* Main Brief Container */}
      {selectedBrief ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8 shadow-2xl print:bg-white print:text-black">
          {/* Brief Meta */}
          <div className="border-b border-slate-800 pb-6 space-y-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 uppercase font-semibold">
              Official Executive Brief
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{selectedBrief.title}</h1>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-4">
              <span>Monitoring Window: {new Date(selectedBrief.monitoring_start).toLocaleDateString()} – {new Date(selectedBrief.monitoring_end).toLocaleDateString()}</span>
              <span>• Eyes Only for Executive Leadership</span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white border-l-4 border-emerald-500 pl-3">
              1. Executive Summary (Top Developments)
            </h2>
            <div className="space-y-3">
              {selectedBrief.executive_summary?.length > 0 ? (
                selectedBrief.executive_summary.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{idx + 1}. [{item.priority}] {item.title}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">Impact Score: {item.ranking_score}/100</span>
                    </div>
                    <p className="text-xs text-slate-300"><strong className="text-slate-200">Why It Matters:</strong> {item.why_it_matters}</p>
                    <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/40"><strong className="text-white">Recommended Response:</strong> {item.recommended_action}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 2: Customer Signals */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-cyan-500 pl-3">2. Customer Signals</h2>
            <div className="space-y-2">
              {selectedBrief.customer_signals?.length > 0 ? (
                selectedBrief.customer_signals.map((sig: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{sig.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{sig.source}</span>
                    </div>
                    <p className="text-slate-400 font-mono italic">"{sig.evidence}"</p>
                    <p className="text-slate-300"><strong className="text-slate-200">Implication:</strong> {sig.why_it_matters}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 3: Competitor Intelligence */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-indigo-500 pl-3">3. Competitor Intelligence</h2>
            <div className="space-y-2">
              {selectedBrief.competitor_intelligence?.length > 0 ? (
                selectedBrief.competitor_intelligence.map((comp: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{comp.title}</span>
                      <a href={comp.url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px]">
                        <span>{comp.source}</span> <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <p className="text-slate-400 font-mono italic">"{comp.evidence}"</p>
                    <p className="text-slate-300"><strong className="text-slate-200">Business Implication:</strong> {comp.why_it_matters}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 4: Market Intelligence */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-amber-500 pl-3">4. Market Intelligence</h2>
            <div className="space-y-2">
              {selectedBrief.market_intelligence?.length > 0 ? (
                selectedBrief.market_intelligence.map((m: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{m.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">{m.verification_status}</span>
                    </div>
                    <p className="text-slate-400 font-mono italic">"{m.evidence}"</p>
                    <p className="text-slate-300"><strong className="text-slate-200">Strategic Impact:</strong> {m.why_it_matters}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 5: Internal Intelligence */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-purple-500 pl-3">5. Internal Business Intelligence</h2>
            <div className="space-y-2">
              {selectedBrief.internal_intelligence?.length > 0 ? (
                selectedBrief.internal_intelligence.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono text-purple-400 font-bold mr-2">[{item.type}]</span>
                      <span className="text-slate-200">{item.insight}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Source: {item.source_doc}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 6: Actionable Opportunities */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-emerald-400 pl-3">
              6. Actionable Opportunities Identified (Min 3)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedBrief.opportunities_identified?.length > 0 ? (
                selectedBrief.opportunities_identified.map((opp: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 font-mono">Opportunity #{idx + 1}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">{opp.priority}</span>
                    </div>
                    <h4 className="font-semibold text-white leading-snug">{opp.title}</h4>
                    <p className="text-slate-400 font-mono text-[11px]">"{opp.evidence}"</p>
                    <p className="text-slate-300"><strong className="text-white">Impact:</strong> {opp.business_impact}</p>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 text-emerald-300 font-medium">
                      Next Step: {opp.next_step}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic col-span-3">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 7: Risks & Threats */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-rose-500 pl-3">7. Risks & Threats</h2>
            <div className="space-y-2">
              {selectedBrief.risks_and_threats?.length > 0 ? (
                selectedBrief.risks_and_threats.map((r: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-rose-950 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{r.development}</span>
                      <span className="text-[10px] font-mono text-rose-400">Urgency: {r.urgency}</span>
                    </div>
                    <p className="text-slate-300"><strong className="text-white">Impact:</strong> {r.possible_impact}</p>
                    <p className="text-slate-500 font-mono text-[11px]">Evidence: "{r.evidence_snippet}"</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 8: Recommended Actions Table */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-amber-400 pl-3">
              8. Recommended Actions for This Week
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono uppercase">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Action Item</th>
                    <th className="py-2.5 px-3">Reason / Rationale</th>
                    <th className="py-2.5 px-3">Owner</th>
                    <th className="py-2.5 px-3">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {selectedBrief.recommended_actions?.map((act: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{act.action}</td>
                      <td className="py-2.5 px-3 text-slate-300">{act.reason}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{act.suggested_owner}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {act.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 9: What We Should Watch */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-blue-400 pl-3">9. What We Should Watch</h2>
            <div className="space-y-2">
              {selectedBrief.what_we_should_watch?.map((w: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="font-semibold text-white">{w.topic}</span>
                  <span className="text-slate-400 text-[11px]">{w.monitoring_angle}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 10: Source Appendix */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-l-4 border-slate-500 pl-3">
              10. Source Appendix & Audit Trail
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Direct URL</th>
                      <th className="py-2.5 px-3">Published</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Evidence Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {selectedBrief.source_appendix?.map((sa: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 font-semibold text-slate-200">{sa.original_source}</td>
                        <td className="py-2 px-3">
                          <a href={sa.direct_link} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                            <span>Link</span> <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{sa.publication_date?.split('T')[0] || 'N/A'}</td>
                        <td className="py-2 px-3 text-emerald-400">{sa.verification_status}</td>
                        <td className="py-2 px-3 text-slate-300 max-w-xs truncate">"{sa.evidence_snippet}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No Executive Briefs Found</h3>
          <p className="text-xs max-w-md mx-auto">
            Click 'Run Brief Now' to collect intelligence across approved sources and synthesize the official Monday Morning Brief.
          </p>
        </div>
      )}
    </div>
  );
};
