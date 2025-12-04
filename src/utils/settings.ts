import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@cash_flow_settings';

export type Currency = 'CZK' | 'EUR' | 'USD';
export type Language = 'cs' | 'en' | 'sk';

export interface AppSettings {
    currency: Currency;
    language: Language;
    defaultValues?: {
        kupnaCena?: number;
        vlastneZdroje?: number;
        vyskaHypoteky?: number;
        urok?: number;
        dobaSplatnosti?: number;
        ocakavaneNajomne?: number;
        obsadenost?: number;
    };
}

const defaultSettings: AppSettings = {
    currency: 'CZK',
    language: 'cs',
};

/**
 * Načíta nastavenia z AsyncStorage
 */
export async function loadSettings(): Promise<AppSettings> {
    try {
        const data = await AsyncStorage.getItem(SETTINGS_KEY);
        if (data) {
            return { ...defaultSettings, ...JSON.parse(data) };
        }
        return defaultSettings;
    } catch (error) {
        console.error('Error loading settings:', error);
        return defaultSettings;
    }
}

/**
 * Uloží nastavenia do AsyncStorage
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
}

/**
 * Aktualizuje konkrétne nastavenie
 */
export async function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
): Promise<void> {
    try {
        const settings = await loadSettings();
        settings[key] = value;
        await saveSettings(settings);
    } catch (error) {
        console.error('Error updating setting:', error);
        throw error;
    }
}

/**
 * Vráti symbol meny
 */
export function getCurrencySymbol(currency: Currency): string {
    switch (currency) {
        case 'CZK':
            return 'Kč';
        case 'EUR':
            return '€';
        case 'USD':
            return '$';
        default:
            return 'Kč';
    }
}

/**
 * Vráti názov meny
 */
export function getCurrencyName(currency: Currency): string {
    switch (currency) {
        case 'CZK':
            return 'Czech Koruna';
        case 'EUR':
            return 'Euro';
        case 'USD':
            return 'US Dollar';
        default:
            return 'Czech Koruna';
    }
}
