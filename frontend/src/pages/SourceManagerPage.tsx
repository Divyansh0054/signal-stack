import React, { useState, useEffect } from 'react';
import { Company, Source } from '../types';
import { apiClient } from '../api/client';
import {
  Radio,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Activity,
  Layers,
} from 'lucide-react';

interface SourceManagerPageProps {
  company: Company | null;
}

export const SourceManagerPage: React.FC<SourceManagerPageProps> = ({ company }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New source form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'Customers' | 'Competitors' | 'Market' | 'Internal'>('Market');
  const [newType, setNewType] = useState('RSS');
  const [newReason, setNewReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSources = async () => {
    if (!company) return;
    try {
      const data = await apiClient.getSources(company.id);
      setSources(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [company?.id]);

  if (!company) {
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
  }

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !newUrl.trim() || !newName.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.addSource({
        company_id: company.id,
        name: newName.trim(),
        url: newUrl.trim(),
        category: newCategory,
        source_type: newType,
        reason_for_inclusion: newReason.trim() || `Monitored source for ${newCategory}`,
      });
      setShowAddModal(false);
      setNewName('');
      setNewUrl('');
      setNewReason('');
      await fetchSources();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to add source.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (source: Source) => {
    const nextStatus = source.status === 'APPROVED' ? 'DISABLED' : 'APPROVED';
    try {
      await apiClient.updateSourceStatus(source.id, nextStatus);
      await fetchSources();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to remove this source from continuous monitoring?')) return;
    try {
      await apiClient.deleteSource(sourceId);
      await fetchSources();
    } catch (err) {
      alert('Failed to delete source');
    }
  };

  const filteredSources = sources.filter((s) => {
    if (filterCategory !== 'ALL' && s.category !== filterCategory) return false;
    if (filterHealth !== 'ALL' && s.health_status !== filterHealth) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
            <Radio className="w-4 h-4" />
            <span>Source Monitoring Governance</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Source Manager</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage monitored intelligence feeds, inspect HTTP telemetry, and view duplicate suppression stats.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Source</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Customers">Customers</option>
            <option value="Competitors">Competitors</option>
            <option value="Market">Market</option>
            <option value="Internal">Internal</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Health:</span>
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="bg-slate-950 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Health States</option>
            <option value="HEALTHY">Healthy</option>
            <option value="WARNING">Warning</option>
            <option value="FAILED">Failed</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="ml-auto text-slate-400 font-mono">
          Showing <strong className="text-white">{filteredSources.length}</strong> of {sources.length} sources
        </div>
      </div>

      {/* Source Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase">
              <tr>
                <th className="py-3 px-4">Source Name & URL</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Health / Status</th>
                <th className="py-3 px-4">HTTP / Latency</th>
                <th className="py-3 px-4">Duplicates Blocked</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSources.map((s) => (
                <tr key={s.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{s.name}</div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono truncate max-w-xs mt-0.5"
                    >
                      <span>{s.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px]">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          s.health_status === 'HEALTHY'
                            ? 'bg-emerald-400'
                            : s.health_status === 'WARNING'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      <span className="font-medium text-slate-200">{s.health_status}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({s.status})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {s.last_http_status ? `HTTP ${s.last_http_status}` : 'Pending'} •{' '}
                    {s.response_time_ms ? `${s.response_time_ms.toFixed(0)}ms` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">
                    {s.duplicate_count} suppressed
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          s.status === 'APPROVED'
                            ? 'bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-800/80'
                            : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/80'
                        }`}
                      >
                        {s.status === 'APPROVED' ? 'Disable' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeleteSource(s.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding source */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Custom Intelligence Source</h3>
            <form onSubmit={handleAddSource} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Times Higher Education Global News"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Source URL or RSS Feed</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.example.com/feed.xml"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Customers">Customers</option>
                    <option value="Competitors">Competitors</option>
                    <option value="Market">Market</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Source Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="RSS">RSS Feed</option>
                    <option value="WebPage">Public WebPage</option>
                    <option value="Regulatory">Regulatory Official Portal</option>
                    <option value="ReviewHub">Review / Community Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Reason for Inclusion (Mandatory Justification)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this source matters to this specific company..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500"
                >
                  {isSubmitting ? 'Validating...' : 'Add Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
