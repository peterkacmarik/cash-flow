import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfitTimerCalculation } from '../types/profitTimer';

const PROFIT_TIMER_CALCULATIONS_KEY = '@profit_timer_calculations';

export const generateId = (): string => {
    return `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const saveProfitTimerCalculation = async (calculation: ProfitTimerCalculation): Promise<void> => {
    try {
        const calculations = await loadProfitTimerCalculations();
        const existingIndex = calculations.findIndex(c => c.id === calculation.id);

        if (existingIndex >= 0) {
            // Update existing
            calculations[existingIndex] = {
                ...calculation,
                updatedAt: new Date().toISOString(),
            };
        } else {
            // Add new
            calculations.push({
                ...calculation,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        await AsyncStorage.setItem(PROFIT_TIMER_CALCULATIONS_KEY, JSON.stringify(calculations));
    } catch (error) {
        console.error('Failed to save profit timer calculation:', error);
        throw error;
    }
};

export const loadProfitTimerCalculations = async (): Promise<ProfitTimerCalculation[]> => {
    try {
        const data = await AsyncStorage.getItem(PROFIT_TIMER_CALCULATIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load profit timer calculations:', error);
        return [];
    }
};

export const deleteProfitTimerCalculation = async (id: string): Promise<void> => {
    try {
        const calculations = await loadProfitTimerCalculations();
        const filtered = calculations.filter(c => c.id !== id);
        await AsyncStorage.setItem(PROFIT_TIMER_CALCULATIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete profit timer calculation:', error);
        throw error;
    }
};

export const renameProfitTimerCalculation = async (id: string, newName: string): Promise<void> => {
    try {
        const calculations = await loadProfitTimerCalculations();
        const calculation = calculations.find(c => c.id === id);

        if (calculation) {
            calculation.name = newName;
            calculation.updatedAt = new Date().toISOString();
            await AsyncStorage.setItem(PROFIT_TIMER_CALCULATIONS_KEY, JSON.stringify(calculations));
        }
    } catch (error) {
        console.error('Failed to rename profit timer calculation:', error);
        throw error;
    }
};

export const deleteAllProfitTimerCalculations = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(PROFIT_TIMER_CALCULATIONS_KEY);
    } catch (error) {
        console.error('Failed to delete all profit timer calculations:', error);
        throw error;
    }
};
