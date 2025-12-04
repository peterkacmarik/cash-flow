export interface Expense {
    id: string;
    amount: number;
    category: string;
    date: string; // ISO format
    description: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string; // emoji
    color: string;
    budget: number;
    isCustom: boolean;
}

export interface MonthlyData {
    month: string; // YYYY-MM
    expenses: Expense[];
    totalSpent: number;
    budgetTotal: number;
}

export interface CategorySpending {
    category: Category;
    spent: number;
    budget: number;
    percentage: number;
    isOverBudget: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B', budget: 0, isCustom: false },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: '#4ECDC4', budget: 0, isCustom: false },
    { id: 'housing', name: 'Housing', icon: '🏠', color: '#45B7D1', budget: 0, isCustom: false },
    { id: 'healthcare', name: 'Healthcare', icon: '💊', color: '#96CEB4', budget: 0, isCustom: false },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#FFEAA7', budget: 0, isCustom: false },
    { id: 'shopping', name: 'Shopping', icon: '👕', color: '#DFE6E9', budget: 0, isCustom: false },
    { id: 'education', name: 'Education', icon: '📚', color: '#74B9FF', budget: 0, isCustom: false },
    { id: 'savings', name: 'Savings', icon: '💰', color: '#55EFC4', budget: 0, isCustom: false },
    { id: 'gifts', name: 'Gifts', icon: '🎁', color: '#FD79A8', budget: 0, isCustom: false },
    { id: 'bills', name: 'Bills', icon: '📱', color: '#A29BFE', budget: 0, isCustom: false },
];
