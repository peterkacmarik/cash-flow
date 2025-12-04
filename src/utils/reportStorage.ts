import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Report, ReportMetadata } from '../types/report';

const REPORTS_KEY = '@cash_flow_reports';

export const saveReport = async (report: Report): Promise<void> => {
    try {
        const existingReports = await loadReports();
        const updatedReports = [...existingReports, report];
        await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
    } catch (error) {
        console.error('Error saving report:', error);
        throw error;
    }
};

export const loadReports = async (): Promise<Report[]> => {
    try {
        const reportsJson = await AsyncStorage.getItem(REPORTS_KEY);
        if (!reportsJson) return [];
        return JSON.parse(reportsJson);
    } catch (error) {
        console.error('Error loading reports:', error);
        return [];
    }
};

export const deleteReport = async (id: string): Promise<void> => {
    try {
        const reports = await loadReports();
        const reportToDelete = reports.find(r => r.id === id);

        if (reportToDelete) {
            // Delete the PDF file
            try {
                await FileSystem.deleteAsync(reportToDelete.fileUri, { idempotent: true });
            } catch (fileError) {
                console.error('Error deleting PDF file:', fileError);
            }
        }

        const updatedReports = reports.filter(r => r.id !== id);
        await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
    } catch (error) {
        console.error('Error deleting report:', error);
        throw error;
    }
};

export const renameReport = async (id: string, newName: string): Promise<void> => {
    try {
        const reports = await loadReports();
        const updatedReports = reports.map(r =>
            r.id === id ? { ...r, name: newName } : r
        );
        await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
    } catch (error) {
        console.error('Error renaming report:', error);
        throw error;
    }
};

export const deleteAllReports = async (): Promise<void> => {
    try {
        const reports = await loadReports();

        // Delete all PDF files
        for (const report of reports) {
            try {
                await FileSystem.deleteAsync(report.fileUri, { idempotent: true });
            } catch (fileError) {
                console.error('Error deleting PDF file:', fileError);
            }
        }

        await AsyncStorage.removeItem(REPORTS_KEY);
    } catch (error) {
        console.error('Error deleting all reports:', error);
        throw error;
    }
};
