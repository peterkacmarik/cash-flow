import { Category, CategorySpending, Expense } from './expense';
import { ProfitTimerInputs, ProfitTimerResult } from './profitTimer';
import { CalculationResults, PropertyInputs } from '../utils/calculations';

export type ReportType = 'cashFlow' | 'profitTimer' | 'expenses';

export interface ExpensesReportInputs {
    expenses: Expense[];
    categories: Category[];
    categorySpending: CategorySpending[];
    currency: string;
    month: string;
}

export interface Report {
    id: string;
    name: string;
    scenarioName: string;
    type: ReportType;
    createdAt: string;
    fileUri?: string;
    inputs?: PropertyInputs | ProfitTimerInputs | ExpensesReportInputs;
    results?: CalculationResults | ProfitTimerResult;
}

export interface ReportMetadata {
    id: string;
    name: string;
    date: string;
    type: ReportType;
}
