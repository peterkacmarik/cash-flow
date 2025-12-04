import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfitTimerCalculation } from '../types/profitTimer';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';

interface ProfitTimerCalculationCardProps {
    calculation: ProfitTimerCalculation;
    scenarioName: string;
    onLoad: () => void;
    onRename: () => void;
    onDelete: () => void;
}

export default function ProfitTimerCalculationCard({
    calculation,
    scenarioName,
    onLoad,
    onRename,
    onDelete,
}: ProfitTimerCalculationCardProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatParameter = (type: 'percentage' | 'fixed', value: number) => {
        return type === 'percentage' ? `${value}%` : `${value.toLocaleString()} Kč`;
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <View style={styles.header}>
                <View style={styles.nameContainer}>
                    <Text style={[styles.name, { color: colors.text }]}>{calculation.name}</Text>
                    <TouchableOpacity style={styles.editIcon} onPress={onRename}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(calculation.createdAt)}</Text>
            </View>

            <View style={styles.details}>
                <Text style={[styles.scenarioLabel, { color: colors.textSecondary }]}>{t('profitTimer.baseScenario')}:</Text>
                <Text style={[styles.scenarioName, { color: colors.text }]}>{scenarioName}</Text>

                <View style={styles.parametersContainer}>
                    <View style={[styles.parameter, { backgroundColor: colors.inputBackground }]}>
                        <Text style={[styles.parameterLabel, { color: colors.textSecondary }]}>{t('profitTimer.rentGrowth')}:</Text>
                        <Text style={[styles.parameterValue, { color: colors.text }]}>
                            {formatParameter(calculation.rentGrowthType, calculation.rentGrowthValue)}
                        </Text>
                    </View>
                    <View style={[styles.parameter, { backgroundColor: colors.inputBackground }]}>
                        <Text style={[styles.parameterLabel, { color: colors.textSecondary }]}>{t('profitTimer.expenseReduction')}:</Text>
                        <Text style={[styles.parameterValue, { color: colors.text }]}>
                            {formatParameter(calculation.expenseReductionType, calculation.expenseReductionValue)}
                        </Text>
                    </View>
                </View>

                <View style={[styles.resultContainer, { borderTopColor: colors.border }]}>
                    <View style={styles.resultItem}>
                        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t('profitTimer.monthsToPositive')}:</Text>
                        <Text style={[styles.resultValue, { color: colors.secondary }]}>
                            {(calculation.monthsToPositive === undefined || calculation.monthsToPositive === -1)
                                ? '-'
                                : calculation.monthsToPositive}
                        </Text>
                    </View>
                    <View style={styles.resultItem}>
                        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t('profitTimer.yearsToPositive')}:</Text>
                        <Text style={[styles.resultValue, { color: colors.secondary }]}>
                            {(calculation.yearsToPositive === undefined || calculation.yearsToPositive === -1)
                                ? '-'
                                : calculation.yearsToPositive}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.button, styles.loadButton, { backgroundColor: colors.primary }]} onPress={onLoad}>
                    <Text style={styles.buttonText}>{t('profitTimer.loadCalculation')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton, { backgroundColor: colors.danger }]} onPress={onDelete}>
                    <Text style={styles.buttonText}>{t('common.delete')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        flexShrink: 1,
    },
    editIcon: {
        padding: 4,
    },
    date: {
        fontSize: 12,
        color: '#95a5a6',
    },
    details: {
        marginBottom: 12,
    },
    resultContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    resultItem: {
        alignItems: 'center',
    },
    resultLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    scenarioLabel: {
        fontSize: 13,
        color: '#7f8c8d',
        marginBottom: 2,
    },
    scenarioName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
    },
    parametersContainer: {
        gap: 8,
    },
    parameter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
    },
    parameterLabel: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    parameterValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    loadButton: {
        backgroundColor: '#3498db',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
