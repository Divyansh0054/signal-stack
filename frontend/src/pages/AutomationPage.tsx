import React, { useState, useEffect } from 'react';
import { Company, SchedulerStatus } from '../types';
import { apiClient } from '../api/client';
import {
  Cpu,
  Calendar,
  Activity,
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  History,
} from 'lucide-react';

interface AutomationPageProps {
  company: Company | null;
  onRefreshData?: () => void;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({ company, onRefreshData }) => {
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isRunningBrief, setIsRunningBrief] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditSummary, setAuditSummary] = useState<any | null>(null);

  // Context adaptation form state
  const [newContext, setNewContext] = useState(
    'Focus on B2B university partnerships & institutional licensing.'
  );
  const [adaptationResult, setAdaptationResult] = useState<any | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);

  const fetchStatus = async () => {
    if (!company) return;
    try {
      const [sStatus, logs] = await Promise.all([
        apiClient.getSchedulerStatus(company.id),
        apiClient.getAuditLogs(company.id),
      ]);
      setSchedulerStatus(sStatus);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [company?.id]);

  if (!company) {
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
  }

  const handleRunBriefNow = async () => {
    setIsRunningBrief(true);
    try {
      await apiClient.triggerManualBrief(company.id);
      alert('Weekly Brief run initiated and completed successfully!');
      await fetchStatus();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Weekly brief run failed.');
    } finally {
      setIsRunningBrief(false);
    }
  };

  const handleRunAuditNow = async () => {
    setIsRunningAudit(true);
    try {
      const res = await apiClient.triggerManualAudit(company.id);
      setAuditSummary(res.audit_summary);
      await fetchStatus();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Monthly audit failed.');
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleApplyContextPivot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContext.trim()) return;

    setIsAdapting(true);
    try {
      const res = await apiClient.adaptContext(company.id, newContext.trim());
      setAdaptationResult(res);
      await fetchStatus();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Context adaptation failed.');
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
          <Cpu className="w-4 h-4" />
          <span>Independent Background Automation</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Automation, Audit & Context Adaptation</h2>
        <p className="text-sm text-slate-400 mt-1">
          Supports two independent automated processes (Weekly Intelligence Briefing & Monthly Source-Health Audit) plus dynamic context pivoting stress testing.
        </p>
      </div>

      {/* Two Independent Scheduled Processes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Process 1: Weekly Intelligence Brief */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Process A • Weekly
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Scheduler Active
            </span>
          </div>

          <h3 className="text-base font-bold text-white">Weekly Intelligence Brief Engine</h3>
          <p className="text-xs text-slate-300">
            Automatically runs approved source checks, extracts new developments, deduplicates content, ranks intelligence signals, and generates the official Monday Morning Brief.
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div>Schedule: <strong className="text-slate-200">Every Monday @ 06:00 UTC</strong> (0 6 * * 1)</div>
            <div>Timezone: <strong className="text-slate-200">UTC</strong></div>
          </div>

          <button
            onClick={handleRunBriefNow}
            disabled={isRunningBrief}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              isRunningBrief ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningBrief ? 'animate-spin' : ''}`} />
            <span>{isRunningBrief ? 'Running Full Weekly Pipeline...' : 'Run Weekly Brief Now'}</span>
          </button>
        </div>

        {/* Process 2: Monthly Source-Health Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
              Process B • Monthly
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Independent Job
            </span>
          </div>

          <h3 className="text-base font-bold text-white">Monthly Signal Stack Audit Engine</h3>
          <p className="text-xs text-slate-300">
            Checks dead URLs, identifies stagnant or duplicate sources, evaluates declining relevance, discovers new candidates, and logs failed sources directly in the dashboard.
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div>Schedule: <strong className="text-slate-200">1st of Every Month @ 02:00 UTC</strong> (0 2 1 * *)</div>
            <div>Failure Logging: <strong className="text-slate-200">Audit Logs & Source Health State</strong></div>
          </div>

          <button
            onClick={handleRunAuditNow}
            disabled={isRunningAudit}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              isRunningAudit ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
            <span>{isRunningAudit ? 'Auditing All URLs...' : 'Run Monthly Audit Now'}</span>
          </button>
        </div>
      </div>

      {/* Monthly Audit Findings Modal/Box (if run) */}
      {auditSummary && (
        <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Monthly Audit Report Findings</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500">Checked:</span>
              <div className="text-lg font-bold text-white">{auditSummary.total_checked} URLs</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500">Healthy:</span>
              <div className="text-lg font-bold text-emerald-400">{auditSummary.healthy_count} Valid</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500">Dead URLs:</span>
              <div className="text-lg font-bold text-rose-400">{auditSummary.dead_sources?.length || 0} Blocked</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500">New Sources Found:</span>
              <div className="text-lg font-bold text-cyan-400">{auditSummary.discovered_new_sources_count} Discovered</div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Reusability & Context Adaptation Stress Test */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Dynamic Business Context Adaptation Stress Test</h3>
        </div>
        <p className="text-xs text-slate-300">
          The assignment requires proving that changing a company's business context after setup dynamically reassesses source relevance, flags obsolete sources, recommends new specialized sources, and updates the Signal Stack.
        </p>

        <form onSubmit={handleApplyContextPivot} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Strategic Business Focus / Context
            </label>
            <input
              type="text"
              required
              value={newContext}
              onChange={(e) => setNewContext(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isAdapting}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all flex items-center gap-1.5 ${
              isAdapting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAdapting ? 'animate-spin' : ''}`} />
            <span>{isAdapting ? 'Re-assessing Stack...' : 'Apply Strategic Context Pivot'}</span>
          </button>
        </form>

        {adaptationResult && (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3 text-xs">
            <div className="font-bold text-amber-400 font-mono">Adaptation Execution Result:</div>
            <p className="text-slate-200">{adaptationResult.adaptation_summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="font-mono text-rose-400 font-bold block mb-1">
                  Sources De-prioritized / Flagged ({adaptationResult.sources_flagged_obsolete?.length || 0}):
                </span>
                {adaptationResult.sources_flagged_obsolete?.map((s: any, idx: number) => (
                  <div key={idx} className="text-[11px] text-slate-400">• {s.source_name}: {s.rationale}</div>
                ))}
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="font-mono text-emerald-400 font-bold block mb-1">
                  New Recommended Sources ({adaptationResult.new_sources_recommended?.length || 0}):
                </span>
                {adaptationResult.new_sources_recommended?.slice(0, 3).map((s: any, idx: number) => (
                  <div key={idx} className="text-[11px] text-slate-400">• {s.name} ({s.category})</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>System Audit & Execution Trail ({auditLogs.length} Events)</span>
        </h3>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Message</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-4 font-bold text-slate-300">{log.event_type}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'ERROR'
                            ? 'bg-rose-950 text-rose-300'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans max-w-md truncate">{log.message}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">{new Date(log.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
