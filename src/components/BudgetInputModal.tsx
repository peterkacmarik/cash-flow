import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

interface BudgetInputModalProps {
    visible: boolean;
    title: string;
    initialValue: number;
    onClose: () => void;
    onSave: (value: number) => void;
    currencySymbol?: string;
}

export default function BudgetInputModal({
    visible,
    title,
    initialValue,
    onClose,
    onSave,
    currencySymbol = 'Kč',
}: BudgetInputModalProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();
    const [value, setValue] = useState(initialValue.toString());

    useEffect(() => {
        if (visible) {
            setValue(initialValue.toString());
        }
    }, [visible, initialValue]);

    const handleSave = () => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            onSave(numValue);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <View style={[styles.content, { backgroundColor: colors.background }]}>
                                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

                                <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={value}
                                        onChangeText={setValue}
                                        keyboardType="numeric"
                                        autoFocus
                                        selectTextOnFocus
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                    <Text style={[styles.currency, { color: colors.textSecondary }]}>{currencySymbol}</Text>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton, { backgroundColor: colors.inputBackground }]}
                                        onPress={onClose}
                                    >
                                        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
    },
    content: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#3498db',
        marginBottom: 24,
        paddingBottom: 8,
    },
    input: {
        flex: 1,
        fontSize: 24,
        color: '#2c3e50',
        textAlign: 'center',
        fontWeight: '600',
    },
    currency: {
        fontSize: 24,
        color: '#7f8c8d',
        marginLeft: 8,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ecf0f1',
    },
    saveButton: {
        backgroundColor: '#2ecc71',
    },
    cancelButtonText: {
        color: '#7f8c8d',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
