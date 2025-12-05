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
};
