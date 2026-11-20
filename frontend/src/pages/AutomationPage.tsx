import React, { useState, useEffect } from 'react';
import { Company, SchedulerStatus } from '../types';
import { apiClient } from '../api/client';
import {
  Cpu,
  Calendar,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  History,
  Sliders,
  Sparkles,
  ShieldCheck,
  Clock,
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
    return <div className="p-16 text-center text-slate-500">Please select a company to view automation status.</div>;
  }

  const handleRunBriefNow = async () => {
    setIsRunningBrief(true);
    try {
      await apiClient.triggerManualBrief(company.id);
      alert('Weekly Brief run completed successfully!');
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

  const weeklyJob = schedulerStatus?.registered_jobs?.find((j) => j.id.includes('weekly') || j.id.includes('brief'));
  const auditJob = schedulerStatus?.registered_jobs?.find((j) => j.id.includes('audit') || j.id.includes('monthly'));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>Autonomous Scheduler</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Automation & System Health</h2>
        <p className="text-sm text-slate-600 mt-1">
          Background cron workers independently execute weekly briefings and monthly source-health audits without manual intervention.
        </p>
      </div>

      {/* Two Large Primary Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Weekly Intelligence Brief */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scheduled Briefing
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Weekly Intelligence Brief</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crawls approved sources, deduplicates news items, scores signal impact, and generates the Monday Morning Executive Brief.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cron Schedule:</span>
                <span className="font-mono text-slate-800 font-semibold">Every Monday 06:00 UTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Next Scheduled Run:</span>
                <span className="font-mono text-slate-800">
                  {weeklyJob?.next_run_time ? new Date(weeklyJob.next_run_time).toLocaleString() : 'Next Monday 06:00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Execution:</span>
                <span className="font-medium text-emerald-700">Successful</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunBriefNow}
            disabled={isRunningBrief}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningBrief ? 'animate-spin' : ''}`} />
            <span>{isRunningBrief ? 'Running Briefing Pipeline...' : 'Run Weekly Brief Now'}</span>
          </button>
        </div>

        {/* Card 2: Monthly Source Health Audit */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quality Assurance
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Monthly Source Health Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects dead URLs, inactive feeds, duplicate sources, and declining relevance scores while proposing high-signal replacement sources.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cron Schedule:</span>
                <span className="font-mono text-slate-800 font-semibold">1st of Month 02:00 UTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Next Scheduled Run:</span>
                <span className="font-mono text-slate-800">
                  {auditJob?.next_run_time ? new Date(auditJob.next_run_time).toLocaleString() : '1st of Month'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Execution:</span>
                <span className="font-medium text-emerald-700">Healthy (0 dead links)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunAuditNow}
            disabled={isRunningAudit}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
            <span>{isRunningAudit ? 'Auditing Sources...' : 'Run Source Audit Now'}</span>
          </button>
        </div>
      </div>

      {/* Audit Summary Results if Triggered */}
      {auditSummary && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Latest Source Audit Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Total Audited</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{auditSummary.total_sources_audited}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Dead URLs</span>
              <span className="text-lg font-bold text-rose-600 mt-1 block">{auditSummary.dead_urls}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Active / Healthy</span>
              <span className="text-lg font-bold text-emerald-600 mt-1 block">{auditSummary.active_sources}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Suggested Sources</span>
              <span className="text-lg font-bold text-slate-800 mt-1 block">{auditSummary.new_candidates_suggested}</span>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Context Pivot Tool (Context Adaptation) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Dynamic Context Adaptation (Stress Test)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how the intelligence engine shifts monitoring priorities when strategic focus changes (e.g. from B2C student recruitment to B2B institutional partnerships).
          </p>
        </div>

        <form onSubmit={handleApplyContextPivot} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. Focus on B2B university partnerships & institutional licensing."
              value={newContext}
              onChange={(e) => setNewContext(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
            />
            <button
              type="submit"
              disabled={isAdapting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              {isAdapting ? 'Adapting...' : 'Apply Pivot'}
            </button>
          </div>
        </form>

        {adaptationResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-1 font-mono">
            <span className="font-sans font-semibold text-emerald-700 block">Context Shift Applied:</span>
            <p>New Focus: {adaptationResult.new_focus}</p>
            <p>Activated Sources: {adaptationResult.activated_sources} · Deprioritized: {adaptationResult.deprioritized_sources}</p>
          </div>
        )}
      </div>

      {/* Audit Log Execution History */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Execution Audit Trail</h3>
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action Event</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{log.action}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] max-w-md truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No audit logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
