import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

import InfoTooltip from './InfoTooltip';

interface ProfitTimerInputProps {
    title: string;
    type: 'percentage' | 'fixed';
    value: string;
    onTypeChange: (type: 'percentage' | 'fixed') => void;
    onValueChange: (value: string) => void;
    tooltipKey?: string;
    placeholder?: string;
    fixedAmountLabel?: string;
}

const ProfitTimerInput = memo(({ title, type, value, onTypeChange, onValueChange, tooltipKey, fixedAmountLabel, placeholder }: ProfitTimerInputProps) => {
    const { t } = useTranslation();
    const { colors } = useSettings();

    return (
        <View style={styles.inputSection}>
            <View style={styles.titleContainer}>
                <Text style={[styles.inputTitle, { color: colors.text }]}>{title}</Text>
                {tooltipKey && <InfoTooltip titleKey={`profitTimer.${tooltipKey}`} textKey={`tooltips.${tooltipKey}`} />}
            </View>
            <View style={[styles.toggleContainer, { backgroundColor: colors.inputBackground }]}>
                <TouchableOpacity
                    style={[styles.toggleButton, type === 'percentage' && [styles.toggleButtonActive, { backgroundColor: colors.card, shadowColor: colors.shadow }]]}
                    onPress={() => onTypeChange('percentage')}
                >
                    <Text style={[styles.toggleText, { color: colors.textSecondary }, type === 'percentage' && [styles.toggleTextActive, { color: colors.text }]]}>%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, type === 'fixed' && [styles.toggleButtonActive, { backgroundColor: colors.card, shadowColor: colors.shadow }]]}
                    onPress={() => onTypeChange('fixed')}
                >
                    <Text style={[styles.toggleText, { color: colors.textSecondary }, type === 'fixed' && [styles.toggleTextActive, { color: colors.text }]]}>123</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={value}
                    onChangeText={onValueChange}
                    keyboardType="numeric"
                    placeholder={placeholder || "0"}
                    placeholderTextColor={colors.textSecondary}
                />
                <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                    {type === 'percentage' ? t('profitTimer.percentage') : (fixedAmountLabel || t('profitTimer.fixedAmountRent'))}
                </Text>
            </View>
        </View>
    );
});

ProfitTimerInput.displayName = 'ProfitTimerInput';

const styles = StyleSheet.create({
    inputSection: {
        marginBottom: 15,
    },
    inputTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: '#ecf0f1',
        borderRadius: 8,
        padding: 2,
        alignSelf: 'flex-start',
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    toggleButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    toggleText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#2c3e50',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dfe6e9',
        borderRadius: 8,
        padding: 10,
        width: 100,
        fontSize: 16,
        color: '#2c3e50',
        marginRight: 10,
    },
    unitText: {
        fontSize: 14,
        color: '#7f8c8d',
    },
});

export default ProfitTimerInput;
