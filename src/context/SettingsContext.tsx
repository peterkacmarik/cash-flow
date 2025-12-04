import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, lightTheme, darkTheme } from '../theme/colors';

type Currency = 'CZK' | 'USD' | 'EUR';
type Language = 'sk' | 'cs' | 'en';
type Theme = 'light' | 'dark';

interface SettingsContextType {
    currency: Currency;
    language: Language;
    theme: Theme;
    colors: ThemeColors;
    updateCurrency: (currency: Currency) => Promise<void>;
    updateLanguage: (language: Language) => Promise<void>;
    toggleTheme: () => Promise<void>;
    isSettingsVisible: boolean;
    openSettings: () => void;
    closeSettings: () => void;
    dataVersion: number;
    notifyDataChanged: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>('EUR');
    const [language, setLanguage] = useState<Language>('sk');
    const [theme, setTheme] = useState<Theme>('light');
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [dataVersion, setDataVersion] = useState(0);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedCurrency = await AsyncStorage.getItem('currency');
            const savedLanguage = await AsyncStorage.getItem('language');
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedCurrency) setCurrency(savedCurrency as Currency);
            if (savedLanguage) setLanguage(savedLanguage as Language);
            if (savedTheme) setTheme(savedTheme as Theme);
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const updateCurrency = async (newCurrency: Currency) => {
        try {
            await AsyncStorage.setItem('currency', newCurrency);
            setCurrency(newCurrency);
        } catch (error) {
            console.error('Failed to save currency', error);
        }
    };

    const updateLanguage = async (newLanguage: Language) => {
        try {
            await AsyncStorage.setItem('language', newLanguage);
            setLanguage(newLanguage);
        } catch (error) {
            console.error('Failed to save language', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            await AsyncStorage.setItem('theme', newTheme);
            setTheme(newTheme);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const openSettings = () => setIsSettingsVisible(true);
    const closeSettings = () => setIsSettingsVisible(false);
    const notifyDataChanged = () => setDataVersion(v => v + 1);

    return (
        <SettingsContext.Provider value={{
            currency,
            language,
            theme,
            colors: theme === 'light' ? lightTheme : darkTheme,
            updateCurrency,
            updateLanguage,
            toggleTheme,
            isSettingsVisible,
            openSettings,
            closeSettings,
            dataVersion,
            notifyDataChanged
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
