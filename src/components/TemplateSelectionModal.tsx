import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { PROPERTY_TEMPLATES } from '../utils/templates';
import { PropertyTemplate } from '../types/template';
import { getCurrencySymbol } from '../utils/settings';

interface TemplateSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectTemplate: (template: PropertyTemplate) => void;
}

export default function TemplateSelectionModal({
    visible,
    onClose,
    onSelectTemplate,
}: TemplateSelectionModalProps) {
    const { t } = useTranslation();
    const { colors, currency } = useSettings();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const currencySymbol = getCurrencySymbol(currency);

    const handleSelect = (template: PropertyTemplate) => {
        onSelectTemplate(template);
        onClose();
    };

    const renderPreview = (template: PropertyTemplate) => {
        if (selectedId !== template.id) return null;

        return (
            <View style={[styles.previewContainer, { backgroundColor: colors.inputBackground }]}>
                <Text style={[styles.previewTitle, { color: colors.textSecondary }]}>{t('templates.preview')}</Text>
                <View style={styles.previewGrid}>
                    <View style={styles.previewItem}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>{t('inputs.purchasePrice')}</Text>
                        <Text style={[styles.previewValue, { color: colors.text }]}>
                            {(template.inputs.kupnaCena || 0).toLocaleString()} {currencySymbol}
                        </Text>
                    </View>
                    <View style={styles.previewItem}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>{t('inputs.expectedRent')}</Text>
                        <Text style={[styles.previewValue, { color: colors.text }]}>
                            {(template.inputs.ocakavaneNajomne || 0).toLocaleString()} {currencySymbol}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.useButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleSelect(template)}
                >
                    <Text style={styles.useButtonText}>{t('templates.useTemplate')}</Text>
                </TouchableOpacity>
            </View>
        );
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
                        <View style={[styles.content, { backgroundColor: colors.card }]}>
                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.title, { color: colors.text }]}>{t('templates.loadTemplate')}</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('templates.selectTemplate')}
                            </Text>

                            <ScrollView style={styles.listContainer}>
                                {PROPERTY_TEMPLATES.map((template: PropertyTemplate) => (
                                    <View key={template.id} style={styles.templateWrapper}>
                                        <TouchableOpacity
                                            style={[
                                                styles.templateCard,
                                                {
                                                    backgroundColor: colors.background,
                                                    borderColor: selectedId === template.id ? colors.primary : colors.border,
                                                    borderWidth: selectedId === template.id ? 2 : 1
                                                }
                                            ]}
                                            onPress={() => setSelectedId(selectedId === template.id ? null : template.id)}
                                        >
                                            <Text style={styles.icon}>{template.icon}</Text>
                                            <View style={styles.textContainer}>
                                                <Text style={[styles.templateName, { color: colors.text }]}>
                                                    {t(template.name)}
                                                </Text>
                                                <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
                                                    {t(template.description)}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        {renderPreview(template)}
                                    </View>
                                ))}
                            </ScrollView>
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
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 15,
    },
    listContainer: {
        marginBottom: 20,
    },
    templateWrapper: {
        marginBottom: 15,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
    },
    icon: {
        fontSize: 32,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    templateName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    templateDescription: {
        fontSize: 12,
    },
    previewContainer: {
        marginTop: 10,
        padding: 15,
        borderRadius: 12,
        marginLeft: 20,
        marginRight: 5,
    },
    previewTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    previewGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    previewItem: {
        flex: 1,
    },
    previewLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    previewValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    useButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    useButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
