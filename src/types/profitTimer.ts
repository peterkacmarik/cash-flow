import { Scenario } from './scenario';

export interface ProfitTimerInputs {
    scenario: Scenario;
    rentGrowthType: 'percentage' | 'fixed';
    rentGrowthValue: number;
    expenseReductionType: 'percentage' | 'fixed';
    expenseReductionValue: number;
}

export interface MonthlyTimelineItem {
    month: number;
    year: number;
    rent: number;
    expenses: number;
    cashFlow: number;
    isPositive: boolean;
}

export interface ProfitTimerResult {
    monthsToPositive: number;
    yearsToPositive: number;
    monthlyTimeline: MonthlyTimelineItem[];
    finalCashFlow: number;
    isNeverPositive: boolean;
}

export interface ProfitTimerCalculation {
    id: string;
    name: string;
    scenarioId: string; // Reference to base scenario
    rentGrowthType: 'percentage' | 'fixed';
    rentGrowthValue: number;
    expenseReductionType: 'percentage' | 'fixed';
    expenseReductionValue: number;
    monthsToPositive: number;
    yearsToPositive: number;
    createdAt: string;
    updatedAt: string;
}
