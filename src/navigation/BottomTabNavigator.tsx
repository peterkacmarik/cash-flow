import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View, Modal, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ProfitTimerScreen from '../screens/ProfitTimerScreen';
import ReportsScreen from '../screens/ReportsScreen';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

const Tab = createBottomTabNavigator();

interface TabIconProps {
    focused: boolean;
    color: string;
    title: string;
}

const TabIcon = ({ focused, color, title }: TabIconProps) => (
    <Text style={{ color, fontSize: 12, fontWeight: focused ? '600' : '400' }}>
        {title}
    </Text>
);

export default function BottomTabNavigator() {
    const { t } = useTranslation();
    const { openSettings, colors } = useSettings();
    const { isGuest, signOut, user } = useAuth();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const UserAvatar = ({ onPress }: { onPress: () => void }) => {
        if (!user || isGuest) return null;

        const getInitial = () => {
            if (user.email) {
                return user.email.charAt(0).toUpperCase();
            }
            return 'U';
        };

        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 15,
                }}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                    {getInitial()}
                </Text>
            </TouchableOpacity>
        );
    };

    const handleGuestLogout = () => {
        Alert.alert(
            t('auth.exitGuestMode'),
            t('settings.exitGuestModeConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('auth.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    },
                },
            ]
        );
    };

    const handleUserLogoutConfirmation = () => {
        setIsMenuVisible(false);
        Alert.alert(
            t('auth.logout'),
            t('settings.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('auth.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    },
                },
            ]
        );
    };

    const toggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleSettingsPress = () => {
        setIsMenuVisible(false);
        openSettings();
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        if (route.name === 'CashFlow') {
                            iconName = focused ? 'calculator' : 'calculator-outline';
                        } else if (route.name === 'Expenses') {
                            iconName = focused ? 'wallet' : 'wallet-outline';
                        } else if (route.name === 'ProfitTimer') {
                            iconName = focused ? 'timer' : 'timer-outline';
                        } else if (route.name === 'Reports') {
                            iconName = focused ? 'document-text' : 'document-text-outline';
                        } else {
                            iconName = 'help';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: colors.tabBarActive,
                    tabBarInactiveTintColor: colors.tabBarInactive,
                    tabBarStyle: {
                        paddingBottom: 5,
                        height: 60,
                        backgroundColor: colors.tabBar,
                        borderTopColor: colors.border,
                    },
                    headerStyle: {
                        backgroundColor: colors.card,
                        shadowColor: colors.shadow,
                    },
                    headerTintColor: colors.text,
                    tabBarLabel: ({ focused, color }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            title={
                                route.name === 'CashFlow' ? t('navigation.cashFlow') :
                                    route.name === 'Expenses' ? t('navigation.expenses') :
                                        route.name === 'ProfitTimer' ? t('navigation.profitTimer') :
                                            t('reports.title')
                            }
                        />
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                            {isGuest && (
                                <TouchableOpacity onPress={handleGuestLogout} style={{ marginRight: 15 }}>
                                    <Ionicons name="log-out-outline" size={24} color={colors.text} />
                                </TouchableOpacity>
                            )}
                            {user && !isGuest ? (
                                <UserAvatar onPress={toggleMenu} />
                            ) : (
                                <TouchableOpacity onPress={openSettings}>
                                    <Ionicons name="settings-outline" size={24} color={colors.text} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ),
                })}
                detachInactiveScreens={false}
            >
                <Tab.Screen
                    name="CashFlow"
                    component={HomeScreen}
                    options={{
                        title: t('navigation.cashFlow'),
                    }}
                />
                <Tab.Screen
                    name="Expenses"
                    component={ExpensesScreen}
                    options={{
                        title: t('navigation.expenses'),
                    }}
                />
                <Tab.Screen
                    name="ProfitTimer"
                    component={ProfitTimerScreen}
                    options={{
                        title: t('navigation.profitTimer'),
                    }}
                />
                <Tab.Screen
                    name="Reports"
                    component={ReportsScreen}
                    options={{
                        title: t('reports.title'),
                    }}
                />
            </Tab.Navigator>

            <Modal
                visible={isMenuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.menuContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                                <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
                                    <Ionicons name="settings-outline" size={20} color={colors.text} style={styles.menuIcon} />
                                    <Text style={[styles.menuText, { color: colors.text }]}>{t('tabs.settings')}</Text>
                                </TouchableOpacity>
                                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                                <TouchableOpacity style={styles.menuItem} onPress={handleUserLogoutConfirmation}>
                                    <Ionicons name="log-out-outline" size={20} color="#e74c3c" style={styles.menuIcon} />
                                    <Text style={[styles.menuText, { color: '#e74c3c' }]}>{t('auth.logout')}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        marginTop: Platform.OS === 'ios' ? 90 : 60,
        marginRight: 10,
        width: 200,
        borderRadius: 12,
        padding: 5,
        elevation: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    menuIcon: {
        marginRight: 10,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginHorizontal: 10,
    },
});
