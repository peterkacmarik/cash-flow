import React from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface InfoTooltipProps {
    titleKey: string;
    textKey: string;
}

export default function InfoTooltip({ titleKey, textKey }: InfoTooltipProps) {
    const { t } = useTranslation();

    const handlePress = () => {
        Alert.alert(
            t(titleKey),
            t(textKey),
            [{ text: 'OK', style: 'default' }]
        );
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={styles.container}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="information-circle-outline" size={20} color="#3498db" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 8,
    },
});
