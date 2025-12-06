import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import SettingsScreen from '../screens/SettingsScreen';
import { useTranslation } from 'react-i18next';

export default function GlobalSettingsModal() {
    const { isSettingsVisible, closeSettings, colors } = useSettings();
    const { t } = useTranslation();

    return (
        <Modal
            visible={isSettingsVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={closeSettings}
        >
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.title')}</Text>
                    <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
                        <Text style={[styles.closeButtonText, { color: colors.primary }]}>{t('common.close')}</Text>
                    </TouchableOpacity>
                </View>
                <SettingsScreen />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        // Add top padding for Android if not using SafeAreaView correctly there, 
        // but SafeAreaView should handle it.
        paddingTop: Platform.OS === 'android' ? 40 : 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        color: '#3498db',
        fontSize: 16,
        fontWeight: '600',
    },
});
