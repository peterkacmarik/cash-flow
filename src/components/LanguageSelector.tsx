import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

interface LanguageSelectorProps {
    visible: boolean;
    onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
    ];

    const handleLanguageChange = async (lang: string) => {
        await changeLanguage(lang);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Vyberte jazyk / Select Language</Text>

                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageOption,
                                i18n.language === lang.code && styles.selectedOption,
                            ]}
                            onPress={() => handleLanguageChange(lang.code)}
                        >
                            <Text style={styles.flag}>{lang.flag}</Text>
                            <Text style={[
                                styles.languageLabel,
                                i18n.language === lang.code && styles.selectedLabel,
                            ]}>
                                {lang.label}
                            </Text>
                            {i18n.language === lang.code && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
        textAlign: 'center',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedOption: {
        backgroundColor: '#e8f6fd',
    },
    flag: {
        fontSize: 24,
        marginRight: 12,
    },
    languageLabel: {
        fontSize: 16,
        color: '#34495e',
        flex: 1,
    },
    selectedLabel: {
        fontWeight: 'bold',
        color: '#3498db',
    },
    checkmark: {
        fontSize: 18,
        color: '#3498db',
        fontWeight: 'bold',
    },
});
