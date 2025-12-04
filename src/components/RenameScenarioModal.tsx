import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

interface RenameScenarioModalProps {
    visible: boolean;
    currentName: string;
    onClose: () => void;
    onSave: (newName: string) => void;
}

export default function RenameScenarioModal({
    visible,
    currentName,
    onClose,
    onSave,
}: RenameScenarioModalProps) {
    const { t } = useTranslation();
    const { colors } = useSettings();
    const [name, setName] = useState(currentName);

    useEffect(() => {
        if (visible) {
            setName(currentName);
        }
    }, [visible, currentName]);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.card }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{t('scenarios.renameTitle')}</Text>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                            }
                        ]}
                        value={name}
                        onChangeText={setName}
                        placeholder={t('scenarios.namePlaceholder')}
                        placeholderTextColor={colors.textSecondary}
                        autoFocus
                        selectTextOnFocus
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '85%',
        maxWidth: 400,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#dfe6e9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#2c3e50',
        marginBottom: 20,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ecf0f1',
    },
    saveButton: {
        backgroundColor: '#3498db',
    },
    cancelButtonText: {
        color: '#7f8c8d',
        fontWeight: '600',
        fontSize: 14,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
