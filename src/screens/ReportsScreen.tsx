import * as React from 'react';
import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
    useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { TabView, TabBar } from 'react-native-tab-view';
import { useFocusEffect } from '@react-navigation/native';

import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Report } from '../types/report';
import { dataService } from '../services/dataService';
import { generatePDFReport } from '../utils/pdfGenerator';

export default function ReportsScreen() {
    const { t, i18n } = useTranslation();
    const { colors, currency, dataVersion } = useSettings();
    const { user } = useAuth();
    const layout = useWindowDimensions();

    // TabView state
    const [index, setIndex] = useState(0);
    const routes = (React as any).useMemo(() => [
        { key: 'cashFlow', title: t('reports.tabs.cashFlow') },
        { key: 'expenses', title: t('reports.tabs.expenses') },
        { key: 'profitTimer', title: t('reports.tabs.profitTimer') },
    ], [t, i18n.language]);

    // Reports state
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [newName, setNewName] = useState('');

    const fetchReports = async () => {
        try {
            const loadedReports = await dataService.getReports(user?.id);
            setReports(loadedReports.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [user?.id, dataVersion])
    );

    // Use casting to Partial to strictly handle potential missing type in legacy data
    const cashFlowReports = reports.filter((r: Report) => r.type === 'cashFlow' || !(r as Partial<Report>).type);
    const profitTimerReports = reports.filter((r: Report) => r.type === 'profitTimer');
    const expensesReports = reports.filter((r: Report) => r.type === 'expenses');
    const getReportUri = async (report: Report): Promise<string | null> => {
        if (report.fileUri && (await FileSystem.getInfoAsync(report.fileUri)).exists) {
            return report.fileUri;
        }

        // If not found, regenerate it
        try {
            if (report.inputs) {
                // Ensure inputs are correctly typed for the generator
                // The generator handles type checking based on report.type
                const uri = await generatePDFReport(
                    report.name,
                    report.inputs,
                    report.results || {}, // Expenses might have empty results
                    'EUR', // Default currency if not saved (should ideally be saved)
                    report.type
                );
                return uri;
            }
            return null;
        } catch (error) {
            console.error('Error regenerating report:', error);
            return null;
        }
    };

    const handleShare = async (report: Report) => {
        try {
            const uri = await getReportUri(report);
            if (!uri) {
                Alert.alert(t('common.error'), t('reports.fileNotFound'));
                return;
            }

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert(t('common.error'), 'Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error sharing report:', error);
            Alert.alert(t('common.error'), t('reports.shareError'));
        }
    };

    const handleDownload = async (report: Report) => {
        try {
            const uri = await getReportUri(report);
            if (!uri) {
                Alert.alert(t('common.error'), t('reports.fileNotFound'));
                return;
            }

            const downloadDir = FileSystem.documentDirectory + 'Download/';
            const dirInfo = await FileSystem.getInfoAsync(downloadDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
            }

            const fileName = `${report.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
            const downloadPath = downloadDir + fileName;

            await FileSystem.copyAsync({
                from: uri,
                to: downloadPath,
            });

            Alert.alert(
                t('common.success'),
                t('reports.downloadSuccess', { fileName })
            );
        } catch (error) {
            console.error('Error downloading report:', error);
            Alert.alert(t('common.error'), t('reports.downloadError'));
        }
    };

    const handleDelete = (report: Report) => {
        Alert.alert(
            t('reports.deleteReport'),
            t('reports.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dataService.deleteReport(report.id, user?.id);
                            await fetchReports();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('reports.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleRename = (report: Report) => {
        setSelectedReport(report);
        setNewName(report.name);
        setRenameModalVisible(true);
    };

    const confirmRename = async () => {
        if (!selectedReport || !newName.trim()) return;

        try {
            await dataService.renameReport(selectedReport.id, newName.trim(), user?.id);
            setRenameModalVisible(false);

            setTimeout(async () => {
                setSelectedReport(null);
                setNewName('');
                await fetchReports();
            }, 500);
        } catch (error) {
            Alert.alert(t('common.error'), t('reports.renameError'));
        }
    };

    const renderReport = ({ item }: { item: Report }) => {
        const date = new Date(item.createdAt).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <View style={[styles.reportCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <View style={styles.reportInfo}>
                    <Text style={[styles.reportName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.scenarioName, { color: colors.textSecondary }]}>
                        {item.scenarioName}
                    </Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {t('reports.createdAt')}: {date}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleShare(item)}
                    >
                        <Ionicons name="share-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                        onPress={() => handleDownload(item)}
                    >
                        <Ionicons name="download-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#f97316' }]}
                        onPress={() => handleRename(item)}
                    >
                        <Ionicons name="pencil-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                        onPress={() => handleDelete(item)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmpty = (type: 'cashFlow' | 'profitTimer' | 'expenses') => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('reports.noReports')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {t('reports.noReportsSubtext')}
            </Text>
        </View>
    );

    const CashFlowRoute = () => (
        <FlatList
            data={cashFlowReports}
            renderItem={renderReport}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => renderEmpty('cashFlow')}
        />
    );

    const ProfitTimerRoute = () => (
        <FlatList
            data={profitTimerReports}
            renderItem={renderReport}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => renderEmpty('profitTimer')}
        />
    );

    const ExpensesRoute = () => (
        <FlatList
            data={expensesReports}
            renderItem={renderReport}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => renderEmpty('expenses')}
        />
    );

    const ComingSoonRoute = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('reports.comingSoon')}
            </Text>
        </View>
    );

    const renderScene = ({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'cashFlow':
                return <CashFlowRoute />;
            case 'expenses':
                return <ExpensesRoute />;
            case 'profitTimer':
                return <ProfitTimerRoute />;
            default:
                return null;
        }
    };

    const renderTabBar = useCallback((props: any) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: colors.primary }]}
            style={[styles.tabBar, { backgroundColor: colors.tabBar, borderBottomColor: colors.border }]}
            labelStyle={styles.label}
            activeColor={colors.tabBarActive}
            inactiveColor={colors.tabBarInactive}
        />
    ), [colors]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
            />

            <Modal
                visible={renameModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRenameModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {t('reports.renameReport')}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder={t('reports.reportName')}
                            placeholderTextColor={colors.textSecondary}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.border }]}
                                onPress={() => setRenameModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={confirmRename}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                                    {t('common.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    reportCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    reportInfo: {
        marginBottom: 12,
    },
    reportName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    scenarioName: {
        fontSize: 14,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
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
