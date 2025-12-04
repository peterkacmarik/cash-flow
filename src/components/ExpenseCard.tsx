import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Expense, Category } from '../types/expense';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

interface ExpenseCardProps {
    expense: Expense;
    category: Category | undefined;
    onPress: () => void;
    onDelete: () => void;
    onLongPress?: () => void;
}

export default function ExpenseCard({ expense, category, onPress, onDelete, onLongPress }: ExpenseCardProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit' });
    };

    const handleLongPress = () => {
        if (onLongPress) {
            onLongPress();
        } else {
            Alert.alert(
                expense.description || t('expenses.expense'),
                t('expenses.optionsTitle'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                        text: t('common.edit'),
                        onPress: onPress
                    },
                    {
                        text: t('common.delete'),
                        style: 'destructive',
                        onPress: onDelete
                    }
                ]
            );
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
            onPress={onPress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.leftSection}>
                <View style={[styles.iconContainer, { backgroundColor: category?.color + '20' || colors.inputBackground }]}>
                    <Text style={styles.icon}>{category?.icon || '💰'}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
                        {expense.description || 'Bez popisu'}
                    </Text>
                    <Text style={[styles.category, { color: colors.textSecondary }]}>{category?.name || 'Iné'}</Text>
                </View>
            </View>
            <View style={styles.rightSection}>
                <Text style={[styles.amount, { color: colors.danger }]}>-{expense.amount.toLocaleString()} Kč</Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(expense.date)}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 24,
    },
    details: {
        flex: 1,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    category: {
        fontSize: 13,
        color: '#7f8c8d',
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#95a5a6',
    },
});
