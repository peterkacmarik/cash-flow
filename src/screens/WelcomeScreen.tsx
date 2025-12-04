import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
};

type WelcomeScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();
    const { continueAsGuest } = useAuth();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Logo/Icon */}
                <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                    <Ionicons name="cash-outline" size={80} color="#fff" />
                </View>

                {/* App Title */}
                <Text style={[styles.title, { color: colors.text }]}>
                    Cash Flow Calculator
                </Text>

                {/* Description */}
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {t('auth.appDescription')}
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.primaryButtonText}>{t('auth.login')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.primary }]}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                        {t('auth.register')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.guestButton}
                    onPress={continueAsGuest}
                >
                    <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>
                        {t('auth.continueWithoutLogin')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    buttonsContainer: {
        gap: 12,
        paddingBottom: 20,
    },
    primaryButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    guestButton: {
        padding: 12,
        alignItems: 'center',
    },
    guestButtonText: {
        fontSize: 16,
    },
});
