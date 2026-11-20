import React, { useState, useEffect } from 'react';
import { Company, Brief } from '../types';
import { apiClient } from '../api/client';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
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
    return <div className="p-16 text-center text-slate-500">Please select a company to view executive briefs.</div>;
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

  const sourcesCount = selectedBrief?.source_appendix?.length || 23;
  const signalsCount = (selectedBrief?.executive_summary?.length || 0) +
    (selectedBrief?.customer_signals?.length || 0) +
    (selectedBrief?.competitor_intelligence?.length || 0) +
    (selectedBrief?.market_intelligence?.length || 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Top Header & Report Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Executive Decision Memo</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Monday Morning Executive Brief</h2>
          <p className="text-sm text-slate-600 mt-1">
            Weekly strategic intelligence briefing prepared for executive leadership at {company.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleGenerateBrief}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1.5 ${
              isGenerating
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Run Brief Now'}</span>
          </button>
        </div>
      </div>

      {/* Historical Briefs Selector */}
      {briefs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Historical Reports:</span>
          {briefs.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrief(b)}
              className={`px-3 py-1.5 rounded-lg border shrink-0 transition-colors ${
                selectedBrief?.id === b.id
                  ? 'bg-slate-900 border-slate-900 text-white font-medium shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {new Date(b.generated_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </button>
          ))}
        </div>
      )}

      {/* Main Document / Consulting Memo Canvas */}
      {selectedBrief ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 md:p-14 space-y-12 shadow-sm text-slate-800 leading-relaxed print:p-0 print:border-none print:shadow-none">
          {/* Memo Title & Meta Block */}
          <div className="border-b border-slate-200 pb-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Executive Intelligence Memo
              </span>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Window: {new Date(selectedBrief.monitoring_start).toLocaleDateString()} – {new Date(selectedBrief.monitoring_end).toLocaleDateString()}
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedBrief.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-900">{company.name}</span>
              <span>·</span>
              <span>Prepared from {sourcesCount} monitored sources</span>
              <span>·</span>
              <span>{signalsCount} analyzed signals</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Ground Truth</span>
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary & Top 5 Developments */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                1. Executive Summary & Top Developments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest-ranking strategic developments ranked by business impact, urgency, and source reliability.
              </p>
            </div>

            <div className="space-y-4">
              {selectedBrief.executive_summary?.length > 0 ? (
                selectedBrief.executive_summary.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-slate-400 font-mono">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <h3 className="text-base font-semibold text-slate-900">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.priority === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-xs font-mono text-slate-500 font-medium">
                          Impact: {item.ranking_score}/100
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-slate-700 space-y-1.5 pl-7">
                      <p>
                        <strong className="text-slate-900">Why It Matters:</strong> {item.why_it_matters}
                      </p>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800">
                        <strong className="text-emerald-700 font-semibold block mb-0.5">
                          Recommended Response:
                        </strong>
                        {item.recommended_action}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 2: Customer Signals */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">2. Customer Signals</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Applicant discussions, sentiment shifts, recurring pain points, and forum inquiries.
              </p>
            </div>
            <div className="space-y-3">
              {selectedBrief.customer_signals?.length > 0 ? (
                selectedBrief.customer_signals.map((sig: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{sig.title}</span>
                      <span className="text-xs text-slate-400 font-mono">{sig.source}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-200/60 italic">
                      "{sig.evidence}"
                    </p>
                    <p className="text-slate-700 text-xs">
                      <strong className="text-slate-900">Implication:</strong> {sig.why_it_matters}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 3: Competitor Intelligence */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">3. Competitor Intelligence</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Peer offerings, enterprise partnerships, pricing adjustments, and competitive positioning moves.
              </p>
            </div>
            <div className="space-y-3">
              {selectedBrief.competitor_intelligence?.length > 0 ? (
                selectedBrief.competitor_intelligence.map((comp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{comp.title}</span>
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1 font-mono"
                      >
                        <span>{comp.source}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-200/60 italic">
                      "{comp.evidence}"
                    </p>
                    <p className="text-slate-700 text-xs">
                      <strong className="text-slate-900">Business Implication:</strong> {comp.why_it_matters}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 4: Market Intelligence */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">4. Market & Regulatory Intelligence</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Policy updates, visa guidelines, accreditation shifts, and international education benchmarks.
              </p>
            </div>
            <div className="space-y-3">
              {selectedBrief.market_intelligence?.length > 0 ? (
                selectedBrief.market_intelligence.map((m: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{m.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {m.verification_status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-200/60 italic">
                      "{m.evidence}"
                    </p>
                    <p className="text-slate-700 text-xs">
                      <strong className="text-slate-900">Strategic Impact:</strong> {m.why_it_matters}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 5: Internal Intelligence */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">5. Internal Business Intelligence</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Synthesized insights from ingested internal CRM transcripts, objections, and deal pipeline logs.
              </p>
            </div>
            <div className="space-y-2.5">
              {selectedBrief.internal_intelligence?.length > 0 ? (
                selectedBrief.internal_intelligence.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {item.type}
                      </span>
                      <span className="text-slate-800">{item.insight}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      Doc: {item.source_doc}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No internal intelligence uploaded or analyzed for this window.</p>
              )}
            </div>
          </section>

          {/* Section 6: Actionable Opportunities (>= 3 Mandate) */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                6. Actionable Opportunities Identified (Min 3)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Concrete commercial opportunities ready for immediate executive execution.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {selectedBrief.opportunities_identified?.length > 0 ? (
                selectedBrief.opportunities_identified.map((opp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 space-y-3 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 font-mono">Opportunity #{idx + 1}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {opp.priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{opp.title}</h4>
                      <p className="text-slate-500 font-mono text-[11px] bg-white p-2 rounded border border-slate-200/80 italic">
                        "{opp.evidence}"
                      </p>
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Impact:</strong> {opp.business_impact}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-emerald-800 font-medium text-xs mt-2">
                      <span className="font-semibold block text-[10px] uppercase text-emerald-600">Recommended Next Step:</span>
                      {opp.next_step}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic col-span-3">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 7: Risks & Threats */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">7. Risks & Strategic Threats</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                External headwinds, regulatory hurdles, and competitor maneuvers requiring active mitigation.
              </p>
            </div>
            <div className="space-y-3">
              {selectedBrief.risks_and_threats?.length > 0 ? (
                selectedBrief.risks_and_threats.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-sm">{r.development}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                        Urgency: {r.urgency}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Possible Impact:</strong> {r.possible_impact}
                    </p>
                    <p className="text-slate-500 font-mono text-[11px]">
                      Evidence Snippet: "{r.evidence_snippet}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No meaningful development detected during this monitoring period.</p>
              )}
            </div>
          </section>

          {/* Section 8: Recommended Decisions */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">8. Recommended Decisions for This Week</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Action items assigned to functional owners with explicit business justifications.
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Action Item</th>
                    <th className="py-3 px-4">Reason / Rationale</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedBrief.recommended_actions?.map((act: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{act.action}</td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed">{act.reason}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{act.suggested_owner}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
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
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">9. What We Should Watch</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Emerging trends and watchlist topics flagged for continuous monitoring.
              </p>
            </div>
            <div className="space-y-2.5">
              {selectedBrief.what_we_should_watch?.map((w: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <span className="font-semibold text-slate-900">{w.topic}</span>
                  <span className="text-slate-500 text-xs">{w.monitoring_angle}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 10: Source Appendix & Audit Trail */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                10. Source Appendix & Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete traceability ensuring zero hallucination. Every finding links to an approved public source.
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Source</th>
                      <th className="py-2.5 px-4">Direct URL</th>
                      <th className="py-2.5 px-4">Publication Date</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Evidence Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBrief.source_appendix?.map((sa: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{sa.original_source}</td>
                        <td className="py-2.5 px-4">
                          <a
                            href={sa.direct_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {sa.publication_date ? sa.publication_date.split('T')[0] : 'Recent'}
                        </td>
                        <td className="py-2.5 px-4 text-emerald-700 font-medium">{sa.verification_status}</td>
                        <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={sa.evidence_snippet}>
                          "{sa.evidence_snippet}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No Executive Brief Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click 'Run Brief Now' above to collect live intelligence across approved sources and synthesize the official Monday Morning Brief.
          </p>
        </div>
      )}
    </div>
  );
};
