import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CategorySpending } from '../types/expense';
import { useSettings } from '../context/SettingsContext';

interface CategoryBudgetCardProps {
    categorySpending: CategorySpending;
    onPress: () => void;
    onLongPress?: () => void;
}

export default function CategoryBudgetCard({ categorySpending, onPress, onLongPress }: CategoryBudgetCardProps) {
    const { category, spent, budget, percentage, isOverBudget } = categorySpending;
    const { colors } = useSettings();

    const getProgressColor = () => {
        if (budget === 0) return colors.textSecondary;
        if (isOverBudget) return colors.danger;
        if (percentage > 80) return '#f39c12';
        return colors.secondary;
    };

    const progressWidth = budget > 0 ? Math.min(percentage, 100) : 0;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.categoryInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                        <Text style={styles.icon}>{category.icon}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                        <Text style={[styles.budgetText, { color: colors.textSecondary }]}>
                            {spent.toLocaleString()} / {budget > 0 ? budget.toLocaleString() : '—'} Kč
                        </Text>
                    </View>
                </View>
                {budget > 0 && (
                    <Text style={[styles.percentage, { color: getProgressColor() }]}>
                        {Math.round(percentage)}%
                    </Text>
                )}
            </View>

            {budget > 0 && (
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${progressWidth}%`,
                                    backgroundColor: getProgressColor()
                                }
                            ]}
                        />
                    </View>
                </View>
            )}

            {isOverBudget && (
                <Text style={[styles.warningText, { color: colors.danger }]}>
                    ⚠️ Prekročený rozpočet o {(spent - budget).toLocaleString()} Kč
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 22,
    },
    textContainer: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    budgetText: {
        fontSize: 13,
        color: '#7f8c8d',
    },
    percentage: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    progressBarContainer: {
        marginTop: 4,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#ecf0f1',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    warningText: {
        fontSize: 12,
        color: '#e74c3c',
        marginTop: 8,
        fontWeight: '600',
    },
});
