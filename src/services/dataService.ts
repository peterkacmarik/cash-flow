import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { PropertyInputs } from '../utils/calculations';
import { Scenario } from '../types/scenario';

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

            // Merge logic: DB custom vs Defaults
            const dbCategories = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                icon: item.icon,
                color: item.color,
                budget: item.budget,
                isCustom: item.is_custom,
            }));

            const merged = [...dbCategories];

            // Add defaults that are not present in DB
            defaultCategories.forEach(defCat => {
                if (!merged.find(c => c.id === defCat.id)) {
                    merged.push(defCat);
                }
            });

            return merged;
        } else {
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
};
