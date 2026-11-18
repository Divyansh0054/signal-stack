import React from 'react';
import { Company } from '../types';
import {
  CheckCircle,
  HelpCircle,
  Package,
  Users,
  Globe2,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

interface ProfilePageProps {
  company: Company | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ company }) => {
  if (!company) {
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
  }

  const profile = company.profile;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
          <span>Autonomous Extraction Layer</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Company Intelligence Profile</h2>
        <p className="text-sm text-slate-400 mt-1">
          Synthesized from live crawling of {company.website}. Strictly differentiates verified factual claims from testable assumptions.
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono text-emerald-400">
          Executive Positioning & Business Model
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {profile?.business_description || 'No business description available.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono block">Market Positioning</span>
            <span className="text-sm text-slate-200 mt-1 block">
              {profile?.positioning || 'Standard market positioning.'}
            </span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono block">Commercial Monetization Engine</span>
            <span className="text-sm text-slate-200 mt-1 block">
              {profile?.business_model || 'Subscription SaaS / Commission.'}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Section: Verified Facts vs Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verified Facts */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Verified Factual Disclosures</h3>
          </div>
          <p className="text-xs text-slate-400">
            Claims directly extracted from crawled public pages with exact verbatim quotes and source URLs.
          </p>

          <div className="space-y-3 pt-1">
            {profile?.verified_facts && profile.verified_facts.length > 0 ? (
              profile.verified_facts.map((fact, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="text-xs font-semibold text-slate-200">{fact.fact}</div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-900/90 p-2 rounded border border-slate-800/60">
                    <span className="text-emerald-400 font-sans font-semibold mr-1">Citation Snippet:</span>
                    "{fact.snippet}"
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">Status: Ground Truth</span>
                    <a
                      href={fact.citation_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Direct URL</span> <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No verified facts recorded.</div>
            )}
          </div>
        </div>

        {/* Assumptions (Clearly Separated) */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Strategic Assumptions</h3>
          </div>
          <p className="text-xs text-slate-400">
            Inferred operating hypotheses requiring validation or clarification during the founder interview.
          </p>

          <div className="space-y-3 pt-1">
            {profile?.assumptions && profile.assumptions.length > 0 ? (
              profile.assumptions.map((assump, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="text-xs font-semibold text-amber-200">{assump.assumption}</div>
                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Hypothesis Rationale:</strong> {assump.reason}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-mono">
                    <span>Validation Status:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                      Pending Interview
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No assumptions flagged.</div>
            )}
          </div>
        </div>
      </div>

      {/* Products & Customer Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Package className="w-5 h-5 text-cyan-400" />
            <h3>Core Offerings & Products</h3>
          </div>
          <div className="space-y-3">
            {profile?.products_services?.map((prod, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-white block">{prod.name}</span>
                <span className="text-xs text-slate-400 mt-1 block">{prod.description}</span>
                {prod.evidence && (
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    Verified: {prod.evidence}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3>Target Customer Segments</h3>
          </div>
          <div className="space-y-3">
            {profile?.customer_segments?.map((seg, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-white block">{seg.segment}</span>
                <span className="text-xs text-slate-400 mt-1 block">{seg.description}</span>
                {seg.evidence && (
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    Verified: {seg.evidence}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
