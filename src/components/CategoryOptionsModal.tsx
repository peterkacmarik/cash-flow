import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { Category } from '../types/expense';

interface CategoryOptionsModalProps {
    visible: boolean;
    category?: Category;
    onClose: () => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export default function CategoryOptionsModal({
    visible,
    category,
    onClose,
    onEdit,
    onDelete,
}: CategoryOptionsModalProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();

    if (!category) return null;

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
                            <Text style={[styles.title, { color: colors.text }]}>{category.name}</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('categories.optionsTitle')}</Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.primary }]}
                                    onPress={() => {
                                        onClose();
                                        onEdit(category);
                                    }}
                                >
                                    <Text style={styles.buttonText}>{t('common.edit')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.danger }]}
                                    onPress={() => {
                                        onClose();
                                        onDelete(category);
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
