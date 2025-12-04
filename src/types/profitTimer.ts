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
