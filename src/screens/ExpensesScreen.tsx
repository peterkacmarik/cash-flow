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
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import { Expense, Category, CategorySpending } from '../types/expense';
import {
    getCurrentMonth,
    getMonthlyData,
    getCategorySpending,
    updateCategoryBudget,
    generateId,
} from '../utils/expenseStorage';
import { dataService } from '../services/dataService';
import ExpenseCard from '../components/ExpenseCard';
import CategoryBudgetCard from '../components/CategoryBudgetCard';
import BudgetInputModal from '../components/BudgetInputModal';
import CategoryFormModal from '../components/CategoryFormModal';
import AddExpenseModal from '../components/AddExpenseModal';
import CategoryOptionsModal from '../components/CategoryOptionsModal';
import ExpenseOptionsModal from '../components/ExpenseOptionsModal';

export default function ExpensesScreen() {
    const { t, i18n } = useTranslation();
    const { colors } = useSettings();
    const { user } = useAuth(); // Get user
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const routes = React.useMemo(() => [
        { key: 'overview', title: t('expenses.overview') },
        { key: 'expenses', title: t('expenses.allExpenses') },
        { key: 'categories', title: t('expenses.categories') },
    ], [t, i18n.language]);

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
            // Load from secure service
            const [cats, secureExpenses] = await Promise.all([
                dataService.getCategories(user?.id),
                dataService.getExpenses(user?.id),
            ]);

            // Filter by month (client-side for now, could move to service)
            const monthlyExpenses = secureExpenses.filter(e => e.date.startsWith(currentMonth));

            // Re-calculate stats based on loaded data (logic from expenseStorage but applied here)
            // Or better: update expenseStorage utils to accept data instead of loading it themselves.
            // For now, let's minimally adapt the existing utils logic inline or mock functionality.

            // NOTE: The existing getMonthlyData / getCategorySpending utils heavily rely on internal loading.
            // Correct approach: Refactor utils to accept data as arguments.
            // SHORTCUT for this task: Re-implement the aggregation logic here using the data we just fetched.

            const totalSpentCalc = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
            const budgetTotalCalc = cats.reduce((sum: number, c: any) => sum + (c.budget || 0), 0);

            const catSpendingCalc = cats.map((category: any) => {
                const catExpenses = monthlyExpenses.filter((e) => e.category === category.id);
                const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
                const percentage = category.budget > 0 ? (spent / category.budget) * 100 : 0;
                return {
                    category,
                    spent,
                    budget: category.budget || 0,
                    percentage,
                    isOverBudget: spent > (category.budget || 0) && (category.budget || 0) > 0,
                };
            });


            setCategories(cats);
            setExpenses(monthlyExpenses.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ));
            setTotalSpent(totalSpentCalc);
            setTotalBudget(budgetTotalCalc);
            setCategorySpending(catSpendingCalc);
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

            await dataService.saveExpense(expense, user?.id);
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
                            await dataService.deleteExpense(expense.id, user?.id);
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
            await dataService.saveCategory(category, user?.id);
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

                            await dataService.deleteCategory(category.id, user?.id);
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
                                // Update category budget via dataService
                                const updatedCategory = { ...cs.category, budget: value, isCustom: true };
                                await dataService.saveCategory(updatedCategory, user?.id);
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

    const OverviewRoute = () => renderOverview();
    const ExpensesRoute = () => renderExpenses();
    const CategoriesRoute = () => renderCategories();

    const renderScene = SceneMap({
        overview: OverviewRoute,
        expenses: ExpensesRoute,
        categories: CategoriesRoute,
    });

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: colors.primary }]}
            style={[styles.tabBar, { backgroundColor: colors.tabBar, borderBottomColor: colors.border }]}
            labelStyle={styles.label}
            activeColor={colors.tabBarActive}
            inactiveColor={colors.tabBarInactive}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
            />

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
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        paddingTop: 0,
    },
    indicator: {
        backgroundColor: '#3498db',
        height: 3,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
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
