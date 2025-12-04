import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { PropertyInputs, CalculationResults } from './calculations';

interface PDFReportData {
    scenarioName: string;
    inputs: PropertyInputs;
    results: CalculationResults;
    currency: string;
}

const formatCurrency = (value: number, currency: string): string => {
    const symbol = currency === 'EUR' ? '€' : currency === 'CZK' ? 'Kč' : '$';
    return `${value.toFixed(2)} ${symbol}`;
};

const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

const generateHTMLContent = (data: PDFReportData): string => {
    const { scenarioName, inputs, results, currency } = data;
    const date = new Date().toLocaleDateString('sk-SK');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        h2 {
            color: #1e40af;
            margin-top: 30px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 5px;
        }
        .section {
            margin: 20px 0;
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 15px 0;
        }
        .item {
            padding: 10px;
            background: #f3f4f6;
            border-radius: 5px;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
            font-size: 12px;
        }
        .value {
            font-size: 16px;
            color: #111827;
            margin-top: 5px;
        }
        .metric {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
        }
        .positive {
            color: #059669;
            font-weight: bold;
        }
        .negative {
            color: #dc2626;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>💰 Cash Flow Report</h1>
    <div class="section">
        <p><strong>Scenár:</strong> ${scenarioName}</p>
        <p><strong>Dátum vytvorenia:</strong> ${date}</p>
    </div>

    <h2>📊 Základné informácie</h2>
    <div class="grid">
        <div class="item">
            <div class="label">Kúpna cena</div>
            <div class="value">${formatCurrency(inputs.kupnaCena, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Vlastné zdroje</div>
            <div class="value">${formatCurrency(inputs.vlastneZdroje, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Výška hypotéky</div>
            <div class="value">${formatCurrency(inputs.vyskaHypoteky, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Úrok</div>
            <div class="value">${formatPercentage(inputs.urok)}</div>
        </div>
        <div class="item">
            <div class="label">Doba splácania</div>
            <div class="value">${inputs.dobaSplatnosti} rokov</div>
        </div>
        <div class="item">
            <div class="label">Obsadenosť</div>
            <div class="value">${formatPercentage(inputs.obsadenost)}</div>
        </div>
    </div>

    <h2>💵 Mesačný prehľad</h2>
    <div class="grid">
        <div class="item">
            <div class="label">Hrubý príjem</div>
            <div class="value">${formatCurrency(results.efektivneNajomne, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Celkové náklady</div>
            <div class="value">${formatCurrency(results.celkoveMesacneNaklady, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Splátka hypotéky</div>
            <div class="value">${formatCurrency(results.mesacnaSplatkaHypoteky, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Cash Flow</div>
            <div class="value ${results.mesacnyCashFlow >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(results.mesacnyCashFlow, currency)}
            </div>
        </div>
    </div>

    <h2>📈 Investičné metriky</h2>
    <div class="grid">
        <div class="item metric">
            <div class="label">NOI (Net Operating Income)</div>
            <div class="value">${formatCurrency(results.noi, currency)}</div>
        </div>
        <div class="item metric">
            <div class="label">Cap Rate</div>
            <div class="value">${formatPercentage(results.capRate)}</div>
        </div>
        <div class="item metric">
            <div class="label">Cash on Cash Return</div>
            <div class="value">${formatPercentage(results.cashOnCashReturn)}</div>
        </div>
        <div class="item metric">
            <div class="label">ROI</div>
            <div class="value">${formatPercentage(results.roi)}</div>
        </div>
        <div class="item metric">
            <div class="label">DSCR</div>
            <div class="value">${results.dscr.toFixed(2)}</div>
        </div>
        <div class="item metric">
            <div class="label">Break-Even Occupancy</div>
            <div class="value">${formatPercentage(results.breakEvenOccupancy)}</div>
        </div>
        <div class="item metric">
            <div class="label">Total Investment ROI</div>
            <div class="value">${formatPercentage(results.totalInvestmentROI)}</div>
        </div>
        <div class="item metric">
            <div class="label">Expense Ratio</div>
            <div class="value">${formatPercentage(results.expenseRatio)}</div>
        </div>
    </div>

    <h2>💰 Ročný prehľad</h2>
    <div class="grid">
        <div class="item">
            <div class="label">Ročný hrubý príjem</div>
            <div class="value">${formatCurrency(results.rocnyPrijem, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Ročné náklady</div>
            <div class="value">${formatCurrency(results.celkoveRocneNaklady, currency)}</div>
        </div>
        <div class="item">
            <div class="label">Ročný Cash Flow</div>
            <div class="value ${results.rocnyCashFlow >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(results.rocnyCashFlow, currency)}
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Vygenerované aplikáciou Cash Flow Calculator</p>
    </div>
</body>
</html>
    `;
};

export const generatePDFReport = async (
    scenarioName: string,
    inputs: PropertyInputs,
    results: CalculationResults,
    currency: string
): Promise<string> => {
    try {
        const html = generateHTMLContent({ scenarioName, inputs, results, currency });

        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        // expo-print already saves to a persistent location
        // The URI can be used directly for sharing and storage
        return uri;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
