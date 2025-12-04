import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Dimensions,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import InputForm from '../components/InputForm';
import ResultsDisplay from '../components/ResultsDisplay';
import ScenarioList from '../components/ScenarioList';
import SaveScenarioModal from '../components/SaveScenarioModal';
import TemplateSelectionModal from '../components/TemplateSelectionModal';
import { useSettings } from '../context/SettingsContext';
import {
    PropertyInputs,
    CalculationResults,
    calculateCashFlow,
} from '../utils/calculations';
import { saveScenario, updateScenario } from '../utils/storage';
import { Scenario } from '../types/scenario';
import { PropertyTemplate } from '../types/template';

const initialInputs: PropertyInputs = {
    kupnaCena: 0,
    vlastneZdroje: 0,
    vyskaHypoteky: 0,
    urok: 0,
    dobaSplatnosti: 0,
    ocakavaneNajomne: 0,
    obsadenost: 0,
    fondOprav: 0,
    sprava: 0,
    poistenie: 0,
    danZNehnutelnosti: 0,
    energie: 0,
    internet: 0,
    ineNaklady: 0,
    neocakavaneNaklady: 0,
};

export default function HomeScreen() {
    const { t, i18n } = useTranslation();
    const { notifyDataChanged, colors, theme } = useSettings();
    const [inputs, setInputs] = useState<PropertyInputs>(initialInputs);
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [index, setIndex] = useState(0);

    // Use useMemo to update routes when language changes
    const routes = useMemo(() => [
        { key: 'input', title: t('tabs.inputs') },
        { key: 'results', title: t('tabs.results') },
        { key: 'scenarios', title: t('tabs.scenarios') },
    ], [t, i18n.language]);

    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [tempInputs, setTempInputs] = useState<PropertyInputs | null>(null);
    const [loadedScenario, setLoadedScenario] = useState<Scenario | null>(null);
    const [resetTrigger, setResetTrigger] = useState(0);

    const handleCalculate = useCallback((values: PropertyInputs) => {
        setInputs(values);
        const calculatedResults = calculateCashFlow(values);
        setResults(calculatedResults);
        setIndex(1);
    }, []);

    const handleSaveScenario = useCallback((values: PropertyInputs) => {
        setTempInputs(values);
        setSaveModalVisible(true);
    }, []);

    const handleConfirmSave = async (name: string) => {
        if (tempInputs) {
            try {
                await saveScenario(name, tempInputs);
                notifyDataChanged();
                Alert.alert(t('common.success'), t('scenarios.saveSuccess'));
            } catch (error) {
                Alert.alert(t('common.error'), t('scenarios.saveError'));
            }
        }
    };

    const handleLoadScenario = useCallback((scenario: Scenario) => {
        setInputs(scenario.inputs);
        setLoadedScenario(scenario);
        setIndex(0);

        const calculatedResults = calculateCashFlow(scenario.inputs);
        setResults(calculatedResults);
    }, []);

    const handleUpdateScenario = async (values: PropertyInputs) => {
        if (loadedScenario) {
            try {
                await updateScenario(loadedScenario.id, values);
                notifyDataChanged();
                setLoadedScenario(null); // Reset to allow creating new scenarios
                setInputs(initialInputs); // Reset form to default values
                Alert.alert(t('common.success'), t('scenarios.updateSuccess'));
            } catch (error) {
                Alert.alert(t('common.error'), t('scenarios.updateError'));
            }
        }
    };

    const handleCancelEdit = () => {
        setLoadedScenario(null);
        setInputs(initialInputs);
        setResults(null);
        setIndex(2); // Switch to scenarios tab (index 2)
    };

    const handleResetValues = useCallback(() => {
        // Reset only input values to default, keep results and buttons visible
        setInputs(initialInputs);
        setResetTrigger(prev => prev + 1);
    }, []);

    const handleResetCalculation = useCallback(() => {
        // Full reset: clear inputs, results, and loaded scenario
        setInputs(initialInputs);
        setResults(null);
        setLoadedScenario(null);
        setIndex(0); // Stay on input tab
    }, []);

    const handleLoadTemplate = useCallback((template: PropertyTemplate) => {
        // Merge template inputs with current inputs
        const templateInputs: PropertyInputs = {
            ...initialInputs,
            ...template.inputs,
        };
        setInputs(templateInputs);
        setLoadedScenario(null); // Clear any loaded scenario
        setResults(null); // Clear results
        setIndex(0); // Switch to input tab
    }, []);

    const InputRoute = useCallback(() => (
        <InputForm
            inputs={inputs}
            onCalculate={handleCalculate}
            onSaveScenario={handleSaveScenario}
            onUpdateScenario={handleUpdateScenario}
            onCancelEdit={handleCancelEdit}
            onResetValues={handleResetValues}
            onCancel={handleResetCalculation}
            onLoadTemplate={() => setTemplateModalVisible(true)}
            loadedScenario={loadedScenario}
            hasResults={!!results}
            resetTrigger={resetTrigger}
        />
    ), [inputs, handleCalculate, handleSaveScenario, handleUpdateScenario, handleCancelEdit, handleResetValues, handleResetCalculation, loadedScenario, results]);

    const ResultsRoute = useCallback(() => <ResultsDisplay results={results} inputs={inputs} />, [results, inputs]);

    const ScenariosRoute = useCallback(() => (
        <ScenarioList
            onLoadScenario={handleLoadScenario}
        />
    ), [handleLoadScenario]);

    const renderScene = SceneMap({
        input: InputRoute,
        results: ResultsRoute,
        scenarios: ScenariosRoute,
    });

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: colors.primary }]}
            style={[styles.tabBar, { backgroundColor: colors.tabBar, borderBottomColor: colors.border }]}
            labelStyle={styles.label}
            activeColor={colors.tabBarActive}
            inactiveColor={colors.tabBarInactive}
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={renderTabBar}
            />
            <SaveScenarioModal
                visible={saveModalVisible}
                onClose={() => setSaveModalVisible(false)}
                onSave={handleConfirmSave}
            />
            <TemplateSelectionModal
                visible={templateModalVisible}
                onClose={() => setTemplateModalVisible(false)}
                onSelectTemplate={handleLoadTemplate}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
});
