/**
 * BritConnect Central Analytical & Financial Metric Governance Layer
 * Ensures strict, single-source-of-truth calculations across all dashboards and reports.
 */

import { CustomerRecord, GlobalFilterState } from '../types';

export interface DashboardKpis {
  totalCustomers: number;
  activeCustomers: number;
  churnedCustomers: number;
  historicalChurnRatePct: number;
  highOrCriticalRiskCount: number;
  highOrCriticalRiskPct: number;
  activeMrrGbp: number;
  monthlyRevenueAtRiskGbp: number;
  averageTenureMonths: number;
  averageSatisfactionScore: number;
  averageMonthlyChargeGbp: number;
  totalLifetimeRevenueGbp: number;
  npsScore: number;
  latePaymentRatePct: number;
  networkOutageAvg: number;
  expiringIn60DaysCount: number;
  expiringIn60DaysMrrGbp: number;
  expiringIn90DaysCount: number;
  expiringIn90DaysMrrGbp: number;
}

/**
 * Filter customer records based on global filter criteria
 */
export function applyGlobalFilters(records: CustomerRecord[], filters: GlobalFilterState): CustomerRecord[] {
  return records.filter(r => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchId = r['Customer ID'].toLowerCase().includes(q);
      const matchCity = r['City'].toLowerCase().includes(q);
      const matchPlan = r['Plan Name'].toLowerCase().includes(q);
      if (!matchId && !matchCity && !matchPlan) return false;
    }
    if (filters.customerSegment && r['Customer Segment'] !== filters.customerSegment) return false;
    if (filters.ageBand && r['Age Band'] !== filters.ageBand) return false;
    if (filters.ukNation && r['UK Nation'] !== filters.ukNation) return false;
    if (filters.city && r['City'] !== filters.city) return false;
    if (filters.serviceType && r['Service Type'] !== filters.serviceType) return false;
    if (filters.contractType && r['Contract Type'] !== filters.contractType) return false;
    if (filters.churnStatus && r['Churn Status'] !== filters.churnStatus) return false;
    if (filters.riskTier && r.riskTier !== filters.riskTier) return false;

    return true;
  });
}

/**
 * Central deterministic calculation of primary executive KPIs
 */
export function computeDashboardKpis(records: CustomerRecord[]): DashboardKpis {
  const totalCustomers = records.length;
  if (totalCustomers === 0) {
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      churnedCustomers: 0,
      historicalChurnRatePct: 0,
      highOrCriticalRiskCount: 0,
      highOrCriticalRiskPct: 0,
      activeMrrGbp: 0,
      monthlyRevenueAtRiskGbp: 0,
      averageTenureMonths: 0,
      averageSatisfactionScore: 0,
      averageMonthlyChargeGbp: 0,
      totalLifetimeRevenueGbp: 0,
      npsScore: 0,
      latePaymentRatePct: 0,
      networkOutageAvg: 0,
      expiringIn60DaysCount: 0,
      expiringIn60DaysMrrGbp: 0,
      expiringIn90DaysCount: 0,
      expiringIn90DaysMrrGbp: 0
    };
  }

  const activeRecords = records.filter(r => r['Churn Flag'] === 0 || r['Churn Status'] === 'Active');
  const churnedRecords = records.filter(r => r['Churn Flag'] === 1 || r['Churn Status'] === 'Churned');

  const activeCustomers = activeRecords.length;
  const churnedCustomers = churnedRecords.length;
  const historicalChurnRatePct = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;

  // High/Critical risk counts
  const highRiskRecords = activeRecords.filter(r => r.riskTier === 'High' || r.riskTier === 'Critical');
  const highOrCriticalRiskCount = highRiskRecords.length;
  const highOrCriticalRiskPct = activeCustomers > 0 ? (highOrCriticalRiskCount / activeCustomers) * 100 : 0;

  // Active MRR = Sum of recurring charges of active customers
  const activeMrrGbp = activeRecords.reduce((sum, r) => sum + (r['Monthly Charge GBP'] || 0), 0);

  // Probability-weighted revenue exposure = Sum(predictedChurnProb * Monthly Charge)
  // For un-scored active records, fallback to recorded Monthly Revenue At Risk GBP
  const monthlyRevenueAtRiskGbp = activeRecords.reduce((sum, r) => {
    if (r.predictedChurnProb !== undefined) {
      return sum + (r.predictedChurnProb * (r['Monthly Charge GBP'] || 0));
    }
    return sum + (r['Monthly Revenue At Risk GBP'] || (r['Monthly Charge GBP'] * 0.2));
  }, 0);

  // Averages
  const tenureSum = records.reduce((sum, r) => sum + (r['Tenure Months'] || 0), 0);
  const averageTenureMonths = tenureSum / totalCustomers;

  const satSum = records.reduce((sum, r) => sum + (r['Satisfaction Score 1 10'] || 0), 0);
  const averageSatisfactionScore = satSum / totalCustomers;

  const chargeSum = records.reduce((sum, r) => sum + (r['Monthly Charge GBP'] || 0), 0);
  const averageMonthlyChargeGbp = chargeSum / totalCustomers;

  const totalLifetimeRevenueGbp = records.reduce((sum, r) => sum + (r['Lifetime Revenue GBP'] || 0), 0);

  const npsSum = records.reduce((sum, r) => sum + (r['NPS Score'] || 0), 0);
  const npsScore = Math.round(npsSum / totalCustomers);

  const latePayers = records.filter(r => (r['Late Payments 12M'] || 0) > 0).length;
  const latePaymentRatePct = (latePayers / totalCustomers) * 100;

  const outagesSum = records.reduce((sum, r) => sum + (r['Network Outages 12M'] || 0), 0);
  const networkOutageAvg = outagesSum / totalCustomers;

  // Contract Expiry Horizons (60 Days and 90 Days)
  const refTime = new Date('2026-11-09T00:00:00Z').getTime();
  let expiringIn60DaysCount = 0;
  let expiringIn60DaysMrrGbp = 0;
  let expiringIn90DaysCount = 0;
  let expiringIn90DaysMrrGbp = 0;

  for (const r of activeRecords) {
    const charge = r['Monthly Charge GBP'] || 0;
    if (r['Contract Type'] === 'Month-to-Month') {
      expiringIn60DaysCount++;
      expiringIn60DaysMrrGbp += charge;
      expiringIn90DaysCount++;
      expiringIn90DaysMrrGbp += charge;
    } else if (r['Contract End Date']) {
      const endMs = new Date(r['Contract End Date']).getTime();
      const diffDays = Math.round((endMs - refTime) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 60) {
        expiringIn60DaysCount++;
        expiringIn60DaysMrrGbp += charge;
      }
      if (diffDays >= 0 && diffDays <= 90) {
        expiringIn90DaysCount++;
        expiringIn90DaysMrrGbp += charge;
      }
    }
  }

  return {
    totalCustomers,
    activeCustomers,
    churnedCustomers,
    historicalChurnRatePct: Number(historicalChurnRatePct.toFixed(1)),
    highOrCriticalRiskCount,
    highOrCriticalRiskPct: Number(highOrCriticalRiskPct.toFixed(1)),
    activeMrrGbp: Math.round(activeMrrGbp),
    monthlyRevenueAtRiskGbp: Math.round(monthlyRevenueAtRiskGbp),
    averageTenureMonths: Number(averageTenureMonths.toFixed(1)),
    averageSatisfactionScore: Number(averageSatisfactionScore.toFixed(1)),
    averageMonthlyChargeGbp: Number(averageMonthlyChargeGbp.toFixed(2)),
    totalLifetimeRevenueGbp: Math.round(totalLifetimeRevenueGbp),
    npsScore,
    latePaymentRatePct: Number(latePaymentRatePct.toFixed(1)),
    networkOutageAvg: Number(networkOutageAvg.toFixed(2)),
    expiringIn60DaysCount,
    expiringIn60DaysMrrGbp: Math.round(expiringIn60DaysMrrGbp),
    expiringIn90DaysCount,
    expiringIn90DaysMrrGbp: Math.round(expiringIn90DaysMrrGbp)
  };
}

/**
 * Currency formatter (£ GBP)
 */
export function formatGbp(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

/**
 * Percent formatter (%)
 */
export function formatPct(val: number, decimals = 1): string {
  return `${val.toFixed(decimals)}%`;
}

/**
 * Scenario financial calculator
 */
export interface ScenarioInputs {
  targetCustomerCount: number;
  averageMonthlyRevenueGbp: number;
  contactCostGbp: number;
  incentiveCostGbp: number;
  takeUpRatePct: number;
  incrementalEffectivenessPct: number;
  horizonMonths: number;
  grossMarginPct: number;
}

export interface ScenarioResults {
  totalCampaignCostGbp: number;
  expectedCustomersAccepting: number;
  expectedIncrementalRetained: number;
  grossRetainedRevenueGbp: number;
  grossRetainedMarginGbp: number;
  netFinancialBenefitGbp: number;
  roiPct: number;
}

export function calculateRetentionScenario(inputs: ScenarioInputs): ScenarioResults {
  const targeted = Math.max(1, inputs.targetCustomerCount);
  const contactExpense = targeted * inputs.contactCostGbp;
  
  const takeUpRatio = inputs.takeUpRatePct / 100;
  const customersAccepting = Math.round(targeted * takeUpRatio);
  const incentiveExpense = customersAccepting * inputs.incentiveCostGbp;
  
  const totalCampaignCostGbp = Math.round(contactExpense + incentiveExpense);
  
  // Incremental customers saved
  const incrementalRatio = inputs.incrementalEffectivenessPct / 100;
  const expectedIncrementalRetained = Math.round(customersAccepting * incrementalRatio);
  
  // Revenue over evaluation horizon
  const grossRetainedRevenueGbp = Math.round(
    expectedIncrementalRetained * inputs.averageMonthlyRevenueGbp * inputs.horizonMonths
  );
  
  const grossRetainedMarginGbp = Math.round(
    grossRetainedRevenueGbp * (inputs.grossMarginPct / 100)
  );
  
  const netFinancialBenefitGbp = grossRetainedMarginGbp - totalCampaignCostGbp;
  const roiPct = totalCampaignCostGbp > 0 ? Math.round((netFinancialBenefitGbp / totalCampaignCostGbp) * 100) : 0;

  return {
    totalCampaignCostGbp,
    expectedCustomersAccepting: customersAccepting,
    expectedIncrementalRetained,
    grossRetainedRevenueGbp,
    grossRetainedMarginGbp,
    netFinancialBenefitGbp,
    roiPct
  };
}
