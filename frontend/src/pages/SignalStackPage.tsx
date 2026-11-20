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
  Radio,
  ChevronDown,
  ChevronUp,
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
    return <div className="p-16 text-center text-slate-500">Please select a company to view its Signal Stack.</div>;
  }

  const categorySources = sources.filter((s) => s.category === activeCategory);

  const categories = [
    {
      id: 'Customers' as const,
      label: 'Customers',
      icon: Users,
      desc: 'Student forums, applicant sentiment, and recruitment feedback',
      purpose: 'Detect unmet student needs, policy confusion, and conversion friction before they cause churn.',
    },
    {
      id: 'Competitors' as const,
      label: 'Competitors',
      icon: Swords,
      desc: '5-10 discovered peers, feature launches, and pricing',
      purpose: 'Track competitor university acquisitions, agent portal upgrades, and positioning maneuvers.',
    },
    {
      id: 'Market' as const,
      label: 'Market',
      icon: TrendingUp,
      desc: 'Regulatory bodies, visa policies, and macro education trends',
      purpose: 'Monitor UKVI, US State Dept, and immigration policies that directly impact international enrollment.',
    },
    {
      id: 'Internal' as const,
      label: 'Internal',
      icon: FileText,
      desc: 'Confidential CRM logs, customer objections, and lost deals',
      purpose: 'Isolate internal sales call transcripts and objections to surface recurring deal blockers.',
    },
  ];

  const currentCategoryMeta = categories.find((c) => c.id === activeCategory);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 text-slate-400" />
          <span>Intelligence Architecture</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Company Signal Stack</h2>
        <p className="text-sm text-slate-600 mt-1">
          Tailored 4-vector monitoring architecture for {company.name}. Every source has a documented business reason answering: <strong className="text-slate-900 font-semibold">"Why are we monitoring this source?"</strong>
        </p>
      </div>

      {/* 4 Large Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          const count = sources.filter((s) => s.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900/5'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {cat.id === 'Competitors' ? `${competitors.length} Peers` : `${count} Sources`}
                </span>
              </div>
              <div className="font-semibold text-sm text-slate-900 mt-3">{cat.label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2">{cat.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Tab Detail Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Monitoring Objective · {activeCategory}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800">{currentCategoryMeta?.purpose}</p>
      </div>

      {/* Competitors Special View when Competitors Tab is Active */}
      {activeCategory === 'Competitors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Discovered Competitors ({competitors.length})</h3>
              <p className="text-xs text-slate-500">
                Dynamically discovered based on company profile and business context. Zero hard-coded entries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitors.map((comp) => (
              <div
                key={comp.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-900">{comp.name}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {comp.competitor_type || 'DIRECT'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{comp.offering_summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Competitor Tracking Active</span>
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
                  >
                    <span>{comp.website ? comp.website.replace(/^https?:\/\//, '') : 'Website'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources List for Active Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Approved Sources for {activeCategory} ({categorySources.length})
            </h3>
            <p className="text-xs text-slate-500">
              Each source has an explicit justification explaining why it is monitored.
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Source Name</th>
                <th className="py-3 px-4">Why Monitored</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">Direct Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorySources.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-md leading-relaxed">
                    {s.reason_for_inclusion}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {s.source_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        s.health_status === 'HEALTHY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {s.health_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Endpoint</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categorySources.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No approved sources configured for {activeCategory}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
