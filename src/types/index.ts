/**
 * BritConnect AI — Customer Churn Intelligence Platform
 * Core TypeScript Interfaces and Types
 */

export type RiskTier = 'Low' | 'Moderate' | 'High' | 'Critical';

export type UserRole = 
  | 'Administrator' 
  | 'Data Scientist' 
  | 'Executive' 
  | 'Retention Manager' 
  | 'Marketing Analyst' 
  | 'Read-Only User';

export interface CustomerRecord {
  // 1. Demographics
  'Customer ID': string;
  'Customer Segment': 'Consumer' | 'Small Business' | 'Enterprise';
  'Age': number;
  'Age Band': string;
  'Gender': string;
  'UK Nation': 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';
  'City': string;
  'Acquisition Channel': string;

  // 2. Contract & Subscription
  'Join Date': string;
  'Tenure Months': number;
  'Service Type': string;
  'Plan Name': string;
  'Contract Type': 'Month-to-Month' | '12 Month Contract' | '24 Month Contract' | '36 Month Contract';
  'Contract Start Date': string;
  'Contract End Date': string;
  'Auto Renew': 'Yes' | 'No';

  // 3. Revenue & Usage
  'Monthly Charge GBP': number;
  'Average Monthly Usage GB': number;
  'Data Allowance GB': number;
  'Overage Charges GBP': number;
  'Discount Percent': number;
  'Payment Method': string;
  'Direct Debit': 'Yes' | 'No';
  'Late Payments 12M': number;
  'Failed Payments 12M': number;

  // 4. Customer Experience
  'Support Tickets 12M': number;
  'Complaints 12M': number;
  'Average Resolution Hours': number;
  'Network Outages 12M': number;
  'Satisfaction Score 1 10': number;
  'NPS Score': number;
  'Competitor Offer Received': 'Yes' | 'No';

  // 5. Churn & Outcomes
  'Churn Status': 'Active' | 'Churned';
  'Churn Date'?: string | null;
  'Churn Reason'?: string | null;
  'Lifetime Revenue GBP': number;
  'Monthly Revenue At Risk GBP': number;
  'Churn Flag': 0 | 1;

  // Model-Derived Scored Attributes (optional when scored)
  predictedChurnProb?: number;
  riskTier?: RiskTier;
  riskDrivers?: { feature: string; impact: number; description: string; direction: 'increases_risk' | 'reduces_risk' }[];
  scoredAt?: string;
  modelVersion?: string;
}

export interface DatasetMetadata {
  id: string;
  version: string;
  filename: string;
  uploadedAt: string;
  uploader: string;
  rowCount: number;
  activeCount: number;
  churnedCount: number;
  fieldCount: number;
  dataQualityScore: number;
  validationStatus: 'Valid' | 'Warnings' | 'Invalid';
  cleaningStatus: 'Raw' | 'Cleaned';
  checksum: string;
  isActive: boolean;
  notes?: string;
}

export interface DataQualityReport {
  initialCount: number;
  usableCount: number;
  duplicatesRemoved: number;
  missingValuesImputed: number;
  outliersCapped: number;
  inconsistenciesResolved: number;
  qualityScore: number;
  fieldSummaries: {
    column: string;
    completeness: number;
    dataType: string;
    missingCount: number;
    issuesFound: string[];
    transformationApplied?: string;
  }[];
}

export interface ModelMetrics {
  algorithm: 'Logistic Regression' | 'Random Forest' | 'Gradient Boosting' | 'Rule Baseline';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  confusionMatrix: {
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    truePositive: number;
  };
  rocCurve: { fpr: number; tpr: number }[];
  prCurve: { recall: number; precision: number }[];
  featureImportance: { feature: string; importance: number; direction: 'increases_risk' | 'reduces_risk'; description: string }[];
  trainingDurationMs: number;
  isChampion: boolean;
  version: string;
  trainedAt: string;
  trainSampleSize: number;
  testSampleSize: number;
}

export interface RetentionRecommendation {
  id: string;
  title: string;
  targetCustomerOrSegment: string;
  customerId?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  responsibleTeam: 'Customer Experience' | 'Retention' | 'Billing' | 'Technical Support' | 'Marketing';
  suggestedTimeline: string;
  estimatedCostGbp: number;
  expectedBusinessImpact: string;
  riskDiagnosis: string;
  businessObjective: string;
  recommendedAction: string;
  implementationSteps: string[];
  measurableKpis: string[];
  measurementApproach: string;
  supportingEvidence: string[];
  status: 'Pending Review' | 'Approved' | 'In Progress' | 'Completed' | 'Dismissed';
}

export interface CampaignRecord {
  id: string;
  name: string;
  description: string;
  objective: string;
  targetSegment: string;
  riskTier: RiskTier;
  channel: 'Email' | 'Telesales VIP' | 'SMS Direct' | 'Direct Mail' | 'App In-Box' | 'Account Manager';
  startDate: string;
  endDate: string;
  budgetGbp: number;
  assignedOwner: string;
  offerType: 'Discount 20%' | 'Speed Upgrade' | 'Hardware Wi-Fi 6' | 'Contract Extension Bonus' | 'VIP Care Concierge';
  status: 'Planning' | 'Active' | 'Completed' | 'Paused';
  customersTargeted: number;
  customersContacted: number;
  contactRatePct: number;
  offersAccepted: number;
  acceptanceRatePct: number;
  spendGbp: number;
  observedRetentionPct: number;
  retainedRevenueGbp: number;
  estimatedRoiPct: number;
  incrementalUpliftPct: number;
}

export interface AlertItem {
  id: string;
  alertType: 'Critical High-Value Risk' | 'Contract Expiry Exposure' | 'Repeat Complaints' | 'Network Outage Flare' | 'Payment Failure Spike' | 'Model Drift';
  severity: 'Critical' | 'High' | 'Medium' | 'Info';
  affectedCustomerOrSegment: string;
  triggerCondition: string;
  timestamp: string;
  suggestedAction: string;
  assignedOwner: string;
  status: 'Unread' | 'Acknowledged' | 'Resolved';
}

export interface AppSettings {
  riskThresholds: {
    lowMax: number;
    moderateMax: number;
    highMax: number;
  };
  financialAssumptions: {
    grossMarginPct: number;
    averageContactCostGbp: number;
    defaultIncentiveCostGbp: number;
    discountRatePct: number;
  };
  retentionPolicyDays: number;
  enableGeminiAI: boolean;
  autoChampionSelection: boolean;
}

export interface GlobalFilterState {
  customerSegment: string;
  ageBand: string;
  ukNation: string;
  city: string;
  serviceType: string;
  contractType: string;
  churnStatus: string;
  riskTier: string;
  searchQuery: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'Dataset' | 'Model' | 'Campaign' | 'Security' | 'Export';
  details: string;
}
