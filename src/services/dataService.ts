import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { PropertyInputs } from '../utils/calculations';
import { Scenario } from '../types/scenario';
import { Report } from '../types/report';
import * as FileSystem from 'expo-file-system/legacy';

const LOCAL_STORAGE_KEY = '@cash_flow_scenarios';

export const dataService = {
    // Save a new scenario
    async saveScenario(name: string, inputs: PropertyInputs, userId?: string): Promise<Scenario> {
        const tempId = Date.now().toString(); // Temporary ID, will be replaced by DB ID for authenticated users
        const newScenario: Scenario = {
            id: tempId,
            name,
            inputs,
            createdAt: new Date().toISOString(),
        };

        if (userId) {
            // Authenticated: Save to Supabase
            const { data, error } = await supabase
                .from('cashflow_scenarios')
                .insert({
                    user_id: userId,
                    name: newScenario.name,
                    inputs: newScenario.inputs,
                })
                .select()
                .single();

            if (error) {
                console.error('Error saving to Supabase:', error);
                throw error;
            }

            // Map Supabase response to Scenario type if needed, or use returned data
            return {
                id: data.id,
                name: data.name,
                inputs: data.inputs,
                createdAt: data.created_at,
            };
        } else {
            // Guest: Save to Local Storage
            const scenarios = await this.getScenarios();
            scenarios.push(newScenario);
            await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenarios));
            return newScenario;
        }
    },

    // Load all scenarios
    async getScenarios(userId?: string): Promise<Scenario[]> {
        if (userId) {
            // Authenticated: Load from Supabase
            const { data, error } = await supabase
                .from('cashflow_scenarios')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading from Supabase:', error);
                throw error;
            }

            return data.map((item: any) => ({
                id: item.id,
                name: item.name,
                inputs: item.inputs,
                createdAt: item.created_at,
            }));
        } else {
            // Guest: Load from Local Storage
            try {
                const data = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('Error loading local scenarios:', error);
                return [];
            }
        }
    },

    // Delete a scenario
    async deleteScenario(id: string, userId?: string): Promise<void> {
        if (userId) {
            // Authenticated: Delete from Supabase
            const { error } = await supabase
                .from('cashflow_scenarios')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting from Supabase:', error);
                throw error;
            }
        } else {
            // Guest: Delete from Local Storage
            const scenarios = await this.getScenarios();
            const filtered = scenarios.filter(s => s.id !== id);
            await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
        }
    },

    // Update a scenario
    async updateScenario(id: string, inputs: PropertyInputs, userId?: string): Promise<void> {
        if (userId) {
            // Authenticated: Update Supabase
            const { error } = await supabase
                .from('cashflow_scenarios')
                .update({ inputs, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) {
                console.error('Error updating Supabase:', error);
                throw error;
            }
        } else {
            // Guest: Update Local Storage
            const scenarios = await this.getScenarios();
            const scenario = scenarios.find(s => s.id === id);
            if (scenario) {
                scenario.inputs = inputs;
                await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenarios));
            }
        }
    },

    // Rename a scenario
    async renameScenario(id: string, newName: string, userId?: string): Promise<void> {
        if (userId) {
            // Authenticated: Rename in Supabase
            const { error } = await supabase
                .from('cashflow_scenarios')
                .update({ name: newName, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) {
                console.error('Error renaming in Supabase:', error);
                throw error;
            }
        } else {
            // Guest: Rename in Local Storage
            const scenarios = await this.getScenarios();
            const scenario = scenarios.find(s => s.id === id);
            if (scenario) {
                scenario.name = newName;
                await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenarios));
            }
        }
    },

    // Delete all scenarios
    async deleteAllScenarios(userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('cashflow_scenarios')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting all scenarios from Supabase:', error);
                throw error;
            }
        } else {
            await AsyncStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    },

    // --- EXPENSES ---

    async getExpenses(userId?: string): Promise<any[]> {
        if (userId) {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Error loading expenses from Supabase:', error);
                throw error;
            }
            return data.map(item => ({
                id: item.id,
                amount: item.amount,
                category: item.category,
                date: item.date,
                description: item.description,
                createdAt: item.created_at,
            }));
        } else {
            try {
                const data = await AsyncStorage.getItem('@expenses');
                return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('Failed to load local expenses', error);
                return [];
            }
        }
    },

    async saveExpense(expense: any, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('expenses')
                .insert({
                    user_id: userId,
                    amount: expense.amount,
                    category: expense.category,
                    date: expense.date,
                    description: expense.description,
                });

            if (error) {
                console.error('Error saving expense to Supabase:', error);
                throw error;
            }
        } else {
            const expenses = await this.getExpenses();
            // Handle update vs insert for local storage
            const existingIndex = expenses.findIndex((e: any) => e.id === expense.id);
            if (existingIndex >= 0) {
                expenses[existingIndex] = expense;
            } else {
                expenses.push(expense);
            }
            await AsyncStorage.setItem('@expenses', JSON.stringify(expenses));
        }
    },

    async deleteExpense(id: string, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
        } else {
            const expenses = await this.getExpenses();
            const filtered = expenses.filter((e: any) => e.id !== id);
            await AsyncStorage.setItem('@expenses', JSON.stringify(filtered));
        }
    },

    async deleteAllExpenses(userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting all expenses from Supabase:', error);
                throw error;
            }
        } else {
            await AsyncStorage.removeItem('@expenses');
        }
    },

    // --- CATEGORIES ---

    async getCategories(userId?: string): Promise<any[]> {
        const defaultCategories = [
            { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B', budget: 0, isCustom: false },
            { id: 'transport', name: 'Transportation', icon: '🚗', color: '#4ECDC4', budget: 0, isCustom: false },
            { id: 'housing', name: 'Housing', icon: '🏠', color: '#45B7D1', budget: 0, isCustom: false },
            { id: 'healthcare', name: 'Healthcare', icon: '💊', color: '#96CEB4', budget: 0, isCustom: false },
            { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#FFEAA7', budget: 0, isCustom: false },
            { id: 'shopping', name: 'Shopping', icon: '👕', color: '#DFE6E9', budget: 0, isCustom: false },
            { id: 'education', name: 'Education', icon: '📚', color: '#74B9FF', budget: 0, isCustom: false },
            { id: 'savings', name: 'Savings', icon: '💰', color: '#55EFC4', budget: 0, isCustom: false },
            { id: 'gifts', name: 'Gifts', icon: '🎁', color: '#FD79A8', budget: 0, isCustom: false },
            { id: 'bills', name: 'Bills', icon: '📱', color: '#A29BFE', budget: 0, isCustom: false },
        ];

        if (userId) {
            const { data, error } = await supabase.from('categories').select('*');
            if (error) throw error;

            // Return only DB categories for logged-in users
            return data.map((item: any) => ({
                id: item.id,
                name: item.name,
                icon: item.icon,
                color: item.color,
                budget: item.budget,
                isCustom: item.is_custom,
            }));
        } else {
            // Guest mode: use default categories from AsyncStorage
            try {
                const data = await AsyncStorage.getItem('@categories');
                if (data) return JSON.parse(data);
                await AsyncStorage.setItem('@categories', JSON.stringify(defaultCategories));
                return defaultCategories;
            } catch (error) {
                return defaultCategories;
            }
        }
    },

    async saveCategory(category: any, userId?: string): Promise<void> {
        if (userId) {
            // Upsert based on ID
            const { error } = await supabase
                .from('categories')
                .upsert({
                    id: category.id,
                    user_id: userId,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    budget: category.budget,
                    is_custom: category.isCustom,
                    updated_at: new Date().toISOString(),
                });
            if (error) throw error;
        } else {
            const categories = await this.getCategories();
            const existingIndex = categories.findIndex((c: any) => c.id === category.id);
            if (existingIndex >= 0) {
                categories[existingIndex] = category;
            } else {
                categories.push(category);
            }
            await AsyncStorage.setItem('@categories', JSON.stringify(categories));
        }
    },

    async deleteCategory(id: string, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
        } else {
            const categories = await this.getCategories();
            const filtered = categories.filter((c: any) => c.id !== id);
            await AsyncStorage.setItem('@categories', JSON.stringify(filtered));
        }
    },

    // --- PROFIT TIMER ---

    async getProfitTimers(userId?: string): Promise<any[]> {
        if (userId) {
            const { data, error } = await supabase
                .from('profit_timer_calculations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading profit timers from Supabase:', error);
                throw error;
            }
            return data.map(item => ({
                id: item.id,
                name: item.name,
                scenarioId: item.scenario_id,
                rentGrowthType: item.rent_growth_type,
                rentGrowthValue: item.rent_growth_value,
                expenseReductionType: item.expense_reduction_type,
                expenseReductionValue: item.expense_reduction_value,
                monthsToPositive: item.months_to_positive,
                yearsToPositive: item.years_to_positive,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            }));
        } else {
            try {
                const data = await AsyncStorage.getItem('@profit_timer_calculations');
                return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('Failed to load local profit timers', error);
                return [];
            }
        }
    },

    async saveProfitTimer(calculation: any, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('profit_timer_calculations')
                .upsert({
                    id: calculation.id, // Will be ignored on insert if we rely on default gen, but beneficial for explicit updates if ID matches
                    user_id: userId,
                    name: calculation.name,
                    scenario_id: calculation.scenarioId,
                    rent_growth_type: calculation.rentGrowthType,
                    rent_growth_value: calculation.rentGrowthValue,
                    expense_reduction_type: calculation.expenseReductionType,
                    expense_reduction_value: calculation.expenseReductionValue,
                    months_to_positive: calculation.monthsToPositive,
                    years_to_positive: calculation.yearsToPositive,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Error saving profit timer to Supabase:', error);
                throw error;
            }
        } else {
            const calculations = await this.getProfitTimers();
            const existingIndex = calculations.findIndex((c: any) => c.id === calculation.id);
            if (existingIndex >= 0) {
                calculations[existingIndex] = calculation;
            } else {
                calculations.push(calculation);
            }
            await AsyncStorage.setItem('@profit_timer_calculations', JSON.stringify(calculations));
        }
    },

    async deleteProfitTimer(id: string, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase.from('profit_timer_calculations').delete().eq('id', id);
            if (error) throw error;
        } else {
            const calculations = await this.getProfitTimers();
            const filtered = calculations.filter((c: any) => c.id !== id);
            await AsyncStorage.setItem('@profit_timer_calculations', JSON.stringify(filtered));
        }
    },

    async renameProfitTimer(id: string, newName: string, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('profit_timer_calculations')
                .update({ name: newName, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } else {
            const calculations = await this.getProfitTimers();
            const calc = calculations.find((c: any) => c.id === id);
            if (calc) {
                calc.name = newName;
                await AsyncStorage.setItem('@profit_timer_calculations', JSON.stringify(calculations));
            }
        }
    },

    async deleteAllProfitTimers(userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('profit_timer_calculations')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            await AsyncStorage.removeItem('@profit_timer_calculations');
        }
    },

    async deleteAllReports(userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('reports')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting all reports from Supabase:', error);
                throw error;
            }
        } else {
            const reports = await this.getReports();
            for (const report of reports) {
                if (report.fileUri) {
                    try {
                        await FileSystem.deleteAsync(report.fileUri, { idempotent: true });
                    } catch (fileError) {
                        console.error('Error deleting PDF file:', fileError);
                    }
                }
            }
            await AsyncStorage.removeItem('@cash_flow_reports');
        }
    },

    // --- REPORTS ---

    async getReports(userId?: string): Promise<Report[]> {
        if (userId) {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading reports from Supabase:', error);
                throw error;
            }
            return data.map((item: any) => ({
                id: item.id,
                name: item.name,
                scenarioName: item.scenario_name,
                type: item.type || 'cashFlow', // Default for backward compatibility
                inputs: item.inputs,
                results: item.results,
                createdAt: item.created_at,
            }));
        } else {
            try {
                const data = await AsyncStorage.getItem('@cash_flow_reports');
                return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('Failed to load local reports', error);
                return [];
            }
        }
    },

    async saveReport(report: Report, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('reports')
                .insert({
                    user_id: userId,
                    name: report.name,
                    scenario_name: report.scenarioName,
                    type: report.type || 'cashFlow',
                    inputs: report.inputs,
                    results: report.results,
                });

            if (error) {
                console.error('Error saving report to Supabase:', error);
                throw error;
            }
        } else {
            const reports = await this.getReports();
            // Assign type if missing (backward compatibility for existing local reports)
            const newReport = { ...report, type: report.type || 'cashFlow' };
            reports.push(newReport);
            await AsyncStorage.setItem('@cash_flow_reports', JSON.stringify(reports));
        }
    },

    async deleteReport(id: string, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase.from('reports').delete().eq('id', id);
            if (error) throw error;
        } else {
            const reports = await this.getReports();
            const reportToDelete = reports.find(r => r.id === id);

            if (reportToDelete && reportToDelete.fileUri) {
                try {
                    await FileSystem.deleteAsync(reportToDelete.fileUri, { idempotent: true });
                } catch (fileError) {
                    console.error('Error deleting PDF file:', fileError);
                }
            }

            const filtered = reports.filter(r => r.id !== id);
            await AsyncStorage.setItem('@cash_flow_reports', JSON.stringify(filtered));
        }
    },

    async renameReport(id: string, newName: string, userId?: string): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('reports')
                .update({ name: newName, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } else {
            const reports = await this.getReports();
            const updatedReports = reports.map(r =>
                r.id === id ? { ...r, name: newName } : r
            );
            await AsyncStorage.setItem('@cash_flow_reports', JSON.stringify(updatedReports));
        }
    },
};
