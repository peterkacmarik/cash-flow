import { Scenario } from '../types/scenario';
import { calculateCashFlow } from './calculations';

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

const MAX_MONTHS = 600; // 50 years limit

export const calculateTimeToPositive = (inputs: ProfitTimerInputs): ProfitTimerResult => {
    const { scenario, rentGrowthType, rentGrowthValue, expenseReductionType, expenseReductionValue } = inputs;

    // Initial calculation to get base values
    let currentInputs = { ...scenario.inputs };
    let currentResults = calculateCashFlow(currentInputs);

    // If already positive, return 0
    if (currentResults.mesacnyCashFlow >= 0) {
        return {
            monthsToPositive: 0,
            yearsToPositive: 0,
            monthlyTimeline: [{
                month: 0,
                year: 0,
                rent: currentResults.efektivneNajomne,
                expenses: currentResults.celkoveMesacneNaklady + currentResults.mesacnaSplatkaHypoteky,
                cashFlow: currentResults.mesacnyCashFlow,
                isPositive: true
            }],
            finalCashFlow: currentResults.mesacnyCashFlow,
            isNeverPositive: false
        };
    }

    const timeline: MonthlyTimelineItem[] = [];
    let month = 0;

    // Base monthly values
    let currentRent = currentResults.efektivneNajomne;
    let currentOperatingExpenses = currentResults.celkoveMesacneNaklady;
    const mortgagePayment = currentResults.mesacnaSplatkaHypoteky;

    while (month < MAX_MONTHS) {
        month++;

        // Apply changes annually (at the start of each new year, i.e., after every 12 months)
        if (month % 12 === 0) {
            // Apply Rent Growth
            if (rentGrowthType === 'percentage') {
                currentRent = currentRent * (1 + (rentGrowthValue / 100));
            } else {
                currentRent += rentGrowthValue;
            }

            // Apply Expense Reduction (only to operating expenses)
            if (expenseReductionType === 'percentage') {
                currentOperatingExpenses = currentOperatingExpenses * (1 - (expenseReductionValue / 100));
            } else {
                currentOperatingExpenses -= expenseReductionValue;
                if (currentOperatingExpenses < 0) currentOperatingExpenses = 0;
            }
        }

        const totalExpenses = currentOperatingExpenses + mortgagePayment;
        const cashFlow = currentRent - totalExpenses;

        timeline.push({
            month,
            year: parseFloat((month / 12).toFixed(1)),
            rent: Math.round(currentRent),
            expenses: Math.round(totalExpenses),
            cashFlow: Math.round(cashFlow),
            isPositive: cashFlow >= 0
        });

        if (cashFlow >= 0) {
            return {
                monthsToPositive: month,
                yearsToPositive: parseFloat((month / 12).toFixed(1)),
                monthlyTimeline: timeline,
                finalCashFlow: Math.round(cashFlow),
                isNeverPositive: false
            };
        }
    }

    return {
        monthsToPositive: MAX_MONTHS,
        yearsToPositive: MAX_MONTHS / 12,
        monthlyTimeline: timeline,
        finalCashFlow: Math.round(currentRent - (currentOperatingExpenses + mortgagePayment)),
        isNeverPositive: true
    };
};
