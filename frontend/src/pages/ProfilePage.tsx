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
  ShieldCheck,
  Building,
  Target,
} from 'lucide-react';

interface ProfilePageProps {
  company: Company | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ company }) => {
  if (!company) {
    return <div className="p-16 text-center text-slate-500">Please select a company to view its profile.</div>;
  }

  const profile = company.profile;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Autonomous Synthesis Layer</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Company Intelligence Profile</h2>
        <p className="text-sm text-slate-600 mt-1">
          Synthesized from live web crawling of {company.website}. Strictly separates <strong className="text-slate-900 font-semibold">verified ground-truth facts</strong> from <strong className="text-slate-900 font-semibold">strategic assumptions</strong>.
        </p>
      </div>

      {/* Overview & Positioning Dossier */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Business Overview
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">{company.name}</h3>
          <p className="text-sm text-slate-700 leading-relaxed mt-2">
            {profile?.business_description || 'No business description available.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Market Positioning</span>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {profile?.positioning || 'Standard market positioning.'}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commercial Monetization Engine</span>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {profile?.business_model || 'Subscription SaaS / Commission.'}
            </p>
          </div>
        </div>
      </div>

      {/* Segments, Products & Geographies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Products & Services */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-900">Products & Services</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile?.products_services && profile.products_services.length > 0 ? (
              profile.products_services.map((p, i) => (
                <span
                  key={i}
                  title={typeof p === 'object' ? p.description : undefined}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  {typeof p === 'object' ? p.name : p}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Standard enterprise service suite</span>
            )}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-900">Customer Segments</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile?.customer_segments && profile.customer_segments.length > 0 ? (
              profile.customer_segments.map((seg, i) => (
                <span
                  key={i}
                  title={typeof seg === 'object' ? seg.description : undefined}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  {typeof seg === 'object' ? seg.segment : seg}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Institutional B2B and consumer clients</span>
            )}
          </div>
        </div>

        {/* Geographic Markets */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-900">Geographic Markets</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile?.geographic_markets && profile.geographic_markets.length > 0 ? (
              profile.geographic_markets.map((geo, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  {geo}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Global multi-region coverage</span>
            )}
          </div>
        </div>
      </div>

      {/* CRITICAL SECTION: Verified Facts vs. Assumptions (Visually Distinct) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Facts Column */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Verified Factual Ground Truth</h3>
          </div>
          <p className="text-xs text-slate-500">
            Claims directly extracted from crawled public pages with exact verbatim quotes and source URLs.
          </p>

          <div className="space-y-3 pt-1">
            {profile?.verified_facts && profile.verified_facts.length > 0 ? (
              profile.verified_facts.map((fact, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="text-xs font-semibold text-slate-900">{fact.fact}</div>
                  <div className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed italic">
                    <span className="font-sans font-semibold text-emerald-700 block mb-0.5">Citation Snippet:</span>
                    "{fact.snippet}"
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="font-medium text-emerald-700">Status: Verified Ground Truth</span>
                    <a
                      href={fact.citation_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Direct URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No verified facts recorded.</div>
            )}
          </div>
        </div>

        {/* Assumptions Column */}
        <div className="bg-white border border-amber-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Strategic Hypotheses & Assumptions</h3>
          </div>
          <p className="text-xs text-slate-500">
            Inferred market assumptions flagged for continuous validation. Never presented as factual proof.
          </p>

          <div className="space-y-3 pt-1">
            {profile?.assumptions && profile.assumptions.length > 0 ? (
              profile.assumptions.map((assump, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{assump.assumption}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      {assump.needs_verification ? 'Needs Verification' : 'Verified'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    <span className="font-semibold text-amber-700 block mb-0.5">Why we must test this:</span>
                    {assump.reason}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Actively tested in weekly intelligence crawl.
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No active assumptions recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Crawl Summary Footer */}
      {profile?.raw_research_summary && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-center justify-between">
          <span>{profile.raw_research_summary}</span>
          <span className="text-slate-400 font-mono">Crawler: Trafilatura + BeautifulSoup4</span>
        </div>
      )}
    </div>
  );
};
