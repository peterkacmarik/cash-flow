import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { PropertyInputs } from '../utils/calculations';
import { useSettings } from '../context/SettingsContext';
import { getCurrencySymbol } from '../utils/settings';
import { Scenario } from '../types/scenario';
import { Ionicons } from '@expo/vector-icons';
import InfoTooltip from './InfoTooltip';

interface InputFormProps {
    inputs: PropertyInputs;
    onCalculate: (values: PropertyInputs) => void;
    onSaveScenario: (values: PropertyInputs) => void;
    onUpdateScenario?: (values: PropertyInputs) => void;
    onCancelEdit?: () => void;
    onResetValues?: () => void;  // Reset only input values
    onCancel?: () => void;        // Full cancel (reset everything)
    onLoadTemplate?: () => void;  // Load template
    loadedScenario?: Scenario | null;
    hasResults?: boolean;
    resetTrigger?: number;
}

export default function InputForm({ inputs: initialInputs, onCalculate, onSaveScenario, onUpdateScenario, onCancelEdit, onResetValues, onCancel, onLoadTemplate, loadedScenario, hasResults, resetTrigger }: InputFormProps) {
    const { t } = useTranslation();
    const { currency, colors } = useSettings();
    const currencySymbol = getCurrencySymbol(currency);

    const formatValue = (val: number) => val === 0 ? '' : val.toString();

    const [values, setValues] = useState({
        kupnaCena: formatValue(initialInputs.kupnaCena),
        vlastneZdroje: formatValue(initialInputs.vlastneZdroje),
        vyskaHypoteky: formatValue(initialInputs.vyskaHypoteky),
        urok: formatValue(initialInputs.urok),
        dobaSplatnosti: formatValue(initialInputs.dobaSplatnosti),
        ocakavaneNajomne: formatValue(initialInputs.ocakavaneNajomne),
        obsadenost: formatValue(initialInputs.obsadenost),
        fondOprav: formatValue(initialInputs.fondOprav),
        sprava: formatValue(initialInputs.sprava),
        poistenie: formatValue(initialInputs.poistenie),
        danZNehnutelnosti: formatValue(initialInputs.danZNehnutelnosti),
        energie: formatValue(initialInputs.energie),
        internet: formatValue(initialInputs.internet),
        ineNaklady: formatValue(initialInputs.ineNaklady),
        neocakavaneNaklady: formatValue(initialInputs.neocakavaneNaklady),
    });

    // Update local state when props change (e.g. loading a scenario)
    useEffect(() => {
        setValues({
            kupnaCena: formatValue(initialInputs.kupnaCena),
            vlastneZdroje: formatValue(initialInputs.vlastneZdroje),
            vyskaHypoteky: formatValue(initialInputs.vyskaHypoteky),
            urok: formatValue(initialInputs.urok),
            dobaSplatnosti: formatValue(initialInputs.dobaSplatnosti),
            ocakavaneNajomne: formatValue(initialInputs.ocakavaneNajomne),
            obsadenost: formatValue(initialInputs.obsadenost),
            fondOprav: formatValue(initialInputs.fondOprav),
            sprava: formatValue(initialInputs.sprava),
            poistenie: formatValue(initialInputs.poistenie),
            danZNehnutelnosti: formatValue(initialInputs.danZNehnutelnosti),
            energie: formatValue(initialInputs.energie),
            internet: formatValue(initialInputs.internet),
            ineNaklady: formatValue(initialInputs.ineNaklady),
            neocakavaneNaklady: formatValue(initialInputs.neocakavaneNaklady),
        });
    }, [initialInputs, resetTrigger]);

    const handleChange = useCallback((field: keyof typeof values, text: string) => {
        setValues(prev => ({ ...prev, [field]: text }));
    }, []);

    const getNumericValues = useCallback((): PropertyInputs => {
        return {
            kupnaCena: parseFloat(values.kupnaCena) || 0,
            vlastneZdroje: parseFloat(values.vlastneZdroje) || 0,
            vyskaHypoteky: parseFloat(values.vyskaHypoteky) || 0,
            urok: parseFloat(values.urok) || 0,
            dobaSplatnosti: parseFloat(values.dobaSplatnosti) || 0,
            ocakavaneNajomne: parseFloat(values.ocakavaneNajomne) || 0,
            obsadenost: parseFloat(values.obsadenost) || 0,
            fondOprav: parseFloat(values.fondOprav) || 0,
            sprava: parseFloat(values.sprava) || 0,
            poistenie: parseFloat(values.poistenie) || 0,
            danZNehnutelnosti: parseFloat(values.danZNehnutelnosti) || 0,
            energie: parseFloat(values.energie) || 0,
            internet: parseFloat(values.internet) || 0,
            ineNaklady: parseFloat(values.ineNaklady) || 0,
            neocakavaneNaklady: parseFloat(values.neocakavaneNaklady) || 0,
        };
    }, [values]);

    const handleCalculate = useCallback(() => {
        onCalculate(getNumericValues());
    }, [getNumericValues, onCalculate]);

    const handleSave = useCallback(() => {
        onSaveScenario(getNumericValues());
    }, [getNumericValues, onSaveScenario]);

    const handleUpdate = useCallback(() => {
        if (onUpdateScenario) {
            onUpdateScenario(getNumericValues());
        }
    }, [getNumericValues, onUpdateScenario]);

    const handleResetValues = useCallback(() => {
        if (onResetValues) {
            onResetValues();
        }
    }, [onResetValues]);

    const handleCancel = useCallback(() => {
        if (onCancel) {
            onCancel();
        }
    }, [onCancel]);



    const renderInput = (labelKey: string, field: keyof typeof values, placeholder: string, unit?: string, tooltipKey?: string) => (
        <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t(`inputs.${labelKey}`)}</Text>
                {tooltipKey && <InfoTooltip titleKey={`inputs.${labelKey}`} textKey={`tooltips.${tooltipKey}`} />}
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    keyboardType="numeric"
                    value={values[field]}
                    onChangeText={(text) => handleChange(field, text)}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                />
                {unit && <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('inputs.purchaseParams')}</Text>
                    {renderInput('purchasePrice', 'kupnaCena', '0', currencySymbol, 'purchasePrice')}
                    {renderInput('ownResources', 'vlastneZdroje', '0', currencySymbol, 'ownResources')}
                    {renderInput('mortgageAmount', 'vyskaHypoteky', '0', currencySymbol, 'mortgageAmount')}
                    {renderInput('interestRate', 'urok', '0', '%', 'interestRate')}
                    {renderInput('loanTerm', 'dobaSplatnosti', '0', t('units.years'), 'loanTerm')}
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('inputs.incomeParams')}</Text>
                    {renderInput('expectedRent', 'ocakavaneNajomne', '0', currencySymbol, 'expectedRent')}
                    {renderInput('occupancyRate', 'obsadenost', '0', '%', 'occupancyRate')}
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('inputs.expenseParams')}</Text>
                    {renderInput('repairFund', 'fondOprav', '0', currencySymbol, 'repairFund')}
                    {renderInput('managementFee', 'sprava', '0', currencySymbol, 'managementFee')}
                    {renderInput('insurance', 'poistenie', '0', currencySymbol, 'insurance')}
                    {renderInput('propertyTax', 'danZNehnutelnosti', '0', currencySymbol, 'propertyTax')}
                    {renderInput('utilities', 'energie', '0', currencySymbol, 'utilities')}
                    {renderInput('internet', 'internet', '0', currencySymbol, 'internet')}
                    {renderInput('otherExpenses', 'ineNaklady', '0', currencySymbol, 'otherExpenses')}
                    {renderInput('unexpectedExpenses', 'neocakavaneNaklady', '0', currencySymbol, 'unexpectedExpenses')}
                </View>

                <View style={styles.actionContainer}>
                    <View style={styles.leftActions}>
                        {onLoadTemplate && (
                            <TouchableOpacity
                                style={[styles.iconButton, styles.templateButton, { backgroundColor: colors.primary, marginRight: 10 }]}
                                onPress={onLoadTemplate}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="document-text-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.iconButton, styles.resetButton]}
                            onPress={handleResetValues}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="refresh-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rightActions}>
                        {(hasResults || loadedScenario) && (
                            <>
                                <TouchableOpacity
                                    style={[styles.iconButton, styles.cancelButton, { marginRight: 10, backgroundColor: '#e74c3c' }]}
                                    onPress={handleCancel}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="close-outline" size={24} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.iconButton, styles.saveButton]}
                                    onPress={loadedScenario ? handleUpdate : handleSave}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={loadedScenario ? "cloud-upload-outline" : "save-outline"}
                                        size={24}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.calculateButton}
                            onPress={handleCalculate}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="calculator-outline" size={24} color="#fff" style={styles.calculateIcon} />
                            <Text style={styles.calculateButtonText}>{t('common.calculate')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#2c3e50',
    },
    unit: {
        paddingHorizontal: 15,
        color: '#95a5a6',
        fontSize: 16,
        fontWeight: '500',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        gap: 15,
    },
    leftActions: {
        flexDirection: 'row',
        gap: 10,
    },
    rightActions: {
        flexDirection: 'row',
        gap: 10,
        flex: 1,
        justifyContent: 'flex-end',
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resetButton: {
        backgroundColor: '#ff6b6b',
    },
    templateButton: {
        // Style is applied inline with colors.primary
    },
    cancelButton: {
        backgroundColor: '#95a5a6',
    },
    saveButton: {
        backgroundColor: '#2ecc71',
    },
    calculateButton: {
        backgroundColor: '#3498db',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        height: 50,
        borderRadius: 25,
        flex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    calculateIcon: {
        marginRight: 8,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
