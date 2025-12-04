export interface ThemeColors {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    danger: string;
    border: string;
    inputBackground: string;
    tabBar: string;
    tabBarActive: string;
    tabBarInactive: string;
    shadow: string;
}

export const lightTheme: ThemeColors = {
    background: '#f5f6fa',
    card: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    border: '#ecf0f1',
    inputBackground: '#f8f9fa',
    tabBar: '#ffffff',
    tabBarActive: '#3498db',
    tabBarInactive: '#7f8c8d',
    shadow: '#000000',
};

export const darkTheme: ThemeColors = {
    background: '#121212',
    card: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    primary: '#4fa3e0', // Slightly lighter for dark mode
    secondary: '#2ecc71',
    danger: '#e74c3c',
    border: '#333333',
    inputBackground: '#2c2c2c',
    tabBar: '#1e1e1e',
    tabBarActive: '#4fa3e0',
    tabBarInactive: '#666666',
    shadow: '#000000',
};
