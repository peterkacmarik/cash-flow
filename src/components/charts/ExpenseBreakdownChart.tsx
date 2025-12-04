import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { PropertyInputs } from '../../utils/calculations';
import { useSettings } from '../../context/SettingsContext';

interface ExpenseBreakdownChartProps {
    inputs: PropertyInputs;
}

const COLORS = [
    '#e74c3c', // Red
    '#3498db', // Blue
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Turquoise
    '#34495e', // Dark gray
    '#e67e22', // Dark orange
    '#95a5a6', // Gray
];

export default function ExpenseBreakdownChart({ inputs }: ExpenseBreakdownChartProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();

    const chartData = useMemo(() => {
        const expenses = [
            { name: t('inputs.repairFund'), amount: inputs.fondOprav },
            { name: t('inputs.managementFee'), amount: inputs.sprava },
            { name: t('inputs.insurance'), amount: inputs.poistenie },
            { name: t('inputs.propertyTax'), amount: inputs.danZNehnutelnosti / 12 },
            { name: t('inputs.utilities'), amount: inputs.energie },
            { name: t('inputs.internet'), amount: inputs.internet },
            { name: t('inputs.otherExpenses'), amount: inputs.ineNaklady },
            { name: t('inputs.unexpectedExpenses'), amount: inputs.neocakavaneNaklady },
        ];

        // Filter out zero expenses and add colors
        return expenses
            .filter(e => e.amount > 0)
            .map((expense, index) => ({
                name: expense.name,
                amount: expense.amount,
                color: COLORS[index % COLORS.length],
                legendFontColor: colors.textSecondary,
                legendFontSize: 12,
            }));
    }, [inputs, t, colors]);

    const chartConfig = {
        color: (opacity = 1) => colors.text,
    };

    if (chartData.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <Text style={[styles.title, { color: colors.text }]}>{t('charts.expenseBreakdown')}</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('charts.noExpenses')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('charts.expenseBreakdown')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('charts.monthlyExpenses')}</Text>

            <View style={styles.chartWrapper}>
                <View style={styles.chartSection}>
                    <PieChart
                        data={chartData}
                        width={180}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="30"
                        absolute
                        hasLegend={false}
                    />
                </View>

                {/* Custom Legend beside chart */}
                <View style={styles.legendContainer}>
                    {chartData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            <Text
                                style={[styles.legendText, { color: colors.textSecondary }]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {item.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 40,
    },
    chartWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },
    chartSection: {
        paddingLeft: 0,
        marginLeft: 0,
        width: '50%',
        height: '100%',
    },
    legendContainer: {
        flex: 1,
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 5,
        flexShrink: 0,
    },
    legendText: {
        fontSize: 13,
        flex: 1,
    },
});
