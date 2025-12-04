export interface PropertyInputs {
    kupnaCena: number;
    vlastneZdroje: number;
    vyskaHypoteky: number;
    urok: number;
    dobaSplatnosti: number;
    ocakavaneNajomne: number;
    obsadenost: number;
    fondOprav: number;
    sprava: number;
    poistenie: number;
    danZNehnutelnosti: number;
    energie: number;
    internet: number;
    ineNaklady: number;
    neocakavaneNaklady: number;
}

export interface CalculationResults {
    mesacnaSplatkaHypoteky: number;
    celkovaInvesticia: number;
    efektivneNajomne: number;
    celkoveMesacneNaklady: number;
    noi: number;
    mesacnyCashFlow: number;
    rocnyCashFlow: number;
    cashOnCashReturn: number;
    celkovaRocnaSplatka: number;
    celkoveRocneNaklady: number;
    rocnyPrijem: number;
    capRate: number;
    roi: number;
    // New metrics
    dscr: number;
    breakEvenOccupancy: number;
    totalInvestmentROI: number;
    expenseRatio: number;
}

/**
 * Vypočíta mesačnú splátku hypotéky pomocou vzorca pre anuitnú splátku
 * M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 */
export function calculateMortgagePayment(
    principal: number,
    annualRate: number,
    years: number
): number {
    if (principal <= 0 || years <= 0) return 0;
    if (annualRate === 0) return principal / (years * 12);

    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    const payment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return payment;
}

/**
 * Vypočíta všetky výsledky cash flow analýzy
 */
export function calculateCashFlow(inputs: PropertyInputs): CalculationResults {
    // Mesačná splátka hypotéky
    const mesacnaSplatkaHypoteky = calculateMortgagePayment(
        inputs.vyskaHypoteky,
        inputs.urok,
        inputs.dobaSplatnosti
    );

    // Celková investícia (vlastné zdroje)
    const celkovaInvesticia = inputs.vlastneZdroje;

    // Efektívne nájomné (zohľadnená obsadenosť)
    const efektivneNajomne = inputs.ocakavaneNajomne * (inputs.obsadenost / 100);

    // Celkové mesačné náklady
    // Poznámka: danZNehnutelnosti je ročná suma, preto delíme 12
    const celkoveMesacneNaklady =
        inputs.fondOprav +
        inputs.sprava +
        inputs.poistenie +
        (inputs.danZNehnutelnosti / 12) +  // Ročná daň prepočítaná na mesiac
        inputs.energie +
        inputs.internet +
        inputs.ineNaklady +
        inputs.neocakavaneNaklady;

    // Net Operating Income (NOI) - príjem mínus prevádzkové náklady
    const noi = efektivneNajomne - celkoveMesacneNaklady;

    // Mesačný cash flow (NOI mínus splátka hypotéky)
    const mesacnyCashFlow = noi - mesacnaSplatkaHypoteky;

    // Ročný cash flow
    const rocnyCashFlow = mesacnyCashFlow * 12;

    // Cash on Cash Return (%)
    const cashOnCashReturn =
        celkovaInvesticia > 0 ? (rocnyCashFlow / celkovaInvesticia) * 100 : 0;

    // Celková ročná splátka hypotéky
    const celkovaRocnaSplatka = mesacnaSplatkaHypoteky * 12;

    // Celkové ročné náklady
    const celkoveRocneNaklady = celkoveMesacneNaklady * 12;

    // Ročný príjem
    const rocnyPrijem = efektivneNajomne * 12;

    // Cap Rate (%) = (NOI * 12) / Kúpna cena
    const capRate = inputs.kupnaCena > 0 ? ((noi * 12) / inputs.kupnaCena) * 100 : 0;

    // ROI (%) - zjednodušene ako Cash on Cash pre tento prípad
    const roi = cashOnCashReturn;

    // DSCR (Debt Service Coverage Ratio)
    const dscr = mesacnaSplatkaHypoteky > 0 ? noi / mesacnaSplatkaHypoteky : 0;

    // Break-Even Occupancy Rate (%)
    const breakEvenOccupancy = inputs.ocakavaneNajomne > 0
        ? ((celkoveMesacneNaklady + mesacnaSplatkaHypoteky) / inputs.ocakavaneNajomne) * 100
        : 0;

    // ROI on Total Investment (%)
    const totalInvestmentROI = inputs.kupnaCena > 0
        ? (rocnyCashFlow / inputs.kupnaCena) * 100
        : 0;

    // Expense Ratio (%)
    const expenseRatio = efektivneNajomne > 0
        ? (celkoveMesacneNaklady / efektivneNajomne) * 100
        : 0;

    return {
        mesacnaSplatkaHypoteky,
        celkovaInvesticia,
        efektivneNajomne,
        celkoveMesacneNaklady,
        noi,
        mesacnyCashFlow,
        rocnyCashFlow,
        cashOnCashReturn,
        celkovaRocnaSplatka,
        celkoveRocneNaklady,
        rocnyPrijem,
        capRate,
        roi,
        dscr,
        breakEvenOccupancy,
        totalInvestmentROI,
        expenseRatio,
    };
}

/**
 * Formátuje číslo na menu s 2 desatinnými miestami
 */
export function formatCurrency(value: number): string {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Kč';
}

/**
 * Formátuje percento s 2 desatinnými miestami
 */
export function formatPercent(value: number): string {
    return value.toFixed(2) + ' %';
}
