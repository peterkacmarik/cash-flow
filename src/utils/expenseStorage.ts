import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Category, MonthlyData, DEFAULT_CATEGORIES } from '../types/expense';

const EXPENSES_KEY = '@expenses';
const CATEGORIES_KEY = '@categories';

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Load all expenses
export const loadExpenses = async (): Promise<Expense[]> => {
    try {
        const data = await AsyncStorage.getItem(EXPENSES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load expenses', error);
        return [];
    }
};

// Save expense
export const saveExpense = async (expense: Expense): Promise<void> => {
    try {
        const expenses = await loadExpenses();
        const existingIndex = expenses.findIndex(e => e.id === expense.id);

        if (existingIndex >= 0) {
            expenses[existingIndex] = expense;
        } else {
            expenses.push(expense);
        }

        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
        console.error('Failed to save expense', error);
        throw error;
    }
};

// Delete expense
export const deleteExpense = async (id: string): Promise<void> => {
    try {
        const expenses = await loadExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete expense', error);
        throw error;
    }
};

// Get expenses for specific month
export const getExpensesByMonth = async (month: string): Promise<Expense[]> => {
    const expenses = await loadExpenses();
    return expenses.filter(e => e.date.startsWith(month));
};

// Load categories
export const loadCategories = async (): Promise<Category[]> => {
    try {
        const data = await AsyncStorage.getItem(CATEGORIES_KEY);
        if (data) {
            return JSON.parse(data);
        }
        // Initialize with default categories
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
    } catch (error) {
        console.error('Failed to load categories', error);
        return DEFAULT_CATEGORIES;
    }
};

// Save categories
export const saveCategories = async (categories: Category[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
        console.error('Failed to save categories', error);
        throw error;
    }
};


// Save single category (add or update)
export const saveCategory = async (category: Category): Promise<void> => {
    try {
        const categories = await loadCategories();
        const existingIndex = categories.findIndex(c => c.id === category.id);

        if (existingIndex >= 0) {
            categories[existingIndex] = category;
        } else {
            categories.push(category);
        }

        await saveCategories(categories);
    } catch (error) {
        console.error('Failed to save category', error);
        throw error;
    }
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
    try {
        const categories = await loadCategories();
        const filtered = categories.filter(c => c.id !== id);
        await saveCategories(filtered);
    } catch (error) {
        console.error('Failed to delete category', error);
        throw error;
    }
};

// Update category budget
export const updateCategoryBudget = async (categoryId: string, budget: number): Promise<void> => {
    try {
        const categories = await loadCategories();
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            category.budget = budget;
            await saveCategories(categories);
        }
    } catch (error) {
        console.error('Failed to update category budget', error);
        throw error;
    }
};

const TOTAL_BUDGET_KEY = '@total_budget';

// ... (existing code)

// Load total budget
export const loadTotalBudget = async (): Promise<number> => {
    try {
        const data = await AsyncStorage.getItem(TOTAL_BUDGET_KEY);
        return data ? parseFloat(data) : 0;
    } catch (error) {
        console.error('Failed to load total budget', error);
        return 0;
    }
};

// Save total budget
export const saveTotalBudget = async (amount: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOTAL_BUDGET_KEY, amount.toString());
    } catch (error) {
        console.error('Failed to save total budget', error);
        throw error;
    }
};

// Calculate monthly data
export const getMonthlyData = async (month: string): Promise<MonthlyData> => {
    const expenses = await getExpensesByMonth(month);
    const categories = await loadCategories();
    const storedTotalBudget = await loadTotalBudget();

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    // Use stored total budget if set (> 0), otherwise sum category budgets
    const budgetTotal = storedTotalBudget > 0
        ? storedTotalBudget
        : categories.reduce((sum, c) => sum + c.budget, 0);

    return {
        month,
        expenses,
        totalSpent,
        budgetTotal,
    };
};

// Get spending by category for a month
export const getCategorySpending = async (month: string) => {
    const expenses = await getExpensesByMonth(month);
    const categories = await loadCategories();

    return categories.map(category => {
        const categoryExpenses = expenses.filter(e => e.category === category.id);
        const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = category.budget > 0 ? (spent / category.budget) * 100 : 0;

        return {
            category,
            spent,
            budget: category.budget,
            percentage,
            isOverBudget: spent > category.budget && category.budget > 0,
        };
    });
};

// Generate unique ID
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
