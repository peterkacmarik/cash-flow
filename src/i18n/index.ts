import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import cs from './locales/cs';
import en from './locales/en';
import sk from './locales/sk';

const LANGUAGE_KEY = '@cash_flow_language';

const resources = {
    cs: { translation: cs },
    en: { translation: en },
    sk: { translation: sk },
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (!savedLanguage) {
        // Get device locale
        const deviceLocale = Localization.getLocales()[0].languageCode;
        // Check if supported, otherwise default to 'cs'
        savedLanguage = ['cs', 'en', 'sk'].includes(deviceLocale || '') ? deviceLocale : 'cs';
    }

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage || 'cs',
            fallbackLng: 'cs',
            interpolation: {
                escapeValue: false,
            },
            compatibilityJSON: 'v3',
        });
};

export const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
};

export default initI18n;
