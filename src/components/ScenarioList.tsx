import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Scenario } from '../types/scenario';
import { getScenario, loadScenarios, deleteScenario } from '../utils/storage';
import { calculateCashFlow } from '../utils/calculations';
import { useSettings } from '../context/SettingsContext';
import { getCurrencySymbol } from '../utils/settings';
import { Ionicons } from '@expo/vector-icons';
import RenameScenarioModal from './RenameScenarioModal';
import { renameScenario } from '../utils/storage';

interface ScenarioListProps {
    onLoadScenario: (scenario: Scenario) => void;
}

export default function ScenarioList({ onLoadScenario }: Omit<ScenarioListProps, 'refreshTrigger'>) {
    const { t } = useTranslation();
    const { currency, dataVersion, colors } = useSettings();
    const currencySymbol = getCurrencySymbol(currency);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [scenarioToRename, setScenarioToRename] = useState<Scenario | null>(null);

    useEffect(() => {
        loadScenariosData();
    }, [dataVersion]);

    const loadScenariosData = async () => {
        setLoading(true);
        try {
            const data = await loadScenarios();
            // Sort by date descending
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setScenarios(data);
        } catch (error) {
            console.error('Failed to load scenarios:', error);
            Alert.alert(t('common.error'), t('scenarios.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (scenario: Scenario) => {
        Alert.alert(
            t('scenarios.deleteTitle'),
            t('scenarios.deleteConfirm', { name: scenario.name }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteScenario(scenario.id);
                            loadScenariosData();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('scenarios.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleRename = (scenario: Scenario) => {
        setScenarioToRename(scenario);
        setRenameModalVisible(true);
    };

    const handleRenameSave = async (newName: string) => {
        if (scenarioToRename) {
            try {
                await renameScenario(scenarioToRename.id, newName);
                loadScenariosData();
            } catch (error) {
                Alert.alert(t('common.error'), t('scenarios.renameError'));
            }
        }
    };



    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (value: number) => {
        return `${value.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} ${currencySymbol}`;
    };

    const renderScenario = ({ item }: { item: Scenario }) => {
        // Calculate cash flow for this scenario
        const results = calculateCashFlow(item.inputs);
        const cashFlowColor = results.mesacnyCashFlow >= 0 ? '#27ae60' : '#e74c3c';

        return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.nameContainer}>
                        <Text style={[styles.scenarioName, { color: colors.text }]}>{item.name}</Text>
                        <TouchableOpacity
                            style={styles.editIconButton}
                            onPress={() => handleRename(item)}
                        >
                            <Ionicons name="create-outline" size={22} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.scenarioDate, { color: colors.textSecondary }]}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.details}>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {t('inputs.purchasePrice')}: {formatCurrency(item.inputs?.kupnaCena ?? 0)}
                    </Text>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {t('inputs.expectedRent')}: {formatCurrency(item.inputs?.ocakavaneNajomne ?? 0)}
                    </Text>
                    <Text style={[styles.detailText, styles.cashFlowText, { color: colors.textSecondary }]}>
                        {t('results.cashFlow')}: <Text style={{ color: cashFlowColor, fontWeight: 'bold' }}>
                            {formatCurrency(results.mesacnyCashFlow)}
                        </Text>
                    </Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.loadButton, { backgroundColor: colors.primary }]}
                        onPress={() => onLoadScenario(item)}
                    >
                        <Text style={styles.buttonText}>{t('common.load')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={() => handleDelete(item)}
                    >
                        <Text style={styles.buttonText}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        }

        if (scenarios.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('scenarios.empty')}</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={scenarios}
                renderItem={renderScenario}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        );
    };

    return (
        <>
            {renderContent()}
            <RenameScenarioModal
                visible={renameModalVisible}
                currentName={scenarioToRename?.name || ''}
                onClose={() => setRenameModalVisible(false)}
                onSave={handleRenameSave}
            />
        </>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nameContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    editIconButton: {
        padding: 4,
        marginLeft: 8,
    },
    scenarioName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        flex: 1,
    },
    scenarioDate: {
        fontSize: 12,
        color: '#95a5a6',
    },
    details: {
        marginBottom: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 2,
    },
    cashFlowText: {
        fontSize: 15,
        marginTop: 5,
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
    },
    iconButton: {
        padding: 8,
        marginRight: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    loadButton: {
        backgroundColor: '#3498db',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
