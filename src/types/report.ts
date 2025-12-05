import { PropertyInputs, CalculationResults } from '../utils/calculations';
import { ProfitTimerInputs, ProfitTimerResult } from '../utils/profitTimer';

export type ReportType = 'cashFlow' | 'profitTimer';

export interface Report {
    id: string;
    name: string;
    scenarioName: string;
    type: ReportType;
    createdAt: string;
    fileUri?: string;
    inputs?: PropertyInputs | ProfitTimerInputs;
    results?: CalculationResults | ProfitTimerResult;
}

export interface ReportMetadata {
    id: string;
    name: string;
    scenarioName: string;
    createdAt: string;
}
