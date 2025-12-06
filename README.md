# Cash Flow Kalkulačka & Expense Tracker

Komplexná mobilná aplikácia na správu osobných financií a investícií do nehnuteľností.

## 🚀 Funkcie

### 🏠 Cash Flow Nehnuteľností
- Výpočet hypotéky (mesačná splátka, úroky).
- Analýza návratnosti (Cash on Cash Return, NOI, CAP Rate).
- Scenáre: Porovnávanie rôznych investičných príležitostí.

### ⏱️ Profit Timer
- Sledovanie času a výpočet zárobku v reálnom čase ("Time is Money").
- Ideálne pre freelancerov a sledovanie produktivity.

### 💸 Správa Výdavkov
- Evidencia výdavkov a príjmov.
- Kategorizácia a rozpočty (Budgets).
- Grafické prehľady a štatistiky.

### ⚙️ Ďalšie Vlastnosti
- **Jazyky:** 🇸🇰 Slovenčina, 🇨🇿 Čeština, 🇬🇧 Angličtina.
- **Téma:** Automatický Svetlý/Tmavý režim (Dark Mode).
- **Synchronizácia:**
    - **Guest Mode:** Dáta uložené lokálne v zariadení (AsyncStorage).
    - **Autentifikácia:** Prihlásenie cez Supabase (Google Auth / Email) pre zálohu cloud dát.
- **Export:** Generovanie PDF reportov.
- **Nastavenia:** Možnosť vymazať dáta, zmeniť menu, jazyk.

## 🛠️ Technologický Stack

- **Frontend:** React Native (Expo)
- **Jazyk:** TypeScript
- **Backend/Databáza:** Supabase (PostgreSQL)
- **State Management:** React Context API
- **Navigácia:** React Navigation (Tabs, Modals)
- **Uloženie dát:** AsyncStorage (lokálne) + Supabase (cloud)

## 📦 Inštalácia a Spustenie

### 1. Klonovanie repozitára
```bash
git clone https://github.com/peterkacmarik/cash-flow.git
cd cash-flow
```

### 2. Inštalácia závislostí
```bash
npm install
```

### 3. Konfigurácia prostredia (.env)
Vytvorte súbor `.env` v koreňovom priečinku a doplňte vaše Supabase kľúče:
```env
SUPABASE_URL=vasa_supabase_url
SUPABASE_ANON_KEY=vas_supabase_anon_key
```
*(Pozor: Nikdy necommitujte `.env` súbor na GitHub!)*

### 4. Spustenie
```bash
npx expo start --clear
```
Naskenujte QR kód cez aplikáciu **Expo Go**.

## 🛡️ Pravidlá Vývoja

Projekt používa striktné pravidlá definované v `.agent/rules.md`.
- **Commit:** Používa sa Conventional Commits.
- **Bezpečnosť:** Žiadne hardcodované API kľúče.
- **Workflows:** Dodržiavanie postupov v `.agent/workflows`.

---
*Vytvorené s pomocou AI agenta (Google Deepmind).*
