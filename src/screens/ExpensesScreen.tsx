import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Expense, Category, CategorySpending } from '../types/expense';
import {
    loadCategories,
    getCurrentMonth,
    getMonthlyData,
    getCategorySpending,
    saveExpense,
    deleteExpense,
    updateCategoryBudget,
    generateId,
    saveCategory,
    deleteCategory,
} from '../utils/expenseStorage';
import ExpenseCard from '../components/ExpenseCard';
import CategoryBudgetCard from '../components/CategoryBudgetCard';
import BudgetInputModal from '../components/BudgetInputModal';
import CategoryFormModal from '../components/CategoryFormModal';
import AddExpenseModal from '../components/AddExpenseModal';
import CategoryOptionsModal from '../components/CategoryOptionsModal';
import ExpenseOptionsModal from '../components/ExpenseOptionsModal';

export default function ExpensesScreen() {
    const { t } = useTranslation();
    const { colors } = useSettings();
    const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'categories'>('overview');
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [totalBudget, setTotalBudget] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

    const [budgetModal, setBudgetModal] = useState<{
        visible: boolean;
        title: string;
        initialValue: number;
        onSave: (value: number) => void;
    }>({
        visible: false,
        title: '',
        initialValue: 0,
        onSave: () => { },
    });

    const [categoryModal, setCategoryModal] = useState<{
        visible: boolean;
        category?: Category;
    }>({
        visible: false,
        category: undefined,
    });

    const [categoryOptionsModal, setCategoryOptionsModal] = useState<{
        visible: boolean;
        category?: Category;
    }>({
        visible: false,
        category: undefined,
    });

    const [expenseOptionsModal, setExpenseOptionsModal] = useState<{
        visible: boolean;
        expense?: Expense;
    }>({
        visible: false,
        expense: undefined,
    });

    const loadData = async () => {
        try {
            const [cats, monthlyData, catSpending] = await Promise.all([
                loadCategories(),
                getMonthlyData(currentMonth),
                getCategorySpending(currentMonth),
            ]);

            setCategories(cats);
            setExpenses(monthlyData.expenses.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ));
            setTotalSpent(monthlyData.totalSpent);
            setTotalBudget(monthlyData.budgetTotal);
            setCategorySpending(catSpending);
        } catch (error) {
            console.error('Failed to load expense data', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentMonth])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
        try {
            const expense: Expense = {
                ...expenseData,
                id: editingExpense?.id || generateId(),
                createdAt: editingExpense?.createdAt || new Date().toISOString(),
            };

            await saveExpense(expense);
            setModalVisible(false);
            setEditingExpense(undefined);
            await loadData();
        } catch (error) {
            Alert.alert(t('common.error'), t('expenses.saveError'));
        }
    };

    const handleDeleteExpense = (expense: Expense) => {
        Alert.alert(
            t('expenses.deleteTitle'),
            t('expenses.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteExpense(expense.id);
                            await loadData();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('expenses.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setModalVisible(true);
    };

    const openBudgetModal = (title: string, initialValue: number, onSave: (value: number) => void) => {
        setBudgetModal({
            visible: true,
            title,
            initialValue,
            onSave,
        });
    };

    const handleSaveCategory = async (category: Category) => {
        try {
            await saveCategory(category);
            setCategoryModal({ visible: false, category: undefined });
            await loadData();
        } catch (error) {
            Alert.alert(t('common.error'), t('categories.saveError'));
        }
    };

    const handleDeleteCategory = (category: Category) => {
        Alert.alert(
            t('categories.deleteTitle'),
            t('categories.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Check if category has expenses
                            const hasExpenses = expenses.some(e => e.category === category.id);
                            if (hasExpenses) {
                                Alert.alert(t('common.error'), t('categories.hasExpensesError'));
                                return;
                            }

                            await deleteCategory(category.id);
                            await loadData();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('categories.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const renderOverview = () => (
        <ScrollView
            style={styles.tabContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
            <View style={[styles.summaryCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>📊 {t('expenses.monthlySummary')}</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('expenses.totalSpent')}</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>{totalSpent.toLocaleString()} Kč</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('expenses.totalBudget')}</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {totalBudget.toLocaleString()} Kč
                        </Text>
                    </View>
                </View >
                {totalBudget > 0 && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[{
                                    width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                                    backgroundColor: totalSpent > totalBudget ? '#e74c3c' : '#2ecc71'
                                }, styles.progressFill]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {Math.round((totalSpent / totalBudget) * 100)}% {t('expenses.budgetUsed')}
                        </Text>
                    </View>
                )
                }
            </View >

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('expenses.recentExpenses')}</Text>
            </View>

            {
                expenses.slice(0, 5).map((expense) => (
                    <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        category={categories.find(c => c.id === expense.category)}
                        onDelete={() => handleDeleteExpense(expense)}
                        onPress={() => handleEditExpense(expense)}
                        onLongPress={() => setExpenseOptionsModal({ visible: true, expense })}
                    />
                ))
            }
        </ScrollView >
    );

    const renderExpenses = () => (
        <ScrollView
            style={styles.tabContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {expenses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💸</Text>
                    <Text style={[styles.emptyText, { color: colors.text }]}>{t('expenses.noExpenses')}</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('expenses.addFirst')}</Text>
                </View>
            ) : (
                expenses.map((expense) => (
                    <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        category={categories.find(c => c.id === expense.category)}
                        onDelete={() => handleDeleteExpense(expense)}
                        onPress={() => handleEditExpense(expense)}
                        onLongPress={() => setExpenseOptionsModal({ visible: true, expense })}
                    />
                ))
            )}
        </ScrollView>
    );

    const renderCategories = () => (
        <ScrollView
            style={styles.tabContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <TouchableOpacity
                style={[styles.addCategoryButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                onPress={() => setCategoryModal({ visible: true, category: undefined })}
            >
                <Text style={[styles.addCategoryText, { color: colors.primary }]}>+ {t('categories.addCategory')}</Text>
            </TouchableOpacity>

            {categorySpending.map((cs) => (
                <CategoryBudgetCard
                    key={cs.category.id}
                    categorySpending={cs}
                    onPress={() => {
                        openBudgetModal(
                            `${t('expenses.setBudget')} - ${cs.category.name}`,
                            cs.category.budget,
                            async (value) => {
                                await updateCategoryBudget(cs.category.id, value);
                                await loadData();
                            }
                        );
                    }}
                    onLongPress={() => {
                        setCategoryOptionsModal({ visible: true, category: cs.category });
                    }}
                />
            ))}
        </ScrollView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'overview' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'overview' && [styles.tabTextActive, { color: colors.primary }]]}>
                        {t('expenses.overview')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'expenses' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
                    onPress={() => setActiveTab('expenses')}
                >
                    <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'expenses' && [styles.tabTextActive, { color: colors.primary }]]}>
                        {t('expenses.allExpenses')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'categories' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
                    onPress={() => setActiveTab('categories')}
                >
                    <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'categories' && [styles.tabTextActive, { color: colors.primary }]]}>
                        {t('expenses.categories')}
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'expenses' && renderExpenses()}
            {activeTab === 'categories' && renderCategories()}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setEditingExpense(undefined);
                    setModalVisible(true);
                }}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            <AddExpenseModal
                visible={modalVisible}
                expense={editingExpense}
                categories={categories}
                onClose={() => {
                    setModalVisible(false);
                    setEditingExpense(undefined);
                }}
                onSave={handleSaveExpense}
            />

            <BudgetInputModal
                visible={budgetModal.visible}
                title={budgetModal.title}
                initialValue={budgetModal.initialValue}
                onClose={() => setBudgetModal(prev => ({ ...prev, visible: false }))}
                onSave={budgetModal.onSave}
            />

            <CategoryFormModal
                visible={categoryModal.visible}
                category={categoryModal.category}
                onClose={() => setCategoryModal({ visible: false, category: undefined })}
                onSave={handleSaveCategory}
            />

            <CategoryOptionsModal
                visible={categoryOptionsModal.visible}
                category={categoryOptionsModal.category}
                onClose={() => setCategoryOptionsModal({ visible: false, category: undefined })}
                onEdit={(category) => setCategoryModal({ visible: true, category })}
                onDelete={(category) => handleDeleteCategory(category)}
            />

            <ExpenseOptionsModal
                visible={expenseOptionsModal.visible}
                expense={expenseOptionsModal.expense}
                onClose={() => setExpenseOptionsModal({ visible: false, expense: undefined })}
                onEdit={(expense) => {
                    handleEditExpense(expense);
                }}
                onDelete={(expense) => handleDeleteExpense(expense)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#3498db',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#7f8c8d',
    },
    tabTextActive: {
        color: '#3498db',
        fontWeight: '600',
    },
    tabContent: {
        flex: 1,
    },
    summaryCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#ecf0f1',
        marginHorizontal: 16,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#7f8c8d',
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    progressContainer: {
        marginTop: 20,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    progressText: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 8,
        textAlign: 'center',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
    addCategoryButton: {
        margin: 16,
        marginBottom: 8,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3498db',
        borderStyle: 'dashed',
    },
    addCategoryText: {
        color: '#3498db',
        fontSize: 16,
        fontWeight: '600',
    },
});
