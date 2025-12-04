import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { Expense, Category } from '../types/expense';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

interface AddExpenseModalProps {
    visible: boolean;
    expense?: Expense;
    categories: Category[];
    onClose: () => void;
    onSave: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export default function AddExpenseModal({
    visible,
    expense,
    categories,
    onClose,
    onSave,
}: AddExpenseModalProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (expense) {
            setAmount(expense.amount.toString());
            setDescription(expense.description);
            setSelectedCategory(expense.category);
            setDate(expense.date);
        } else {
            resetForm();
        }
    }, [expense, visible]);

    const resetForm = () => {
        setAmount('');
        setDescription('');
        setSelectedCategory(categories[0]?.id || '');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return;
        }
        if (!selectedCategory) {
            return;
        }

        onSave({
            amount: parsedAmount,
            description: description.trim(),
            category: selectedCategory,
            date,
        });

        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {expense ? t('expenses.editExpense') : t('expenses.addExpense')}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>{t('expenses.amount')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>{t('expenses.description')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder={t('expenses.descriptionPlaceholder')}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>{t('expenses.date')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                value={date}
                                onChangeText={setDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>{t('expenses.category')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.categoryButton,
                                            selectedCategory === category.id && [styles.categoryButtonSelected, { backgroundColor: colors.inputBackground }],
                                            { borderColor: category.color, backgroundColor: selectedCategory === category.id ? colors.inputBackground : colors.card },
                                        ]}
                                        onPress={() => setSelectedCategory(category.id)}
                                    >
                                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                                        <Text style={[
                                            styles.categoryName,
                                            { color: colors.textSecondary },
                                            selectedCategory === category.id && [styles.categoryNameSelected, { color: colors.text }]
                                        ]}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.inputBackground }]} onPress={handleClose}>
                            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    closeButton: {
        fontSize: 24,
        color: '#7f8c8d',
        padding: 4,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#dfe6e9',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#2c3e50',
        backgroundColor: '#f8f9fa',
    },
    categoryScroll: {
        marginTop: 8,
    },
    categoryButton: {
        alignItems: 'center',
        padding: 12,
        marginRight: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ecf0f1',
        backgroundColor: '#fff',
        minWidth: 80,
    },
    categoryButtonSelected: {
        backgroundColor: '#f8f9fa',
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 11,
        color: '#7f8c8d',
        textAlign: 'center',
        fontWeight: '500',
    },
    categoryNameSelected: {
        color: '#2c3e50',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#ecf0f1',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7f8c8d',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#3498db',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
