import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { CalculationResults } from '../../utils/calculations';
import { calculateTimeToPositive, ProfitTimerInputs } from '../../utils/profitTimer';
import { Scenario } from '../../types/scenario';
import { useSettings } from '../../context/SettingsContext';

interface ProfitTimerTimelineChartProps {
    results: CalculationResults;
    scenario: Scenario;
    rentGrowthType?: 'percentage' | 'fixed';
    rentGrowthValue?: number;
    expenseReductionType?: 'percentage' | 'fixed';
    expenseReductionValue?: number;
}

export default function ProfitTimerTimelineChart({
    results,
    scenario,
    rentGrowthType = 'percentage',
    rentGrowthValue = 3,
    expenseReductionType = 'percentage',
    expenseReductionValue = 0,
}: ProfitTimerTimelineChartProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();
    const screenWidth = Dimensions.get('window').width;

    const { chartData, subtitle, maxYears } = useMemo(() => {
        // Calculate timeline
        const profitTimerInputs: ProfitTimerInputs = {
            scenario,
            rentGrowthType,
            rentGrowthValue,
            expenseReductionType,
            expenseReductionValue,
        };

        const timelineResult = calculateTimeToPositive(profitTimerInputs);

        // Determine how many years to show (max 10)
        const yearsToShow = Math.min(
            Math.ceil(timelineResult.yearsToPositive),
            10
        );

        // Sample data points at yearly intervals
        const yearlyData = [];
        for (let year = 0; year <= yearsToShow; year++) {
            const monthIndex = year * 12;
            if (monthIndex < timelineResult.monthlyTimeline.length) {
                yearlyData.push(timelineResult.monthlyTimeline[monthIndex]);
            } else if (timelineResult.monthlyTimeline.length > 0) {
                // Use last available data point
                yearlyData.push(timelineResult.monthlyTimeline[timelineResult.monthlyTimeline.length - 1]);
            }
        }

        // Prepare chart data
        const labels = yearlyData.map((_, index) => `${index}`);
        const cashFlowValues = yearlyData.map(item => item.cashFlow);

        // Create subtitle with assumptions
        let subtitleText = '';
        if (rentGrowthType === 'percentage') {
            subtitleText = `${rentGrowthValue}% ${t('profitTimer.rentGrowth')}`;
        } else {
            subtitleText = `+${rentGrowthValue} ${t('profitTimer.rentGrowth')}`;
        }

        if (expenseReductionValue > 0) {
            if (expenseReductionType === 'percentage') {
                subtitleText += `, ${expenseReductionValue}% ${t('profitTimer.expenseReduction')}`;
            } else {
                subtitleText += `, -${expenseReductionValue} ${t('profitTimer.expenseReduction')}`;
            }
        }

        return {
            chartData: {
                labels,
                datasets: [{
                    data: cashFlowValues,
                }],
            },
            subtitle: subtitleText,
            maxYears: yearsToShow,
        };
    }, [results, scenario, rentGrowthType, rentGrowthValue, expenseReductionType, expenseReductionValue, t]);

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => {
            // Color based on whether we're in negative or positive territory
            const lastValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
            return lastValue >= 0
                ? `rgba(39, 174, 96, ${opacity})` // Green for positive
                : `rgba(231, 76, 60, ${opacity})`; // Red for negative
        },
        labelColor: (opacity = 1) => {
            // Convert hex to rgba
            const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : { r: 127, g: 140, b: 141 }; // fallback
            };
            const rgb = hexToRgb(colors.textSecondary);
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        },
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
        },
        formatYLabel: (value: string) => {
            const num = parseFloat(value);
            if (num >= 1000 || num <= -1000) {
                return `${(num / 1000).toFixed(0)}k`;
            }
            return value;
        },
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('profitTimer.timeline')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            <LineChart
                data={chartData}
                width={screenWidth - 70}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                    backgroundColor: colors.card,
                }}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={true}
                withShadow={false}
                yAxisSuffix=""
                yAxisInterval={1}
                fromZero={false}
            />
            <Text style={[styles.xAxisLabel, { color: colors.textSecondary }]}>{t('profitTimer.years')}</Text>
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
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    xAxisLabel: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
    },
});
