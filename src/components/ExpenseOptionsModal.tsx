import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { Expense } from '../types/expense';

interface ExpenseOptionsModalProps {
    visible: boolean;
    expense?: Expense;
    onClose: () => void;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
}

export default function ExpenseOptionsModal({
    visible,
    expense,
    onClose,
    onEdit,
    onDelete,
}: ExpenseOptionsModalProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();

    if (!expense) return null;

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
                        <View style={[styles.content, { backgroundColor: colors.card }]}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {expense.description || t('expenses.noDescription')}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('expenses.optionsTitle')}
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.primary }]}
                                    onPress={() => {
                                        onClose();
                                        onEdit(expense);
                                    }}
                                >
                                    <Text style={styles.buttonText}>{t('common.edit')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.danger }]}
                                    onPress={() => {
                                        onClose();
                                        onDelete(expense);
                                    }}
                                >
                                    <Text style={styles.buttonText}>{t('common.delete')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton, { backgroundColor: colors.inputBackground }]}
                                    onPress={onClose}
                                >
                                    <Text style={[styles.buttonText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
    content: {
        width: '80%',
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
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    cancelButton: {
        marginTop: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
