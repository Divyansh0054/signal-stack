import axios from 'axios';
import {
  Company,
  InterviewQuestion,
  InterviewStatus,
  Source,
  Competitor,
  IntelligenceSignal,
  Brief,
  InternalDocument,
  SchedulerStatus,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const apiClient = {
  // Companies
  getCompanies: () => api.get<Company[]>('/companies').then((res) => res.data),
  getCompany: (id: string) => api.get<Company>(`/companies/${id}`).then((res) => res.data),
  createCompany: (data: { name: string; website: string; current_focus?: string }) =>
    api.post<Company>('/companies', data).then((res) => res.data),
  updateCompany: (id: string, data: Partial<Company>) =>
    api.put<Company>(`/companies/${id}`, data).then((res) => res.data),

  // Interview
  getInterviewStatus: (companyId: string) =>
    api.get<InterviewStatus>(`/interview/${companyId}/status`).then((res) => res.data),
  getInterviewQuestions: (companyId: string) =>
    api.get<InterviewQuestion[]>(`/interview/${companyId}/questions`).then((res) => res.data),
  submitAnswer: (questionId: string, answer_text: string) =>
    api.post(`/interview/questions/${questionId}/answer`, { answer_text }).then((res) => res.data),
  updateAnswer: (answerId: string, answer_text: string) =>
    api.put(`/interview/answers/${answerId}`, { answer_text }).then((res) => res.data),
  skipQuestion: (questionId: string) =>
    api.post(`/interview/questions/${questionId}/skip`).then((res) => res.data),

  // Sources & Signal Stack
  getSources: (companyId: string, params?: { category?: string; status?: string; health?: string }) =>
    api.get<Source[]>(`/sources/${companyId}`, { params }).then((res) => res.data),
  addSource: (data: any) => api.post<Source>('/sources', data).then((res) => res.data),
  updateSourceStatus: (sourceId: string, status: string) =>
    api.put<Source>(`/sources/${sourceId}/status`, null, { params: { new_status: status } }).then((res) => res.data),
  deleteSource: (sourceId: string) => api.delete(`/sources/${sourceId}`).then((res) => res.data),
  getSignalStack: (companyId: string) =>
    api.get<any[]>(`/sources/${companyId}/signal-stack`).then((res) => res.data),
  getCompetitors: (companyId: string) =>
    api.get<Competitor[]>(`/sources/${companyId}/competitors`).then((res) => res.data),

  // Crawling
  triggerCrawl: (companyId: string) =>
    api.post(`/crawl/${companyId}`).then((res) => res.data),
  getCrawlHistory: (companyId: string) =>
    api.get<any[]>(`/crawl/${companyId}/history`).then((res) => res.data),

  // Signals
  getSignals: (companyId: string, params?: any) =>
    api.get<IntelligenceSignal[]>(`/signals/${companyId}`, { params }).then((res) => res.data),
  getSignalDetail: (signalId: string) =>
    api.get<IntelligenceSignal>(`/signals/detail/${signalId}`).then((res) => res.data),

  // Briefs
  generateBrief: (companyId: string, daysBack: number = 7) =>
    api.post<Brief>('/briefs/generate', { company_id: companyId, days_back: daysBack }).then((res) => res.data),
  getBriefs: (companyId: string) =>
    api.get<Brief[]>(`/briefs/${companyId}`).then((res) => res.data),
  getBriefDetail: (briefId: string) =>
    api.get<Brief>(`/briefs/detail/${briefId}`).then((res) => res.data),
  updateActionStatus: (actionId: string, status: string) =>
    api.put(`/briefs/actions/${actionId}`, null, { params: { new_status: status } }).then((res) => res.data),

  // Documents
  uploadDocument: (companyId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<InternalDocument>(`/documents/${companyId}/upload`, formData).then((res) => res.data);
  },
  getDocuments: (companyId: string) =>
    api.get<InternalDocument[]>(`/documents/${companyId}`).then((res) => res.data),

  // Automation & Adaptation
  getSchedulerStatus: (companyId?: string) =>
    api.get<SchedulerStatus>('/scheduler/status', { params: { company_id: companyId } }).then((res) => res.data),
  triggerManualBrief: (companyId: string) =>
    api.post(`/scheduler/run-brief/${companyId}`).then((res) => res.data),
  triggerManualAudit: (companyId: string) =>
    api.post(`/scheduler/run-audit/${companyId}`).then((res) => res.data),
  adaptContext: (companyId: string, new_context: string) =>
    api.post(`/adaptation/pivot/${companyId}`, { new_context }).then((res) => res.data),
  getAuditLogs: (companyId: string) =>
    api.get<any[]>(`/audit/logs/${companyId}`).then((res) => res.data),
};
