import React, { useState, useEffect } from 'react';
import { Company, InternalDocument } from '../types';
import { apiClient } from '../api/client';
import {
  UploadCloud,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
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
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
          <Lock className="w-4 h-4" />
          <span>Internal Intelligence Vault</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Internal Documents & Pipeline Ingestion</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload internal CRM exports, sales call logs, customer objections, and meeting transcripts (PDF, CSV, XLSX, TXT). <strong className="text-white">Strict Isolation:</strong> Confidential documents are never queried against public web engines or shared externally.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-900 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center transition-all">
        <UploadCloud className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">Upload Internal Intelligence Documents</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Supported file formats: <strong className="text-slate-300">.PDF, .CSV, .XLSX, .TXT</strong> (Max 25MB)
        </p>

        <label className="mt-4 inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-emerald-600/30 transition-all">
          <span>{isUploading ? 'Extracting Insights...' : 'Select File to Ingest'}</span>
          <input
            type="file"
            accept=".pdf,.csv,.xlsx,.txt"
            disabled={isUploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {uploadSuccess && (
          <div className="mt-3 text-xs text-emerald-400 flex items-center justify-center gap-1 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Document processed and structured insights extracted successfully!</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-white">
          Ingested Internal Files & Extracted Insights ({documents.length})
        </h3>

        {documents.map((doc) => (
          <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">{doc.filename}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                  {doc.file_type} • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              {doc.extracted_summary}
            </p>

            {/* Extracted Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Objections */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-amber-300 font-mono text-[11px] block">
                  Recurring Customer Objections ({doc.objections?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {doc.objections?.map((obj: any, idx: number) => (
                    <div key={idx} className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/60">
                      • {obj.objection || JSON.stringify(obj)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lost Deals */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-rose-300 font-mono text-[11px] block">
                  Lost Deal Reasons ({doc.lost_deal_reasons?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {doc.lost_deal_reasons?.map((ld: any, idx: number) => (
                    <div key={idx} className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/60">
                      • {ld.reason || JSON.stringify(ld)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Requests */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-cyan-300 font-mono text-[11px] block">
                  Feature / Product Requests ({doc.product_requests?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {doc.product_requests?.map((pr: any, idx: number) => (
                    <div key={idx} className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/60">
                      • {pr.request || JSON.stringify(pr)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
