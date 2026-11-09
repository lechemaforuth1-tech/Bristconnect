/**
 * BritConnect Canonical Schema & Data Dictionary Rules
 * Strictly derived from BritConnect_Data_Dictionary_44d6b12d.csv
 */

export interface FieldDefinition {
  no: number;
  name: string;
  dataType: 'Text' | 'Whole Number' | 'Decimal Number' | 'Date';
  description: string;
  isRequired: boolean;
  isPredictiveEligible: boolean;
  leakageRisk: 'None' | 'Target' | 'Outcome-Derived' | 'Identifier' | 'Post-Outcome';
  aliases: string[];
}

export const BRITCONNECT_COLUMNS: FieldDefinition[] = [
  {
    no: 1,
    name: 'Customer ID',
    dataType: 'Text',
    description: 'Unique identifier assigned to each customer.',
    isRequired: true,
    isPredictiveEligible: false,
    leakageRisk: 'Identifier',
    aliases: ['customer_id', 'cust_id', 'customer id', 'id', 'customerid', 'account_id']
  },
  {
    no: 2,
    name: 'Customer Segment',
    dataType: 'Text',
    description: 'Customer classification (e.g., Consumer or Small Business).',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['customer_segment', 'segment', 'customer segment', 'client_segment', 'tier']
  },
  {
    no: 3,
    name: 'Age',
    dataType: 'Whole Number',
    description: 'Customer age in years.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['age', 'customer_age', 'years_old']
  },
  {
    no: 4,
    name: 'Age Band',
    dataType: 'Text',
    description: 'Age grouping used for demographic analysis.',
    isRequired: false,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['age_band', 'age_group', 'age bracket', 'age_range']
  },
  {
    no: 5,
    name: 'Gender',
    dataType: 'Text',
    description: 'Recorded customer gender.',
    isRequired: false,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['gender', 'sex']
  },
  {
    no: 6,
    name: 'UK Nation',
    dataType: 'Text',
    description: 'UK constituent nation associated with the customer.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['uk_nation', 'nation', 'country', 'region', 'uk nation']
  },
  {
    no: 7,
    name: 'City',
    dataType: 'Text',
    description: 'Customer city.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['city', 'town', 'location', 'metro']
  },
  {
    no: 8,
    name: 'Acquisition Channel',
    dataType: 'Text',
    description: 'Channel through which the customer was acquired.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['acquisition_channel', 'channel', 'source', 'acquisition channel', 'lead_source']
  },
  {
    no: 9,
    name: 'Join Date',
    dataType: 'Date',
    description: 'Date the customer first joined BritConnect.',
    isRequired: true,
    isPredictiveEligible: false,
    leakageRisk: 'None',
    aliases: ['join_date', 'signup_date', 'joined', 'registration_date', 'join date']
  },
  {
    no: 10,
    name: 'Tenure Months',
    dataType: 'Whole Number',
    description: 'Length of customer relationship, in months.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['tenure_months', 'tenure', 'months_active', 'tenure months', 'length_of_service']
  },
  {
    no: 11,
    name: 'Service Type',
    dataType: 'Text',
    description: 'Telecommunications service subscribed to.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['service_type', 'service', 'product_type', 'service type', 'line_type']
  },
  {
    no: 12,
    name: 'Plan Name',
    dataType: 'Text',
    description: 'Name of the subscription package.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['plan_name', 'package', 'tariff', 'plan name', 'subscription_plan']
  },
  {
    no: 13,
    name: 'Contract Type',
    dataType: 'Text',
    description: 'Contract arrangement or term.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['contract_type', 'contract', 'term_length', 'contract type', 'agreement_type']
  },
  {
    no: 14,
    name: 'Contract Start Date',
    dataType: 'Date',
    description: 'Date the current contract began.',
    isRequired: false,
    isPredictiveEligible: false,
    leakageRisk: 'None',
    aliases: ['contract_start_date', 'start_date', 'contract start date']
  },
  {
    no: 15,
    name: 'Contract End Date',
    dataType: 'Date',
    description: 'Scheduled contract expiry date, where applicable.',
    isRequired: false,
    isPredictiveEligible: false,
    leakageRisk: 'None',
    aliases: ['contract_end_date', 'expiry_date', 'contract end date', 'end_date']
  },
  {
    no: 16,
    name: 'Auto Renew',
    dataType: 'Text',
    description: 'Whether the contract renews automatically.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['auto_renew', 'autorenew', 'auto-renew', 'auto renew', 'automatic_renewal']
  },
  {
    no: 17,
    name: 'Monthly Charge GBP',
    dataType: 'Decimal Number',
    description: 'Monthly subscription charge in GBP (£).',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['monthly_charge_gbp', 'monthly_charge', 'mrr', 'monthly charge gbp', 'charge_gbp', 'monthly_fee']
  },
  {
    no: 18,
    name: 'Average Monthly Usage GB',
    dataType: 'Decimal Number',
    description: 'Average monthly data usage in gigabytes.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['average_monthly_usage_gb', 'data_usage_gb', 'monthly_usage_gb', 'usage_gb', 'average monthly usage gb']
  },
  {
    no: 19,
    name: 'Data Allowance GB',
    dataType: 'Whole Number',
    description: 'Included monthly data allowance in gigabytes.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['data_allowance_gb', 'allowance_gb', 'cap_gb', 'data allowance gb', 'quota_gb']
  },
  {
    no: 20,
    name: 'Overage Charges GBP',
    dataType: 'Decimal Number',
    description: 'Additional usage charges in GBP (£).',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['overage_charges_gbp', 'overage_charges', 'overage_fee', 'overage charges gbp']
  },
  {
    no: 21,
    name: 'Discount Percent',
    dataType: 'Decimal Number',
    description: 'Discount percentage applied to the subscription.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['discount_percent', 'discount', 'discount_pct', 'discount percent', 'promo_discount']
  },
  {
    no: 22,
    name: 'Payment Method',
    dataType: 'Text',
    description: 'Customer payment method.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['payment_method', 'pay_method', 'billing_method', 'payment method']
  },
  {
    no: 23,
    name: 'Direct Debit',
    dataType: 'Text',
    description: 'Whether the customer pays by direct debit.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['direct_debit', 'directdebit', 'is_direct_debit', 'direct debit', 'dd_active']
  },
  {
    no: 24,
    name: 'Late Payments 12M',
    dataType: 'Whole Number',
    description: 'Number of late payments in the preceding 12 months.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['late_payments_12m', 'late_payments', 'late payments 12m', 'delinquency_count']
  },
  {
    no: 25,
    name: 'Failed Payments 12M',
    dataType: 'Whole Number',
    description: 'Number of failed payments in the preceding 12 months.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['failed_payments_12m', 'failed_payments', 'failed payments 12m', 'payment_failures']
  },
  {
    no: 26,
    name: 'Support Tickets 12M',
    dataType: 'Whole Number',
    description: 'Number of support tickets in the preceding 12 months.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['support_tickets_12m', 'support_tickets', 'tickets_12m', 'support tickets 12m', 'cases_12m']
  },
  {
    no: 27,
    name: 'Complaints 12M',
    dataType: 'Whole Number',
    description: 'Number of complaints in the preceding 12 months.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['complaints_12m', 'complaints', 'complaints 12m', 'escalations_12m']
  },
  {
    no: 28,
    name: 'Average Resolution Hours',
    dataType: 'Decimal Number',
    description: 'Average support issue resolution time in hours.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['average_resolution_hours', 'resolution_hours', 'avg_resolution_hrs', 'average resolution hours']
  },
  {
    no: 29,
    name: 'Network Outages 12M',
    dataType: 'Whole Number',
    description: 'Number of network outages in the preceding 12 months.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['network_outages_12m', 'outages_12m', 'network_issues', 'network outages 12m', 'downtime_events']
  },
  {
    no: 30,
    name: 'Satisfaction Score 1 10',
    dataType: 'Whole Number',
    description: 'Customer satisfaction score on a scale from 1 to 10.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['satisfaction_score_1_10', 'csat', 'satisfaction', 'satisfaction score', 'satisfaction score 1 10', 'csat_1_10']
  },
  {
    no: 31,
    name: 'NPS Score',
    dataType: 'Whole Number',
    description: 'Customer advocacy score recorded in the dataset.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['nps_score', 'nps', 'net_promoter_score', 'nps score']
  },
  {
    no: 32,
    name: 'Competitor Offer Received',
    dataType: 'Text',
    description: 'Whether the customer received an offer from a competitor.',
    isRequired: true,
    isPredictiveEligible: true,
    leakageRisk: 'None',
    aliases: ['competitor_offer_received', 'competitor_offer', 'competitor offer received', 'rival_offer']
  },
  {
    no: 33,
    name: 'Churn Status',
    dataType: 'Text',
    description: 'Recorded customer state: Active or Churned.',
    isRequired: true,
    isPredictiveEligible: false,
    leakageRisk: 'Target',
    aliases: ['churn_status', 'status', 'customer_status', 'churn status']
  },
  {
    no: 34,
    name: 'Churn Date',
    dataType: 'Date',
    description: 'Cancellation/churn date; typically blank for active customers.',
    isRequired: false,
    isPredictiveEligible: false,
    leakageRisk: 'Post-Outcome',
    aliases: ['churn_date', 'cancellation_date', 'termination_date', 'churn date']
  },
  {
    no: 35,
    name: 'Churn Reason',
    dataType: 'Text',
    description: 'Reason for cancellation; typically blank for active customers.',
    isRequired: false,
    isPredictiveEligible: false,
    leakageRisk: 'Post-Outcome',
    aliases: ['churn_reason', 'cancellation_reason', 'reason_for_leaving', 'churn reason']
  },
  {
    no: 36,
    name: 'Lifetime Revenue GBP',
    dataType: 'Decimal Number',
    description: 'Cumulative recorded revenue from the customer in GBP (£).',
    isRequired: true,
    isPredictiveEligible: false, // Excluded from churn prediction to prevent post-hoc bias
    leakageRisk: 'Outcome-Derived',
    aliases: ['lifetime_revenue_gbp', 'clv', 'ltv', 'lifetime_revenue', 'lifetime revenue gbp', 'cumulative_revenue']
  },
  {
    no: 37,
    name: 'Monthly Revenue At Risk GBP',
    dataType: 'Decimal Number',
    description: 'Estimated monthly revenue exposed to churn in GBP (£).',
    isRequired: true,
    isPredictiveEligible: false, // Target leakage: precomputed business metric
    leakageRisk: 'Outcome-Derived',
    aliases: ['monthly_revenue_at_risk_gbp', 'revenue_at_risk', 'monthly revenue at risk gbp', 'risk_revenue']
  },
  {
    no: 38,
    name: 'Churn Flag',
    dataType: 'Whole Number',
    description: 'Binary churn outcome: 1 = Churned, 0 = Active.',
    isRequired: true,
    isPredictiveEligible: false,
    leakageRisk: 'Target',
    aliases: ['churn_flag', 'churn', 'churned', 'is_churn', 'churn flag', 'target']
  }
];

/**
 * Matches a source column name to a canonical BritConnect field
 */
export function matchCanonicalColumn(rawHeader: string): FieldDefinition | undefined {
  const clean = rawHeader.trim().toLowerCase().replace(/[\s_\-]+/g, ' ');
  for (const def of BRITCONNECT_COLUMNS) {
    if (def.name.toLowerCase() === clean) return def;
    for (const alias of def.aliases) {
      if (alias.toLowerCase().replace(/[\s_\-]+/g, ' ') === clean) {
        return def;
      }
    }
  }
  return undefined;
}

/**
 * Calculates a rigorous, transparent Data Quality Score (0-100)
 */
export function calculateQualityScore(stats: {
  totalRecords: number;
  duplicateCount: number;
  missingFieldPercentages: { [field: string]: number };
  inconsistentTargetCount: number;
  invalidRangeCount: number;
}): number {
  if (stats.totalRecords === 0) return 0;

  // Penalties:
  // Completeness (up to 40 points)
  let totalMissingPct = 0;
  const criticalFields = ['Customer ID', 'Churn Flag', 'Monthly Charge GBP', 'Tenure Months', 'Contract Type'];
  for (const field of criticalFields) {
    totalMissingPct += (stats.missingFieldPercentages[field] || 0) * 4; // heavily penalize critical fields
  }
  const completenessScore = Math.max(0, 40 - totalMissingPct);

  // Uniqueness (up to 20 points)
  const dupPct = (stats.duplicateCount / stats.totalRecords) * 100;
  const uniquenessScore = Math.max(0, 20 - dupPct * 2);

  // Target Integrity (up to 25 points)
  const targetInconsistencyPct = (stats.inconsistentTargetCount / stats.totalRecords) * 100;
  const targetScore = Math.max(0, 25 - targetInconsistencyPct * 5);

  // Range and Validity (up to 15 points)
  const invalidRangePct = (stats.invalidRangeCount / stats.totalRecords) * 100;
  const validityScore = Math.max(0, 15 - invalidRangePct * 3);

  const finalScore = Math.round(completenessScore + uniquenessScore + targetScore + validityScore);
  return Math.min(100, Math.max(0, finalScore));
}
