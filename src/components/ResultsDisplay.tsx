import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CalculationResults, PropertyInputs } from '../utils/calculations';
import { useSettings } from '../context/SettingsContext';
import { getCurrencySymbol } from '../utils/settings';
import InfoTooltip from './InfoTooltip';
import ProfitTimerTimelineChart from './charts/ProfitTimerTimelineChart';
import ExpenseBreakdownChart from './charts/ExpenseBreakdownChart';
import ChartCarousel from './charts/ChartCarousel';
import { Scenario } from '../types/scenario';
import { generatePDFReport } from '../utils/pdfGenerator';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { Report } from '../types/report';

interface ResultsDisplayProps {
    results: CalculationResults | null;
    inputs?: PropertyInputs;
}

export default function ResultsDisplay({ results, inputs }: ResultsDisplayProps) {
    const { t } = useTranslation();
    const { currency, colors } = useSettings();
    const { user } = useAuth();
    const currencySymbol = getCurrencySymbol(currency);
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const [reportName, setReportName] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleGeneratePDF = () => {
        setPdfModalVisible(true);
        setReportName(`Report ${new Date().toLocaleDateString('sk-SK')}`);
    };

    const confirmGeneratePDF = async () => {
        if (!reportName.trim() || !results || !inputs) {
            Alert.alert(t('common.error'), t('reports.enterReportName'));
            return;
        }

        setGenerating(true);
        try {
            let fileUri = undefined;
            if (!user) {
                // Generate PDF immediately for guests
                fileUri = await generatePDFReport(
                    reportName,
                    inputs,
                    results,
                    currency
                );
            }

            // For authenticated users, we just save the data and generate PDF on demand
            const report: Report = {
                id: Date.now().toString(), // Will be ignored by Supabase or replaced with UUID
                name: reportName.trim(),
                scenarioName: reportName.trim(),
                type: 'cashFlow',
                createdAt: new Date().toISOString(),
                fileUri: fileUri,
                inputs: user ? inputs : undefined,
                results: user ? results : undefined,
            };

            await dataService.saveReport(report, user?.id);
            setPdfModalVisible(false);

            // Defer success alert to allow modal to close smoothly
            setTimeout(() => {
                setReportName('');
                Alert.alert(t('common.success'), t('reports.reportGenerated'));
            }, 500);

        } catch (error) {
            console.error('Error generating/saving report:', error);
            Alert.alert(t('common.error'), t('reports.reportGenerationError'));
        } finally {
            setGenerating(false);
        }
    };

    if (!results) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('results.noResults')}</Text>
            </View>
        );
    }

    const formatCurrency = (value: number | undefined) => {
        const numValue = value ?? 0;
        return `${numValue.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} ${currencySymbol}`;
    };

    const formatPercent = (value: number | undefined) => {
        return `${(value ?? 0).toFixed(2)} %`;
    };

    const getDSCRColor = (dscr: number) => {
        if (dscr >= 1.25) return '#27ae60'; // Green - excellent
        if (dscr >= 1.0) return '#f39c12'; // Orange - good
        return '#e74c3c'; // Red - risky
    };

    const renderRow = (labelKey: string, value: string, isTotal: boolean = false, valueColor?: string, showTooltip: boolean = false) => (
        <View style={[styles.row, isTotal && styles.totalRow]}>
            <View style={styles.labelContainer}>
                <Text style={[
                    styles.label,
                    isTotal && styles.totalLabel,
                    { color: isTotal ? colors.text : colors.textSecondary }
                ]}>
                    {t(`results.${labelKey}`)}
                </Text>
                {showTooltip && <InfoTooltip titleKey={`results.${labelKey}`} textKey={`results.${labelKey}Explanation`} />}
            </View>
            <Text style={[
                styles.value,
                isTotal && styles.totalValue,
                valueColor ? { color: valueColor } : { color: isTotal ? colors.primary : colors.text }
            ]}>{value}</Text>
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
            {/* Charts Carousel */}
            <ChartCarousel
                charts={[
                    // Show Profit Timer Timeline only for negative cash flow
                    results.mesacnyCashFlow < 0 && inputs && (
                        <ProfitTimerTimelineChart
                            key="timeline"
                            results={results}
                            scenario={{
                                id: 'temp',
                                name: 'Current',
                                inputs: inputs,
                                createdAt: new Date().toISOString(),
                            }}
                            rentGrowthType="percentage"
                            rentGrowthValue={3}
                            expenseReductionType="percentage"
                            expenseReductionValue={0}
                        />
                    ),
                    inputs && <ExpenseBreakdownChart key="expense" inputs={inputs} />,
                ].filter(Boolean) as React.ReactNode[]}
            />

            <View style={styles.contentWrapper}>
                <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.border }]}>{t('results.monthlyOverview')}</Text>
                    {renderRow('grossIncome', formatCurrency(results.efektivneNajomne))}
                    {renderRow('expenses', formatCurrency(results.celkoveMesacneNaklady))}
                    {renderRow('mortgagePayment', formatCurrency(results.mesacnaSplatkaHypoteky))}
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    {renderRow('cashFlow', formatCurrency(results.mesacnyCashFlow), true)}
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.border }]}>{t('results.annualOverview')}</Text>
                    {renderRow('grossIncome', formatCurrency(results.rocnyPrijem))}
                    {renderRow('expenses', formatCurrency(results.celkoveRocneNaklady))}
                    {renderRow('mortgagePayment', formatCurrency(results.celkovaRocnaSplatka))}
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    {renderRow('cashFlow', formatCurrency(results.rocnyCashFlow), true)}
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.border }]}>{t('results.investmentMetrics')}</Text>
                    {renderRow('noi', formatCurrency(results.noi), false, undefined, true)}
                    {renderRow('capRate', formatPercent(results.capRate), false, undefined, true)}
                    {renderRow('cashOnCash', formatPercent(results.cashOnCashReturn), false, undefined, true)}
                    {renderRow('roi', formatPercent(results.roi), false, undefined, true)}
                    {renderRow('dscr', results.dscr.toFixed(2), false, getDSCRColor(results.dscr), true)}
                    {renderRow('breakEvenOccupancy', formatPercent(results.breakEvenOccupancy), false, undefined, true)}
                    {renderRow('totalInvestmentROI', formatPercent(results.totalInvestmentROI), false, undefined, true)}
                    {renderRow('expenseRatio', formatPercent(results.expenseRatio), false, undefined, true)}
                </View>

                {/* PDF Generation Button */}
                <TouchableOpacity
                    style={[styles.pdfButton, { backgroundColor: colors.primary }]}
                    onPress={handleGeneratePDF}
                    disabled={generating}
                >
                    <Ionicons name="document-text-outline" size={24} color="#fff" />
                    <Text style={styles.pdfButtonText}>
                        {generating ? t('common.loading') : t('reports.generateReport')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* PDF Name Modal */}
            <Modal
                visible={pdfModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPdfModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {t('reports.generateReport')}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                            value={reportName}
                            onChangeText={setReportName}
                            placeholder={t('reports.reportName')}
                            placeholderTextColor={colors.textSecondary}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.border }]}
                                onPress={() => setPdfModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={confirmGeneratePDF}
                                disabled={generating}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                                    {t('common.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    contentWrapper: {
        paddingHorizontal: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        paddingBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        alignItems: 'center',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    label: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    value: {
        fontSize: 16,
        color: '#2c3e50',
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#ecf0f1',
        marginVertical: 10,
    },
    totalRow: {
        marginTop: 5,
    },
    totalLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    totalValue: {
        fontWeight: 'bold',
        color: '#27ae60',
        fontSize: 18,
    },
    explanation: {
        fontSize: 12,
        color: '#95a5a6',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    pdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 20,
        gap: 8,
    },
    pdfButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
