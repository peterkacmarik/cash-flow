import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Currency, getCurrencySymbol, getCurrencyName } from '../utils/settings';
import { changeLanguage } from '../i18n';
import { deleteAllScenarios } from '../utils/storage';
import { deleteAllProfitTimerCalculations } from '../utils/profitTimerStorage';
import { deleteAllReports } from '../utils/reportStorage';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const CURRENCIES: Currency[] = ['CZK', 'EUR', 'USD'];
const LANGUAGES = [
    { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
];

interface SettingsScreenProps {
    onScenariosDeleted?: () => void;
}

export default function SettingsScreen({ onScenariosDeleted }: SettingsScreenProps = {}) {
    const { t, i18n } = useTranslation();
    const { currency, language, theme, toggleTheme, colors, updateCurrency, updateLanguage, notifyDataChanged } = useSettings();
    const { user, signOut, isGuest } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleCurrencyChange = async (newCurrency: Currency) => {
        try {
            await updateCurrency(newCurrency);
        } catch (error) {
            Alert.alert(t('common.error'), 'Failed to save currency setting');
        }
    };

    const handleLanguageChange = async (languageCode: string) => {
        try {
            await changeLanguage(languageCode);
            await updateLanguage(languageCode as any);
        } catch (error) {
            Alert.alert(t('common.error'), 'Failed to change language');
        }
    };

    const handleDeleteAllScenarios = () => {
        Alert.alert(
            t('settings.deleteAllScenarios'),
            t('settings.deleteAllScenariosConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllScenarios();
                            notifyDataChanged(); // Notify context
                            if (onScenariosDeleted) {
                                onScenariosDeleted();
                            }
                            Alert.alert(t('common.success'), t('settings.deleteAllScenariosSuccess'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('settings.deleteAllScenariosError'));
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAllProfitTimerCalculations = () => {
        Alert.alert(
            t('profitTimer.deleteCalculation'),
            t('settings.deleteAllProfitTimerCalculationsConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllProfitTimerCalculations();
                            notifyDataChanged();
                            Alert.alert(t('common.success'), t('settings.deleteAllProfitTimerCalculationsSuccess'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('settings.deleteAllProfitTimerCalculationsError'));
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAllReports = () => {
        Alert.alert(
            t('reports.deleteAllReports'),
            t('reports.deleteAllConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllReports();
                            notifyDataChanged();
                            Alert.alert(t('common.success'), t('reports.deleteAllSuccess'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('reports.deleteAllError'));
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Language Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
                <Text style={styles.sectionDescription}>{t('settings.languageDescription')}</Text>
                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.option,
                            i18n.language === lang.code && styles.selectedOption,
                        ]}
                        onPress={() => handleLanguageChange(lang.code)}
                    >
                        <View style={styles.optionContent}>
                            <Text style={styles.flag}>{lang.flag}</Text>
                            <Text style={styles.optionText}>{lang.name}</Text>
                        </View>
                        {i18n.language === lang.code && (
                            <Text style={styles.checkmark}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Currency Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('settings.currency')}</Text>
                <Text style={styles.sectionDescription}>{t('settings.currencyDescription')}</Text>
                {CURRENCIES.map((curr) => (
                    <TouchableOpacity
                        key={curr}
                        style={[
                            styles.option,
                            currency === curr && styles.selectedOption,
                        ]}
                        onPress={() => handleCurrencyChange(curr)}
                    >
                        <View style={styles.optionContent}>
                            <Text style={styles.currencySymbol}>{getCurrencySymbol(curr)}</Text>
                            <View>
                                <Text style={styles.optionText}>{curr}</Text>
                                <Text style={styles.currencyName}>{getCurrencyName(curr)}</Text>
                            </View>
                        </View>
                        {currency === curr && (
                            <Text style={styles.checkmark}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Data Section */}
            <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.data')}</Text>
                <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={handleDeleteAllScenarios}
                >
                    <Text style={styles.dangerButtonText}>{t('settings.deleteAllScenarios')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.dangerButton, { marginTop: 10 }]}
                    onPress={handleDeleteAllProfitTimerCalculations}
                >
                    <Text style={styles.dangerButtonText}>{t('settings.deleteAllProfitTimerCalculations')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.dangerButton, { marginTop: 10 }]}
                    onPress={handleDeleteAllReports}
                >
                    <Text style={styles.dangerButtonText}>{t('reports.deleteAllReports')}</Text>
                </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
                <View style={styles.aboutRow}>
                    <Text style={styles.aboutLabel}>{t('settings.version')}</Text>
                    <Text style={styles.aboutValue}>1.0.0</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2c3e50',
    },
    sectionDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 15,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        backgroundColor: '#e3f2fd',
        borderColor: '#3498db',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flag: {
        fontSize: 24,
        marginRight: 12,
    },
    currencySymbol: {
        fontSize: 24,
        marginRight: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    optionText: {
        fontSize: 16,
        color: '#2c3e50',
        fontWeight: '500',
    },
    currencyName: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    checkmark: {
        fontSize: 20,
        color: '#3498db',
        fontWeight: 'bold',
    },
    dangerButton: {
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    aboutLabel: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    aboutValue: {
        fontSize: 16,
        color: '#2c3e50',
        fontWeight: '500',
    },
});
