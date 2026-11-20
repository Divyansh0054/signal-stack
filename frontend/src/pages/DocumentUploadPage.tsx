import React, { useState, useEffect } from 'react';
import { Company, InternalDocument } from '../types';
import { apiClient } from '../api/client';
import {
  UploadCloud,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface DocumentUploadPageProps {
  company: Company | null;
}

export const DocumentUploadPage: React.FC<DocumentUploadPageProps> = ({ company }) => {
  const [documents, setDocuments] = useState<InternalDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchDocs = async () => {
    if (!company) return;
    try {
      const data = await apiClient.getDocuments(company.id);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [company?.id]);

  if (!company) {
    return <div className="p-16 text-center text-slate-500">Please select a company to view internal documents.</div>;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);
    try {
      await apiClient.uploadDocument(company.id, file);
      setUploadSuccess(true);
      await fetchDocs();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Internal Intelligence Vault</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Internal Documents & CRM Pipeline
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Upload internal CRM exports, sales call logs, customer objections, and meeting notes (PDF, CSV, XLSX, TXT).
        </p>
      </div>

      {/* Security Isolation Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-0.5">
          <span className="font-semibold text-slate-900 block">Strict Confidentiality Isolation</span>
          <p>
            Internal documents are parsed locally and strictly isolated. They are never sent to external search engines, scrapers, or third-party training pipelines.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-3xl p-10 text-center transition-all shadow-xs">
        <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Ingest Internal Intelligence Files</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Supported file formats: <strong className="text-slate-800">.PDF, .CSV, .XLSX, .TXT</strong> (Max 25MB)
        </p>

        <label className="mt-5 inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all">
          <span>{isUploading ? 'Extracting Internal Signals...' : 'Select File to Upload'}</span>
          <input
            type="file"
            accept=".pdf,.csv,.xlsx,.txt"
            disabled={isUploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {uploadSuccess && (
          <div className="mt-4 text-xs text-emerald-700 flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Document processed and structured signals extracted successfully!</span>
          </div>
        )}
      </div>

      {/* Ingested Documents & Extracted Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Ingested Internal Files ({documents.length})</h3>
          <span className="text-xs text-slate-400 font-mono">Isolated Internal Vector</span>
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    {doc.file_type.includes('csv') || doc.file_type.includes('xlsx') ? (
                      <FileSpreadsheet className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{doc.filename}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Format: {doc.file_type.toUpperCase()} · Ingested {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  INGESTED
                </span>
              </div>

              {/* Extracted Insights Block */}
              <div className="space-y-3">
                {doc.extracted_summary && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <strong className="text-slate-800">Summary:</strong> {doc.extracted_summary}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doc.objections && doc.objections.map((obj, i) => (
                    <div key={`obj-${i}`} className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                      <span className="font-mono text-[10px] font-bold text-amber-700 uppercase">[OBJECTION]</span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {typeof obj === 'string' ? obj : obj.objection || obj.text || JSON.stringify(obj)}
                      </p>
                    </div>
                  ))}

                  {doc.lost_deal_reasons && doc.lost_deal_reasons.map((deal, i) => (
                    <div key={`deal-${i}`} className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                      <span className="font-mono text-[10px] font-bold text-rose-700 uppercase">[LOST DEAL]</span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {typeof deal === 'string' ? deal : deal.reason || deal.text || JSON.stringify(deal)}
                      </p>
                    </div>
                  ))}

                  {doc.product_requests && doc.product_requests.map((req, i) => (
                    <div key={`req-${i}`} className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                      <span className="font-mono text-[10px] font-bold text-indigo-700 uppercase">[PRODUCT REQUEST]</span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {typeof req === 'string' ? req : req.request || req.text || JSON.stringify(req)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
              No internal documents uploaded yet. Upload a sales transcript or lost deal log above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
