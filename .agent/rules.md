---
description: Global rules for the Cash Flow project
---

# Project Rules

## 1. Jazyk a Komunikácia
- **Komunikácia s používateľom:** Vždy po slovensky.
- **Kód (názvy premenných, funkcií):** Angličtina.
- **Komentáre v kóde:** Angličtina (pre konzistenciu s kódom) alebo Slovenčina (ak je to zložitejšia logika vysvetľovaná pre používateľa).
- **Commit správy:** Angličtina, konvencia Conventional Commits (napr. `feat: add login screen`, `fix: correct calculation`).

## 2. Technologický Stack
- **Framework:** React Native (Expo).
- **Jazyk:** TypeScript.
- **Backend/Databáza:** Supabase.
- **Navigácia:** React Navigation.
- **Styling:** `StyleSheet` (React Native built-in). Nepoužívať Tailwind pokiaľ nie je explicitne vyžiadaný.

## 3. Štruktúra Projektu
Dodržiavaj túto štruktúru:
- `src/components`: Znovupoužiteľné UI komponenty.
- `src/screens`: Celé obrazovky aplikácie.
- `src/navigation`: Konfigurácia navigácie.
- `src/types`: TypeScript definície a interface-y.
- `src/utils`: Pomocné funkcie a logika.
- `src/i18n`: Preklady (sk, en, cs).
- `src/services`: Komunikácia s API/Supabase.

## 4. Kódovacie Štandardy
- **TypeScript:** Vždy používaj silné typovanie. Vyhýbaj sa `any`.
- **Komponenty:** Funkcionálne komponenty s Hooks.
- **Props:** Vždy definuj interface pre Props komponentu.
- **Chyby:** Ošetruj chyby (try/catch) a informuj používateľa (napr. cez Alert alebo Toast).
- **Clean Code:** Žiadne `console.log` v produkčnom kóde. Odstráň nepoužívané importy.

## 5. UI/UX
- **Responzivita:** Uisti sa, že UI vyzerá dobre na rôznych veľkostiach obrazoviek.
- **Klávesnica:** Používaj `KeyboardAvoidingView` pri formulároch.
- **Safe Area:** Rešpektuj `SafeAreaView`.

## 6. Bezpečnosť Úprav (Anti-Corruption)
- **Čítanie pred zápisom:** Pred každou úpravou súboru si ho najprv prečítaj (`view_file`), aby si mal 100% istotu o jeho aktuálnom obsahu. Nespoliehaj sa na pamäť z predchádzajúcich krokov.
- **Unikátny kontext:** Pri nahrádzaní kódu (`replace_file_content`) sa uisti, že `TargetContent` je unikátny a obsahuje dostatok okolitých riadkov na jednoznačnú identifikáciu miesta úpravy.
- **Duplicity:** Dávaj pozor, aby si nevložil kód, ktorý tam už je. Ak si nie si istý, radšej si súbor znova prečítaj.
- **Veľké zmeny:** Pri komplexných zmenách v súbore zváž prepísanie celého súboru (`write_to_file` s `Overwrite: true`) namiesto `replace_file_content`, aby sa predišlo chybám v kontexte.

## 7. Kľúčové Slová
- **"Funguje":** Ak používateľ napíše "funguje" (alebo "je to ok", "hotovo"), **automaticky** vykonaj `git add .` a `git commit`.
  - Správa commitu musí stručne popisovať, čo sa práve dokončilo (napr. `feat: implement login screen` alebo `fix: resolve crash on startup`).
  - Nemusíš sa pýtať na povolenie, ber to ako príkaz na uloženie checkpointu.
