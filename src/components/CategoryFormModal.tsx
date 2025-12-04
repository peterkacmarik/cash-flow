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
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Category } from '../types/expense';
import { generateId } from '../utils/expenseStorage';
import { useSettings } from '../context/SettingsContext';

interface CategoryFormModalProps {
    visible: boolean;
    category?: Category;
    onClose: () => void;
    onSave: (category: Category) => void;
}

const COLORS = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
    '#3498db', '#9b59b6', '#34495e', '#95a5a6', '#7f8c8d'
];

const ICONS = ['🏠', '🚗', '🛒', '🍽️', '💡', '💊', '🎮', '✈️', '🎓', '🎁', '💼', '👶', '🐾', '🏋️', '📱', '💸'];

export default function CategoryFormModal({
    visible,
    category,
    onClose,
    onSave,
}: CategoryFormModalProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState(ICONS[0]);
    const [color, setColor] = useState(COLORS[0]);
    const [budget, setBudget] = useState('0');

    useEffect(() => {
        if (visible) {
            if (category) {
                setName(category.name);
                setIcon(category.icon);
                setColor(category.color);
                setBudget(category.budget.toString());
            } else {
                setName('');
                setIcon(ICONS[0]);
                setColor(COLORS[0]);
                setBudget('0');
            }
        }
    }, [visible, category]);

    const handleSave = () => {
        if (!name.trim()) return;

        const newCategory: Category = {
            id: category?.id || generateId(),
            name: name.trim(),
            icon,
            color,
            budget: parseFloat(budget) || 0,
            isCustom: true,
        };

        onSave(newCategory);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
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
                                <Text style={[styles.title, { color: colors.text }]}>
                                    {category ? t('categories.editCategory') : t('categories.addCategory')}
                                </Text>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('categories.name')}</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder={t('categories.namePlaceholder')}
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('categories.budget')}</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                                        value={budget}
                                        onChangeText={setBudget}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('categories.icon')}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
                                        {ICONS.map((i) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.iconOption, icon === i && [styles.selectedOption, { borderColor: colors.text }]]}
                                                onPress={() => setIcon(i)}
                                            >
                                                <Text style={styles.iconText}>{i}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('categories.color')}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
                                        {COLORS.map((c) => (
                                            <TouchableOpacity
                                                key={c}
                                                style={[
                                                    styles.colorOption,
                                                    { backgroundColor: c },
                                                    color === c && [styles.selectedOption, { borderColor: colors.text }]
                                                ]}
                                                onPress={() => setColor(c)}
                                            />
                                        ))}
                                    </ScrollView>
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
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    content: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7f8c8d',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#2c3e50',
    },
    selector: {
        flexDirection: 'row',
    },
    iconOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        borderColor: '#2c3e50',
    },
    iconText: {
        fontSize: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
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
