import React, { useState, useEffect } from 'react';
import { Company, Source } from '../types';
import { apiClient } from '../api/client';
import {
  Radio,
  Plus,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  X,
  Info,
  CheckCircle,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';

interface SourceManagerPageProps {
  company: Company | null;
}

export const SourceManagerPage: React.FC<SourceManagerPageProps> = ({ company }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSourceForModal, setSelectedSourceForModal] = useState<Source | null>(null);

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
    return <div className="p-16 text-center text-slate-500">Please select a company to manage sources.</div>;
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
        reason_for_inclusion: newReason.trim() || `Monitored intelligence source for ${newCategory}`,
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
    <div className="p-8 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            <span>Source Governance</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Source Manager</h2>
          <p className="text-sm text-slate-600 mt-1">
            Maintain verified intelligence feeds for {company.name}. Inspect health scores, audit trails, and status toggles.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Source</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-slate-400 mr-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-500">Category:</span>
          </div>
          {['ALL', 'Customers', 'Competitors', 'Market', 'Internal'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Health:</span>
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Health</option>
            <option value="HEALTHY">Healthy Only</option>
            <option value="WARNING">Warning</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Sources Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Why Monitored</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4">Last Checked</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSources.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-emerald-700 font-mono inline-flex items-center gap-1 max-w-xs truncate mt-0.5"
                    >
                      <span>{s.url.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {s.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={s.reason_for_inclusion}>
                    {s.reason_for_inclusion}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        s.health_status === 'HEALTHY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.health_status === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {s.health_status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {s.last_checked_at ? new Date(s.last_checked_at).toLocaleDateString() : 'Pending'}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        s.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title={s.status === 'APPROVED' ? 'Click to pause monitoring' : 'Click to approve monitoring'}
                    >
                      {s.status === 'APPROVED' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-3 h-3 text-slate-400" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => setSelectedSourceForModal(s)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View source details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSource(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSources.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No sources found matching filter criteria.
          </div>
        )}
      </div>

      {/* Source Details Modal */}
      {selectedSourceForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{selectedSourceForModal.name}</h3>
              <button
                onClick={() => setSelectedSourceForModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-900 block mb-0.5">Endpoint URL:</span>
                <a
                  href={selectedSourceForModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline font-mono text-[11px] break-all"
                >
                  {selectedSourceForModal.url}
                </a>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-0.5">Why Monitored:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 leading-relaxed">
                  {selectedSourceForModal.reason_for_inclusion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedSourceForModal.category}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Source Type</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedSourceForModal.source_type}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Health Status</span>
                  <span className="font-semibold text-emerald-700 mt-0.5 block">{selectedSourceForModal.health_status}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Failures / Duplicates</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedSourceForModal.consecutive_failures} fails · {selectedSourceForModal.duplicate_count} dups
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSourceForModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Monitored Source</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Higher Education Policy Institute (HEPI)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source URL (RSS or Public Web) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.hepi.ac.uk/feed"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                  >
                    <option value="Customers">Customers</option>
                    <option value="Competitors">Competitors</option>
                    <option value="Market">Market</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                  >
                    <option value="RSS">RSS Feed</option>
                    <option value="HTML">HTML Page</option>
                    <option value="PORTAL">Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Inclusion *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Why are we monitoring this source? (e.g. Primary think-tank for UK higher education policy updates)"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium"
                >
                  {isSubmitting ? 'Saving...' : 'Add Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
