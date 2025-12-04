import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyInputs } from './calculations';
import { Scenario } from '../types/scenario';

const SCENARIOS_KEY = '@cash_flow_scenarios';

/**
 * Uloží scenár do AsyncStorage
 */
export async function saveScenario(
    name: string,
    inputs: PropertyInputs
): Promise<Scenario> {
    try {
        const scenarios = await loadScenarios();

        const newScenario: Scenario = {
            id: Date.now().toString(),
            name,
            inputs,
            createdAt: new Date().toISOString(),
        };

        scenarios.push(newScenario);
        await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));

        return newScenario;
    } catch (error) {
        console.error('Error saving scenario:', error);
        throw error;
    }
}

/**
 * Načíta všetky scenáre z AsyncStorage
 */
export async function loadScenarios(): Promise<Scenario[]> {
    try {
        const data = await AsyncStorage.getItem(SCENARIOS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading scenarios:', error);
        return [];
    }
}

/**
 * Vymaže scenár podľa ID
 */
export async function deleteScenario(id: string): Promise<void> {
    try {
        const scenarios = await loadScenarios();
        const filtered = scenarios.filter(s => s.id !== id);
        await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting scenario:', error);
        throw error;
    }
}

/**
 * Premenuje scenár
 */
export async function renameScenario(id: string, newName: string): Promise<void> {
    try {
        const scenarios = await loadScenarios();
        const scenario = scenarios.find(s => s.id === id);

        if (scenario) {
            scenario.name = newName;
            await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
        } else {
            throw new Error('Scenario not found');
        }
    } catch (error) {
        console.error('Error renaming scenario:', error);
        throw error;
    }
}

/**
 * Aktualizuje existujúci scenár
 */
export async function updateScenario(
    id: string,
    inputs: PropertyInputs
): Promise<void> {
    try {
        const scenarios = await loadScenarios();
        const scenario = scenarios.find(s => s.id === id);

        if (scenario) {
            scenario.inputs = inputs;
            await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
        } else {
            throw new Error('Scenario not found');
        }
    } catch (error) {
        console.error('Error updating scenario:', error);
        throw error;
    }
}


/**
 * Získa konkrétny scenár podľa ID
 */
export async function getScenario(id: string): Promise<Scenario | null> {
    try {
        const scenarios = await loadScenarios();
        return scenarios.find(s => s.id === id) || null;
    } catch (error) {
        console.error('Error getting scenario:', error);
        return null;
    }
}



/**
 * Vymaže všetky scenáre
 */
export async function deleteAllScenarios(): Promise<void> {
    try {
        await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify([]));
    } catch (error) {
        console.error('Error deleting all scenarios:', error);
        throw error;
    }
}
