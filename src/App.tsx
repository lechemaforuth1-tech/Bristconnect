/**
 * BritConnect AI — Customer Churn Intelligence Platform
 * Main Application Component
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/common/FilterBar';
import { ExecutiveOverview } from './components/views/ExecutiveOverview';
import { DataManagement } from './components/views/DataManagement';
import { DataQualityView } from './components/views/DataQualityView';
import { ChurnAnalyticsView } from './components/views/ChurnAnalyticsView';
import { ChurnPredictionView } from './components/views/ChurnPredictionView';
import { CustomerSegmentationView } from './components/views/CustomerSegmentationView';
import { RevenueIntelligenceView } from './components/views/RevenueIntelligenceView';
import { RetentionIntelligenceView } from './components/views/RetentionIntelligenceView';
import { CampaignManagementView } from './components/views/CampaignManagementView';
import { ModelLaboratoryView } from './components/views/ModelLaboratoryView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { ReportsExportView } from './components/views/ReportsExportView';
import { SettingsView } from './components/views/SettingsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { AlertsCenterView } from './components/views/AlertsCenterView';
import { HelpDocsView } from './components/views/HelpDocsView';
import { CustomerRecord, DatasetMetadata, GlobalFilterState, UserRole } from './types';
import { applyGlobalFilters, computeDashboardKpis } from './services/calculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('Administrator');
  
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [records, setRecords] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [unreadAlertCount, setUnreadAlertCount] = useState(2);

  // Global Filter State
  const [filters, setFilters] = useState<GlobalFilterState>({
    customerSegment: '',
    ageBand: '',
    ukNation: '',
    city: '',
    serviceType: '',
    contractType: '',
    churnStatus: '',
    riskTier: '',
    searchQuery: ''
  });

  // Load Active Dataset on initial mount
  useEffect(() => {
    fetchActiveDataset();
  }, []);

  const fetchActiveDataset = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dataset/active');
      if (res.ok) {
        const data = await res.json();
        setMetadata(data.metadata);
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error('Error fetching active dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadSampleData = async () => {
    setIsReloading(true);
    try {
      const res = await fetch('/api/dataset/load-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploader: currentRole })
      });
      if (res.ok) {
        await fetchActiveDataset();
      }
    } catch (e) {
      alert('Failed to reset sample data.');
    } finally {
      setIsReloading(false);
    }
  };

  // Compute filtered records and centralized KPIs
  const filteredRecords = useMemo(() => {
    return applyGlobalFilters(records, filters);
  }, [records, filters]);

  const kpis = useMemo(() => {
    return computeDashboardKpis(filteredRecords);
  }, [filteredRecords]);

  // Tab Titles and Subtitles map
  const tabHeadings: Record<NavTab, { title: string; subtitle: string }> = {
    'overview': {
      title: 'Executive Overview',
      subtitle: 'Portfolio performance, monthly revenue at risk, and model-derived churn intelligence.'
    },
    'data-management': {
      title: 'Data Management & Ingestion',
      subtitle: 'Upload, validate against the 38-field canonical dictionary, clean, and manage persistent customer datasets.'
    },
    'data-quality': {
      title: 'Data Quality & Ingestion Audit',
      subtitle: 'Data quality scoring, range boundary validation, and target leakage prevention audit.'
    },
    'churn-analytics': {
      title: 'Descriptive Churn Analytics',
      subtitle: 'Deep-dive correlations across telecommunications services, payment methods, CSAT, and network outages.'
    },
    'churn-prediction': {
      title: 'Churn Prediction & Explainable AI',
      subtitle: 'Customer prospective churn scoring, local SHAP attribution drivers, and interactive what-if simulation.'
    },
    'segmentation': {
      title: 'Strategic Customer Segmentation',
      subtitle: 'Identify high-value at-risk cohorts, price-sensitive subscribers, and service-dissatisfied accounts.'
    },
    'revenue-intelligence': {
      title: 'Revenue & Commercial Intelligence',
      subtitle: 'Probability-weighted revenue exposure, subscriber ARPU, and retention campaign scenario calculator.'
    },
    'retention-intelligence': {
      title: 'Personalised Retention Intelligence',
      subtitle: 'Evidence-based operational playbooks, implementation sequences, and governance KPIs.'
    },
    'campaigns': {
      title: 'Retention Campaign Management',
      subtitle: 'Design, launch, and measure multi-channel retention initiatives and incremental causal uplift.'
    },
    'model-lab': {
      title: 'Machine Learning Model Laboratory',
      subtitle: 'Train, evaluate, and benchmark Logistic Regression, Random Forest, Gradient Boosting, and Baseline models.'
    },
    'ai-assistant': {
      title: 'BritConnect Intelligence Assistant',
      subtitle: 'Context-aware conversational analytics grounded strictly in active dataset numbers and ML outputs.'
    },
    'reports': {
      title: 'Reporting & Export Centre',
      subtitle: 'Downloadable executive briefing packs, multi-sheet Excel workbooks, and verified CSV exports.'
    },
    'settings': {
      title: 'Settings & Policy Configuration',
      subtitle: 'Adjust churn risk thresholds, commercial financial parameters, and UK GDPR data retention policies.'
    },
    'audit-logs': {
      title: 'System Audit Trail & Governance',
      subtitle: 'Immutable log of dataset ingestion, model training, scoring jobs, and configuration updates.'
    },
    'alerts': {
      title: 'Early Warning Surveillance & Alerts',
      subtitle: 'Real-time surveillance detecting network outages, payment friction, and contract expiry risks.'
    },
    'help-docs': {
      title: 'Help, Data Dictionary & Compliance',
      subtitle: 'Canonical 38-field dictionary specifications, calculation governance, and UK GDPR compliance guidelines.'
    }
  };

  const currentHeading = tabHeadings[activeTab] || tabHeadings.overview;

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-900 flex">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        unreadAlertCount={unreadAlertCount}
        currentRole={currentRole}
      />

      {/* Main Content Workspace */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Sticky Top Header */}
        <Header
          title={currentHeading.title}
          subtitle={currentHeading.subtitle}
          metadata={metadata}
          unreadAlertCount={unreadAlertCount}
          onOpenAlerts={() => setActiveTab('alerts')}
          onOpenAssistant={() => setActiveTab('ai-assistant')}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          onReloadSample={handleReloadSampleData}
          isReloading={isReloading}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Synchronized Global Filter Bar (shown on relevant analytical views) */}
          {(activeTab === 'overview' || activeTab === 'churn-analytics' || activeTab === 'churn-prediction' || activeTab === 'segmentation' || activeTab === 'revenue-intelligence') && (
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalRecords={records.length}
              filteredCount={filteredRecords.length}
            />
          )}

          {/* Active View Router */}
          {activeTab === 'overview' && (
            <ExecutiveOverview
              kpis={kpis}
              records={filteredRecords}
              onSelectCustomer={(id) => {
                setSelectedCustomerId(id);
                setActiveTab('churn-prediction');
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'data-management' && (
            <DataManagement
              activeMetadata={metadata}
              onDatasetUpdated={fetchActiveDataset}
            />
          )}

          {activeTab === 'data-quality' && (
            <DataQualityView
              metadata={metadata}
              records={records}
            />
          )}

          {activeTab === 'churn-analytics' && (
            <ChurnAnalyticsView
              records={filteredRecords}
            />
          )}

          {activeTab === 'churn-prediction' && (
            <ChurnPredictionView
              records={filteredRecords}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onNavigateToRetention={(id) => {
                setSelectedCustomerId(id);
                setActiveTab('retention-intelligence');
              }}
              onRefreshData={fetchActiveDataset}
            />
          )}

          {activeTab === 'segmentation' && (
            <CustomerSegmentationView
              records={filteredRecords}
              onTargetSegmentInCampaign={(seg) => {
                setActiveTab('campaigns');
              }}
              onFilterBySegment={(seg) => {
                setFilters(prev => ({ ...prev, customerSegment: seg.includes('Consumer') ? 'Consumer' : seg.includes('Small') ? 'Small Business' : '' }));
              }}
            />
          )}

          {activeTab === 'revenue-intelligence' && (
            <RevenueIntelligenceView
              kpis={kpis}
              records={filteredRecords}
            />
          )}

          {activeTab === 'retention-intelligence' && (
            <RetentionIntelligenceView
              records={filteredRecords}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onLaunchCampaignForRecommendation={() => {
                setActiveTab('campaigns');
              }}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignManagementView
              records={filteredRecords}
            />
          )}

          {activeTab === 'model-lab' && (
            <ModelLaboratoryView
              onRefreshData={fetchActiveDataset}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AiAssistantView
              metadata={metadata}
              kpis={kpis}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsExportView
              metadata={metadata}
              kpis={kpis}
              records={filteredRecords}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsView />
          )}

          {activeTab === 'alerts' && (
            <AlertsCenterView
              onSelectCustomer={(id) => {
                setSelectedCustomerId(id);
                setActiveTab('churn-prediction');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'help-docs' && (
            <HelpDocsView />
          )}
        </main>
      </div>
    </div>
  );
}
