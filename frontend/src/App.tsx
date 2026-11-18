import React, { useState, useEffect } from 'react';
import { Company, IntelligenceSignal, Brief, Source, InterviewStatus } from './types';
import { apiClient } from './api/client';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CompanySetupPage } from './pages/CompanySetupPage';
import { ProfilePage } from './pages/ProfilePage';
import { InterviewPage } from './pages/InterviewPage';
import { SignalStackPage } from './pages/SignalStackPage';
import { SourceManagerPage } from './pages/SourceManagerPage';
import { IntelligenceFeedPage } from './pages/IntelligenceFeedPage';
import { MondayBriefPage } from './pages/MondayBriefPage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { AutomationPage } from './pages/AutomationPage';

export function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load companies on initial render
  const loadCompanies = async () => {
    try {
      const data = await apiClient.getCompanies();
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        // Prefer MeetUniversity as default
        const meetUniv = data.find((c) => c.name.toLowerCase().includes('meetuniversity'));
        setSelectedCompany(meetUniv || data[0]);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  // Load selected company data
  const loadCompanyData = async (comp: Company) => {
    try {
      const [fullComp, sigData, briefData, srcData, intStatus] = await Promise.all([
        apiClient.getCompany(comp.id),
        apiClient.getSignals(comp.id),
        apiClient.getBriefs(comp.id),
        apiClient.getSources(comp.id),
        apiClient.getInterviewStatus(comp.id),
      ]);
      setSelectedCompany(fullComp);
      setSignals(sigData);
      setBriefs(briefData);
      setSources(srcData);
      setInterviewStatus(intStatus);
    } catch (err) {
      console.error('Error loading company data:', err);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany?.id) {
      loadCompanyData(selectedCompany);
    }
  }, [selectedCompany?.id]);

  const handleTriggerCrawl = async () => {
    if (!selectedCompany) return;
    setIsCrawling(true);
    try {
      await apiClient.triggerCrawl(selectedCompany.id);
      await loadCompanyData(selectedCompany);
    } catch (err: any) {
      alert(err.message || 'Crawl failed');
    } finally {
      setIsCrawling(false);
    }
  };

  const handleGenerateBrief = async () => {
    if (!selectedCompany) return;
    try {
      const newBrief = await apiClient.generateBrief(selectedCompany.id, 7);
      setBriefs([newBrief, ...briefs]);
      setActiveTab('brief');
    } catch (err: any) {
      alert(err.message || 'Brief generation failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        companies={companies}
        selectedCompany={selectedCompany}
        onSelectCompany={(comp) => {
          setSelectedCompany(comp);
          loadCompanyData(comp);
        }}
        onOpenCreateModal={() => setActiveTab('setup')}
        onTriggerCrawl={handleTriggerCrawl}
        isCrawling={isCrawling}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          interviewCompleted={interviewStatus?.is_completed}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              company={selectedCompany}
              signals={signals}
              briefs={briefs}
              sources={sources}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onGenerateBrief={handleGenerateBrief}
            />
          )}

          {activeTab === 'setup' && (
            <CompanySetupPage
              companies={companies}
              selectedCompany={selectedCompany}
              onSelectCompany={(comp) => {
                setSelectedCompany(comp);
                loadCompanyData(comp);
                setActiveTab('dashboard');
              }}
              onCompanyCreated={(newComp) => {
                setCompanies([newComp, ...companies]);
                setSelectedCompany(newComp);
                loadCompanyData(newComp);
                setActiveTab('interview');
              }}
            />
          )}

          {activeTab === 'profile' && <ProfilePage company={selectedCompany} />}

          {activeTab === 'interview' && (
            <InterviewPage
              company={selectedCompany}
              onInterviewComplete={() => {
                if (selectedCompany) loadCompanyData(selectedCompany);
              }}
            />
          )}

          {activeTab === 'signal_stack' && <SignalStackPage company={selectedCompany} />}

          {activeTab === 'sources' && <SourceManagerPage company={selectedCompany} />}

          {activeTab === 'feed' && <IntelligenceFeedPage company={selectedCompany} />}

          {activeTab === 'brief' && <MondayBriefPage company={selectedCompany} />}

          {activeTab === 'documents' && <DocumentUploadPage company={selectedCompany} />}

          {activeTab === 'automation' && (
            <AutomationPage
              company={selectedCompany}
              onRefreshData={() => {
                if (selectedCompany) loadCompanyData(selectedCompany);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
