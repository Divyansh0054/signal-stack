export interface FactCitation {
  fact: string;
  citation_url: string;
  snippet: string;
}

export interface AssumptionItem {
  assumption: string;
  reason: string;
  needs_verification: boolean;
}

export interface ProductServiceItem {
  name: string;
  description: string;
  evidence?: string;
}

export interface CustomerSegmentItem {
  segment: string;
  description: string;
  evidence?: string;
}

export interface CompanyProfile {
  id: string;
  company_id: string;
  business_description?: string;
  products_services: ProductServiceItem[];
  customer_segments: CustomerSegmentItem[];
  geographic_markets: string[];
  positioning?: string;
  business_model?: string;
  strategic_themes: string[];
  verified_facts: FactCitation[];
  assumptions: AssumptionItem[];
  raw_research_summary?: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry?: string;
  current_focus?: string;
  created_at: string;
  updated_at: string;
  profile?: CompanyProfile;
}

export interface InterviewQuestion {
  id: string;
  company_id: string;
  question_order: number;
  question_text: string;
  question_category: string;
  context_rationale: string;
  is_confidential_eligible: boolean;
  is_skipped: boolean;
  is_followup: boolean;
  created_at: string;
  answer?: {
    id: string;
    answer_text: string;
    derived_insights: any[];
    is_edited: boolean;
    updated_at: string;
  };
}

export interface InterviewStatus {
  company_id: string;
  total_questions: number;
  answered_count: number;
  skipped_count: number;
  remaining_count: number;
  is_completed: boolean;
  current_question?: InterviewQuestion;
  structured_insights: any[];
}

export interface Source {
  id: string;
  company_id: string;
  name: string;
  url: string;
  category: 'Customers' | 'Competitors' | 'Market' | 'Internal';
  source_type: string;
  reason_for_inclusion: string;
  relevance_score: number;
  credibility_rating: string;
  expected_frequency: string;
  status: 'APPROVED' | 'PENDING' | 'DISABLED' | 'REJECTED';
  health_status: 'HEALTHY' | 'WARNING' | 'FAILED' | 'INACTIVE' | 'NEEDS_REVIEW';
  last_checked_at?: string;
  last_success_at?: string;
  last_failure_at?: string;
  consecutive_failures: number;
  last_http_status?: number;
  response_time_ms?: number;
  duplicate_count: number;
  failure_reason?: string;
  discovery_date: string;
  created_at: string;
}

export interface Competitor {
  id: string;
  company_id: string;
  name: string;
  website?: string;
  offering_summary?: string;
  competitor_type: string;
  why_it_matters: string;
  strengths?: string;
  vulnerabilities?: string;
  discovery_evidence?: string;
  is_active: boolean;
}

export interface IntelligenceSignal {
  id: string;
  company_id: string;
  title: string;
  summary: string;
  category: 'Customers' | 'Competitors' | 'Market' | 'Internal';
  source_name: string;
  source_url: string;
  publication_date?: string;
  discovery_date: string;
  evidence_snippet: string;
  verification_status: 'VERIFIED' | 'UNVERIFIED' | 'OFFICIAL';
  evidence_strength: string;
  source_reliability: string;
  strategic_relevance: number;
  business_impact: number;
  urgency: number;
  novelty: number;
  opportunity_threat: 'OPPORTUNITY' | 'THREAT' | 'NEUTRAL';
  affected_business_area: string;
  why_it_matters: string;
  recommended_action: string;
  overall_priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ranking_score: number;
  ranking_explanation: string;
  created_at: string;
}

export interface Brief {
  id: string;
  company_id: string;
  title: string;
  generated_at: string;
  monitoring_start: string;
  monitoring_end: string;
  executive_summary: any[];
  customer_signals: any[];
  competitor_intelligence: any[];
  market_intelligence: any[];
  internal_intelligence: any[];
  opportunities_identified: any[];
  risks_and_threats: any[];
  recommended_actions: any[];
  what_we_should_watch: any[];
  source_appendix: any[];
  raw_markdown: string;
  is_delivered: boolean;
}

export interface InternalDocument {
  id: string;
  company_id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  extracted_summary?: string;
  objections: any[];
  lost_deal_reasons: any[];
  product_requests: any[];
  sales_patterns: any[];
  emerging_risks: any[];
  uploaded_at: string;
}

export interface SchedulerStatus {
  scheduler_running: boolean;
  timezone: string;
  registered_jobs: {
    id: string;
    name: string;
    next_run_time?: string;
  }[];
  job_records: {
    id: string;
    job_type: string;
    company_id?: string;
    last_run_at?: string;
    next_run_at?: string;
    status: string;
    last_execution_status?: string;
    error_message?: string;
  }[];
}
