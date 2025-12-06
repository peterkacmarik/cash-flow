import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { CalculationResults, PropertyInputs, calculateCashFlow } from './calculations'; // calculateCashFlow added for profit timer previous value
import { ProfitTimerInputs, ProfitTimerResult } from './profitTimer';
import { Expense, Category, CategorySpending } from '../types/expense';

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sk-SK', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatPercentage = (value: number) => {
    return `${value.toFixed(2)} %`;
};

const getCommonStyles = () => `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 30px; }
    h2 { color: #34495e; margin-top: 30px; margin-bottom: 15px; font-size: 18px; border-left: 4px solid #3498db; padding-left: 10px; }
    .header { text-align: center; margin-bottom: 40px; }
    .header img { width: 80px; height: 80px; margin-bottom: 10px; }
    .meta { color: #7f8c8d; font-size: 12px; margin-top: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .item { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
    .label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .value { font-size: 16px; font-weight: bold; color: #2c3e50; }
    .highlight { color: #27ae60; }
    .negative { color: #c0392b; }
    .footer { margin-top: 50px; text-align: center; color: #95a5a6; font-size: 10px; border-top: 1px solid #eee; padding-top: 20px; }
    .section { margin-bottom: 25px; page-break-inside: avoid; }
    
    /* Profit Timer Specific */
    .timeline-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    .timeline-table th { background: #3498db; color: white; padding: 8px; text-align: left; }
    .timeline-table td { border-bottom: 1px solid #eee; padding: 8px; }
    .timeline-table tr:nth-child(even) { background: #f8f9fa; }
    .timeline-row-positive { background-color: #d4edda !important; }
    .timeline-row-positive td { color: #155724; }
    .timeline-row-negative { background-color: #f8d7da !important; }
    .timeline-row-negative td { color: #721c24; }
`;

const generateCashFlowContent = (inputs: PropertyInputs, results: CalculationResults, currency: string) => {
    return `
    <div class="section">
        <h2>Vstupné údaje</h2>
        <div class="grid">
            <div class="item"><div class="label">Kúpna cena</div><div class="value">${formatCurrency(inputs.kupnaCena, currency)}</div></div>
            <div class="item"><div class="label">Vlastné zdroje</div><div class="value">${formatCurrency(inputs.vlastneZdroje, currency)}</div></div>
            <div class="item"><div class="label">Úroková sadzba</div><div class="value">${formatPercentage(inputs.urok)}</div></div>
            <div class="item"><div class="label">Doba splatnosti</div><div class="value">${inputs.dobaSplatnosti} rokov</div></div>
        </div>
    </div>

    <div class="section">
        <h2>Mesačný prehľad</h2>
        <div class="grid">
            <div class="item"><div class="label">Hrubý príjem</div><div class="value">${formatCurrency(results.efektivneNajomne, currency)}</div></div>
            <div class="item"><div class="label">Náklady</div><div class="value">${formatCurrency(results.celkoveMesacneNaklady, currency)}</div></div>
            <div class="item"><div class="label">Splátka hypotéky</div><div class="value">${formatCurrency(results.mesacnaSplatkaHypoteky, currency)}</div></div>
            <div class="item"><div class="label">Cash Flow</div><div class="value ${results.mesacnyCashFlow >= 0 ? 'highlight' : 'negative'}">${formatCurrency(results.mesacnyCashFlow, currency)}</div></div>
        </div>
    </div>

    <div class="section">
        <h2>Kľúčové metriky</h2>
        <div class="grid">
            <div class="item"><div class="label">ROI</div><div class="value">${formatPercentage(results.roi)}</div></div>
            <div class="item"><div class="label">Cash on Cash</div><div class="value">${formatPercentage(results.cashOnCashReturn)}</div></div>
            <div class="item"><div class="label">Cap Rate</div><div class="value">${formatPercentage(results.capRate)}</div></div>
            <div class="item"><div class="label">DSCR</div><div class="value">${results.dscr.toFixed(2)}</div></div>
        </div>
    </div>
    `;
};

const generateProfitTimerContent = (inputs: ProfitTimerInputs, results: ProfitTimerResult, currency: string) => {
    const rentGrowth = inputs.rentGrowthType === 'percentage'
        ? `${inputs.rentGrowthValue}%`
        : formatCurrency(inputs.rentGrowthValue, currency);

    const expenseReduction = inputs.expenseReductionType === 'percentage'
        ? `${inputs.expenseReductionValue}%`
        : formatCurrency(inputs.expenseReductionValue, currency);

    // Calculate original cash flow for comparison
    const originalCF = calculateCashFlow(inputs.scenario.inputs).mesacnyCashFlow;

    const timelineRows = results.monthlyTimeline
        .filter((_, i) => i % 12 === 0 || i === results.monthlyTimeline.length - 1) // Show roughly annual + last
        .slice(0, 15) // Limit rows for PDF to fit on page
        .map(row => `
            <tr class="${row.isPositive ? 'timeline-row-positive' : ''}">
                <td>Mesiac ${row.month}</td>
                <td>${formatCurrency(row.rent, currency)}</td>
                <td>${formatCurrency(row.expenses, currency)}</td>
                <td>${formatCurrency(row.cashFlow, currency)}</td>
            </tr>
        `).join('');

    return `
    <div class="section">
        <h2>Parametre Scenára</h2>
        <div class="grid">
             <div class="item"><div class="label">Scenár</div><div class="value">${inputs.scenario.name}</div></div>
             <div class="item"><div class="label">Pôvodný Cash Flow</div><div class="value negative">${formatCurrency(originalCF, currency)}</div></div>
        </div>
        <h2>Optimalizácia</h2>
        <div class="grid">
            <div class="item"><div class="label">Rast nájmu</div><div class="value">${rentGrowth}</div></div>
            <div class="item"><div class="label">Znižovanie nákladov</div><div class="value">${expenseReduction}</div></div>
        </div>
    </div>

    <div class="section">
        <h2>Výsledok</h2>
        <div class="grid">
            <div class="item">
                <div class="label">Mesiacov do +CF</div>
                <div class="value highlight">${results.monthsToPositive}</div>
            </div>
            <div class="item">
                <div class="label">Rokov do +CF</div>
                <div class="value highlight">${results.yearsToPositive}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Timeline (Ukážka)</h2>
        <table class="timeline-table">
            <thead>
                <tr>
                    <th>Obdobie</th>
                    <th>Nájom</th>
                    <th>Náklady</th>
                    <th>Cash Flow</th>
                </tr>
            </thead>
            <tbody>
                ${timelineRows}
            </tbody>
        </table>
    </div>
    `;
};

const generateExpensesContent = (
    expenses: Expense[],
    categories: Category[],
    categorySpending: CategorySpending[],
    currency: string,
    month: string
) => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    const budgetRemaining = totalBudget - totalSpent;
    const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0;

    // Category breakdown rows
    const categoryRows = categorySpending
        .sort((a, b) => b.spent - a.spent)
        .map(cs => `
            <tr class="${cs.isOverBudget ? 'timeline-row-negative' : ''}">
                <td>${cs.category.icon} ${cs.category.name}</td>
                <td>${formatCurrency(cs.spent, currency)}</td>
                <td>${formatCurrency(cs.budget, currency)}</td>
                <td class="${cs.isOverBudget ? 'negative' : 'highlight'}">${cs.budget > 0 ? cs.percentage.toFixed(1) + '%' : '-'}</td>
            </tr>
        `).join('');

    // Expense list rows (sorted by date, most recent first)
    const expenseRows = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(exp => {
            const category = categories.find(c => c.id === exp.category);
            const dateObj = new Date(exp.date);
            const formattedDate = dateObj.toLocaleDateString('sk-SK');
            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${category?.icon || '📌'} ${category?.name || exp.category}</td>
                    <td>${formatCurrency(exp.amount, currency)}</td>
                    <td>${exp.description || '-'}</td>
                </tr>
            `;
        }).join('');

    return `
    <div class="section">
        <h2>Prehľad za ${month}</h2>
        <div class="grid">
            <div class="item"><div class="label">Celkové výdavky</div><div class="value negative">${formatCurrency(totalSpent, currency)}</div></div>
            <div class="item"><div class="label">Celkový rozpočet</div><div class="value">${formatCurrency(totalBudget, currency)}</div></div>
            <div class="item"><div class="label">Zostáva</div><div class="value ${budgetRemaining >= 0 ? 'highlight' : 'negative'}">${formatCurrency(budgetRemaining, currency)}</div></div>
            <div class="item"><div class="label">Využitie rozpočtu</div><div class="value ${budgetUsedPercentage > 100 ? 'negative' : ''}">${budgetUsedPercentage.toFixed(1)}%</div></div>
        </div>
    </div>

    <div class="section">
        <h2>Výdavky podľa kategórií</h2>
        <table class="timeline-table">
            <thead>
                <tr>
                    <th>Kategória</th>
                    <th>Minúté</th>
                    <th>Rozpočet</th>
                    <th>% Rozpočtu</th>
                </tr>
            </thead>
            <tbody>
                ${categoryRows}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Zoznam výdavkov (${expenses.length})</h2>
        <table class="timeline-table">
            <thead>
                <tr>
                    <th>Dátum</th>
                    <th>Kategória</th>
                    <th>Suma</th>
                    <th>Popis</th>
                </tr>
            </thead>
            <tbody>
                ${expenseRows}
            </tbody>
        </table>
    </div>
    `;
};

import { ExpensesReportInputs } from '../types/report';

export const generatePDFReport = async (
    reportName: string,
    inputs: PropertyInputs | ProfitTimerInputs | ExpensesReportInputs,
    results: CalculationResults | ProfitTimerResult | {}, // expenses has no separate results object
    currency: string = 'EUR',
    type: 'cashFlow' | 'profitTimer' | 'expenses' = 'cashFlow'
): Promise<string> => {
    let content = '';

    if (type === 'cashFlow') {
        content = generateCashFlowContent(inputs as PropertyInputs, results as CalculationResults, currency);
    } else if (type === 'profitTimer') {
        content = generateProfitTimerContent(inputs as ProfitTimerInputs, results as ProfitTimerResult, currency);
    } else if (type === 'expenses') {
        const expensesInputs = inputs as ExpensesReportInputs;
        return generateExpensesPDFReport(
            reportName,
            expensesInputs.expenses,
            expensesInputs.categories,
            expensesInputs.categorySpending,
            expensesInputs.currency,
            expensesInputs.month
        );
    } else {
        throw new Error('Unknown report type');
    }

    const html = `
    <html>
        <head>
            <meta charset="utf-8">
            <style>
                ${getCommonStyles()}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${reportName}</h1>
                <div class="meta">Vygenerované: ${new Date().toLocaleDateString('sk-SK')}</div>
            </div>
            
            ${content}

            <div class="footer">
                <p>Vygenerované aplikáciou Cash Flow</p>
            </div>
        </body>
    </html>
    `;

    const { uri } = await Print.printToFileAsync({
        html,
        base64: false
    });

    return uri;
};

export const generateExpensesPDFReport = async (
    reportName: string,
    expenses: Expense[],
    categories: Category[],
    categorySpending: CategorySpending[],
    currency: string = 'EUR',
    month: string
): Promise<string> => {
    const content = generateExpensesContent(expenses, categories, categorySpending, currency, month);

    const html = `
    <html>
        <head>
            <meta charset="utf-8">
            <style>
                ${getCommonStyles()}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${reportName}</h1>
                <div class="meta">Vygenerované: ${new Date().toLocaleDateString('sk-SK')}</div>
            </div>
            
            ${content}

            <div class="footer">
                <p>Vygenerované aplikáciou Cash Flow</p>
            </div>
        </body>
    </html>
    `;

    const { uri } = await Print.printToFileAsync({
        html,
        base64: false
    });

    return uri;
};
