import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { TabView, TabBar } from 'react-native-tab-view';
import { loadScenarios } from '../utils/storage';
import { calculateCashFlow, formatCurrency } from '../utils/calculations';
import { calculateTimeToPositive, ProfitTimerResult } from '../utils/profitTimer';
import { Scenario } from '../types/scenario';
import { ProfitTimerCalculation } from '../types/profitTimer';
import { useSettings } from '../context/SettingsContext';
import {
    saveProfitTimerCalculation,
    loadProfitTimerCalculations,
    deleteProfitTimerCalculation,
    renameProfitTimerCalculation,
    generateId,
} from '../utils/profitTimerStorage';
import SaveProfitTimerModal from '../components/SaveProfitTimerModal';
import ProfitTimerCalculationCard from '../components/ProfitTimerCalculationCard';
import RenameScenarioModal from '../components/RenameScenarioModal';
import ProfitTimerInput from '../components/ProfitTimerInput';


export default function ProfitTimerScreen() {
    const { t, i18n } = useTranslation();
    const { currency, dataVersion, colors } = useSettings();
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

    // Tab navigation
    const [index, setIndex] = useState(0);
    const routes = useMemo(() => [
        { key: 'calculator', title: t('profitTimer.calculator') },
        { key: 'saved', title: t('profitTimer.savedCalculations') },
    ], [t, i18n.language]);

    // Inputs
    const [rentGrowthType, setRentGrowthType] = useState<'percentage' | 'fixed'>('percentage');
    const [rentGrowthValue, setRentGrowthValue] = useState(''); // Default empty
    const [expenseReductionType, setExpenseReductionType] = useState<'percentage' | 'fixed'>('percentage');
    const [expenseReductionValue, setExpenseReductionValue] = useState('');

    const [result, setResult] = useState<ProfitTimerResult | null>(null);

    // Saved calculations
    const [savedCalculations, setSavedCalculations] = useState<ProfitTimerCalculation[]>([]);
    const [loadedCalculation, setLoadedCalculation] = useState<ProfitTimerCalculation | null>(null);

    // Modals
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [calculationToRename, setCalculationToRename] = useState<ProfitTimerCalculation | null>(null);

    // Handle input changes with useCallback to prevent keyboard from hiding
    const handleRentGrowthValueChange = useCallback((text: string) => {
        setRentGrowthValue(text);
    }, []);

    const handleExpenseReductionValueChange = useCallback((text: string) => {
        setExpenseReductionValue(text);
    }, []);


    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [allScenarios, calculations] = await Promise.all([
                loadScenarios(),
                loadProfitTimerCalculations(),
            ]);

            // Filter only negative cash flow scenarios
            const negativeScenarios = allScenarios.filter(s => {
                const res = calculateCashFlow(s.inputs);
                return res.mesacnyCashFlow < 0;
            });
            setScenarios(negativeScenarios);
            setSavedCalculations(calculations);

            // Update selected scenario logic
            setSelectedScenario(current => {
                if (current) {
                    // Try to find the currently selected scenario in the new list
                    const updated = negativeScenarios.find(s => s.id === current.id);
                    // If found, use the new object (with updated data)
                    // If not found (deleted or no longer negative), select first available or null
                    return updated || (negativeScenarios.length > 0 ? negativeScenarios[0] : null);
                } else {
                    // If nothing selected, select first available
                    return negativeScenarios.length > 0 ? negativeScenarios[0] : null;
                }
            });
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData, dataVersion])
    );

    const handleSaveCalculation = async (name: string) => {
        if (!selectedScenario || !result) return;

        const calculation: ProfitTimerCalculation = {
            id: loadedCalculation?.id || generateId(),
            name,
            scenarioId: selectedScenario.id,
            rentGrowthType,
            rentGrowthValue: parseFloat(rentGrowthValue.replace(',', '.')),
            expenseReductionType,
            expenseReductionValue: parseFloat(expenseReductionValue.replace(',', '.')),
            monthsToPositive: result.monthsToPositive,
            yearsToPositive: result.yearsToPositive,
            createdAt: loadedCalculation?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            await saveProfitTimerCalculation(calculation);
            await loadData();

            // If updating, reset the form to default state
            if (loadedCalculation) {
                handleCancelEdit();
                Alert.alert(t('common.success'), t('profitTimer.calculationUpdated'));
            } else {
                setLoadedCalculation(null);
                Alert.alert(t('common.success'), t('profitTimer.calculationSaved'));
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('scenarios.saveError'));
        }
    };

    const handleLoadCalculation = (calculation: ProfitTimerCalculation) => {
        const scenario = scenarios.find(s => s.id === calculation.scenarioId);
        if (scenario) {
            setSelectedScenario(scenario);
            setRentGrowthType(calculation.rentGrowthType);
            setRentGrowthValue(calculation.rentGrowthValue.toString());
            setExpenseReductionType(calculation.expenseReductionType);
            setExpenseReductionValue(calculation.expenseReductionValue.toString());
            setLoadedCalculation(calculation);
            setIndex(0); // Switch to calculator tab

            // Auto-calculate
            const res = calculateTimeToPositive({
                scenario,
                rentGrowthType: calculation.rentGrowthType,
                rentGrowthValue: calculation.rentGrowthValue,
                expenseReductionType: calculation.expenseReductionType,
                expenseReductionValue: calculation.expenseReductionValue,
            });
            setResult(res);
        }
    };

    const handleDeleteCalculation = async (calculation: ProfitTimerCalculation) => {
        Alert.alert(
            t('profitTimer.deleteCalculation'),
            t('profitTimer.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProfitTimerCalculation(calculation.id);
                            await loadData();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('scenarios.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleRenameCalculation = (calculation: ProfitTimerCalculation) => {
        setCalculationToRename(calculation);
        setRenameModalVisible(true);
    };

    const handleConfirmRename = async (newName: string) => {
        if (calculationToRename) {
            try {
                await renameProfitTimerCalculation(calculationToRename.id, newName);
                await loadData();
            } catch (error) {
                Alert.alert(t('common.error'), t('scenarios.renameError'));
            }
        }
    };

    const handleCancelEdit = () => {
        setLoadedCalculation(null);
        setRentGrowthValue('');
        setExpenseReductionValue('');
        setResult(null);
    };


    const handleCalculate = () => {
        if (!selectedScenario) return;

        const rValue = parseFloat((rentGrowthValue || '0').replace(',', '.'));
        const eValue = parseFloat((expenseReductionValue || '0').replace(',', '.'));

        if (isNaN(rValue) || isNaN(eValue)) {
            Alert.alert(t('common.error'), 'Please enter valid numbers');
            return;
        }

        const res = calculateTimeToPositive({
            scenario: selectedScenario,
            rentGrowthType,
            rentGrowthValue: rValue,
            expenseReductionType,
            expenseReductionValue: eValue,
        });

        setResult(res);
    };

    const getCurrencySymbol = () => {
        switch (currency) {
            case 'CZK': return 'Kč';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return '€';
        }
    };

    const renderScenarioSelector = () => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('profitTimer.selectScenario')}</Text>
            {scenarios.length === 0 ? (
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>{t('profitTimer.noNegativeScenarios')}</Text>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scenarioList}>
                    {scenarios.map(s => {
                        const cf = calculateCashFlow(s.inputs).mesacnyCashFlow;
                        const isSelected = selectedScenario?.id === s.id;
                        return (
                            <TouchableOpacity
                                key={s.id}
                                style={[styles.scenarioCard, { backgroundColor: colors.card, borderColor: colors.border }, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                onPress={() => {
                                    setSelectedScenario(s);
                                    setResult(null);
                                }}
                            >
                                <Text style={[styles.scenarioName, { color: colors.text }, isSelected && styles.textSelected]}>
                                    {s.name}
                                </Text>
                                <Text style={[styles.scenarioCF, isSelected && styles.textSelected]}>
                                    {formatCurrency(cf).replace('Kč', getCurrencySymbol())}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );

    const renderResults = () => {
        if (!result) return null;

        return (
            <View style={styles.resultContainer}>
                {result.isNeverPositive ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{t('profitTimer.neverPositive')}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.statsContainer}>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.statIconContainer}>
                                    <Text style={styles.statIcon}>📅</Text>
                                </View>
                                <Text style={[styles.statValue, { color: colors.text }]}>{result.monthsToPositive}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profitTimer.monthsToPositive')}</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.statIconContainer}>
                                    <Text style={styles.statIcon}>🎯</Text>
                                </View>
                                <Text style={[styles.statValue, { color: colors.text }]}>{result.yearsToPositive}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profitTimer.yearsToPositive')}</Text>
                            </View>
                        </View>

                        <View style={[styles.timelineContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                            <View style={[styles.timelineHeader, { backgroundColor: colors.inputBackground, borderBottomColor: colors.border }]}>
                                <Text style={[styles.timelineTitle, { color: colors.text }]}>📊 {t('profitTimer.timeline')}</Text>
                            </View>
                            {result.monthlyTimeline.filter((_, i) => i % 12 === 0 || i === result.monthlyTimeline.length - 1).slice(0, 10).map((item, index) => (
                                <View key={index} style={[styles.timelineCard, { borderBottomColor: colors.border }]}>
                                    <View style={[styles.timelineMonthBadge, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={[styles.timelineMonthText, { color: colors.primary }]}>{t('profitTimer.month')} {item.month}</Text>
                                    </View>
                                    <View style={styles.timelineDetails}>
                                        <View style={styles.timelineRow}>
                                            <View style={[styles.timelineItem, { backgroundColor: colors.inputBackground }]}>
                                                <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>{t('profitTimer.rent')}</Text>
                                                <Text style={[styles.timelineValue, { color: colors.text }]}>{Math.round(item.rent).toLocaleString()}</Text>
                                            </View>
                                            <View style={[styles.timelineItem, { backgroundColor: colors.inputBackground }]}>
                                                <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>{t('profitTimer.expenses')}</Text>
                                                <Text style={[styles.timelineValue, { color: colors.text }]}>{Math.round(item.expenses).toLocaleString()}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cashFlowBadge, { backgroundColor: item.isPositive ? '#d4edda' : '#f8d7da', borderColor: colors.border }]}>
                                            <Text style={[styles.cashFlowLabel, { color: colors.text }]}>Cash Flow</Text>
                                            <Text style={[styles.cashFlowValue, { color: item.isPositive ? '#155724' : '#721c24' }]}>
                                                {item.isPositive ? '+' : ''}{Math.round(item.cashFlow).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>
        );
    };

    const renderCalculatorTab = useCallback(() => (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={styles.tabContent}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="always"
            >
                {renderScenarioSelector()}

                {selectedScenario && (
                    <>
                        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                            <ProfitTimerInput
                                title={t('profitTimer.rentGrowth')}
                                type={rentGrowthType}
                                value={rentGrowthValue}
                                onTypeChange={setRentGrowthType}
                                onValueChange={handleRentGrowthValueChange}
                                tooltipKey="rentGrowth"
                                fixedAmountLabel={t('profitTimer.fixedAmountRent')}
                                placeholder="0"
                            />
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <ProfitTimerInput
                                title={t('profitTimer.expenseReduction')}
                                type={expenseReductionType}
                                value={expenseReductionValue}
                                onTypeChange={setExpenseReductionType}
                                onValueChange={handleExpenseReductionValueChange}
                                tooltipKey="expenseReduction"
                                fixedAmountLabel={t('profitTimer.fixedAmountExpense')}
                                placeholder="0"
                            />

                            <View style={styles.actionContainer}>
                                {result && (
                                    <View style={styles.leftActions}>
                                        {loadedCalculation ? (
                                            <View style={styles.editActions}>
                                                <TouchableOpacity
                                                    style={[styles.iconButton, styles.cancelButton]}
                                                    onPress={handleCancelEdit}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="close-outline" size={24} color="#fff" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.iconButton, styles.updateButton]}
                                                    onPress={() => handleSaveCalculation(loadedCalculation.name)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View style={styles.editActions}>
                                                <TouchableOpacity
                                                    style={[styles.iconButton, styles.cancelButton]}
                                                    onPress={handleCancelEdit}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="close-outline" size={24} color="#fff" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.iconButton, styles.saveButton]}
                                                    onPress={() => setSaveModalVisible(true)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="save-outline" size={24} color="#fff" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.calculateButton}
                                    onPress={handleCalculate}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="calculator-outline" size={24} color="#fff" style={styles.buttonIcon} />
                                    <Text style={styles.calculateButtonText}>{t('profitTimer.calculate')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {renderResults()}
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    ), [
        selectedScenario,
        rentGrowthType,
        rentGrowthValue,
        expenseReductionType,
        expenseReductionValue,
        result,
        loadedCalculation,
        t,
        handleRentGrowthValueChange,
        handleExpenseReductionValueChange,
        handleCalculate,
        handleCancelEdit,
        renderScenarioSelector,
        renderResults,
    ]);


    const renderSavedCalculationsTab = () => {
        if (savedCalculations.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('profitTimer.noSavedCalculations')}</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={savedCalculations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => {
                    const scenario = scenarios.find(s => s.id === item.scenarioId);
                    return (
                        <ProfitTimerCalculationCard
                            calculation={item}
                            scenarioName={scenario?.name || t('scenarios.deleted')}
                            onLoad={() => handleLoadCalculation(item)}
                            onRename={() => handleRenameCalculation(item)}
                            onDelete={() => handleDeleteCalculation(item)}
                        />
                    );
                }}
            />
        );
    };

    const renderScene = useCallback(({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'calculator':
                return renderCalculatorTab();
            case 'saved':
                return renderSavedCalculationsTab();
            default:
                return null;
        }
    }, [renderCalculatorTab, renderSavedCalculationsTab]);

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: colors.primary }]}
            style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
            labelStyle={styles.label}
            activeColor={colors.primary}
            inactiveColor={colors.textSecondary}
        />
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={renderTabBar}
            />
            <SaveProfitTimerModal
                visible={saveModalVisible}
                onClose={() => setSaveModalVisible(false)}
                onSave={handleSaveCalculation}
                initialName={loadedCalculation?.name}
            />
            <RenameScenarioModal
                visible={renameModalVisible}
                currentName={calculationToRename?.name || ''}
                onClose={() => setRenameModalVisible(false)}
                onSave={handleConfirmRename}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 10,
    },
    noDataText: {
        color: '#7f8c8d',
        fontStyle: 'italic',
    },
    scenarioList: {
        flexDirection: 'row',
    },
    scenarioCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginRight: 10,
        minWidth: 140,
        borderWidth: 1,
        borderColor: '#ecf0f1',
    },
    scenarioCardSelected: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    scenarioName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
    },
    scenarioCF: {
        fontSize: 14,
        color: '#e74c3c',
        fontWeight: '600',
    },
    textSelected: {
        color: '#fff',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    inputSection: {
        marginBottom: 15,
    },
    inputTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
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
    divider: {
        height: 1,
        backgroundColor: '#ecf0f1',
        marginVertical: 15,
    },

    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 10,
    },
    leftActions: {
        flexDirection: 'row',
        gap: 10,
    },
    calculateButton: {
        backgroundColor: '#3498db',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        height: 50,
        borderRadius: 25,
        flex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonIcon: {
        marginRight: 8,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    editActions: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButton: {
        backgroundColor: '#2ecc71',
    },
    cancelButton: {
        backgroundColor: '#95a5a6',
    },
    updateButton: {
        backgroundColor: '#2ecc71',
    },
    resultContainer: {
        marginBottom: 20,
    },
    errorBox: {
        backgroundColor: '#fff3cd',
        padding: 25,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffc107',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    errorText: {
        color: '#856404',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    statIconContainer: {
        marginBottom: 12,
    },
    statIcon: {
        fontSize: 36,
    },
    statValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
        color: '#7f8c8d',
        textAlign: 'center',
        fontWeight: '500',
    },
    timelineContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    timelineHeader: {
        padding: 16,
        borderBottomWidth: 1,
    },
    timelineTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    timelineCard: {
        padding: 16,
        borderBottomWidth: 1,
    },
    timelineMonthBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    timelineMonthText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    timelineDetails: {
        gap: 12,
    },
    timelineRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    timelineItem: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
    },
    timelineLabel: {
        fontSize: 11,
        marginBottom: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    timelineValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cashFlowBadge: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    cashFlowLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    cashFlowValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Tab navigation styles
    tabBar: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        paddingTop: 0,
    },
    indicator: {
        backgroundColor: '#3498db',
        height: 3,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
    },
    tabContent: {
        flex: 1,
    },

    // Saved calculations list
    listContainer: {
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
});
