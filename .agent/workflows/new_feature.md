---
description: Workflow for adding a new feature or screen
---

# New Feature Workflow

Tento workflow slúži na pridanie novej funkcionality alebo obrazovky do aplikácie.

1. **Analýza a Typy**
   - [ ] Zadefinuj potrebné dátové typy v `src/types`.
   - [ ] Ak je potrebná zmena v databáze, priprav migráciu alebo SQL príkaz.

2. **Implementácia Logiky**
   - [ ] Vytvor potrebné funkcie v `src/services` alebo `src/utils`.
   - [ ] Vytvor Context ak je potrebný globálny stav.

3. **UI Implementácia**
   - [ ] Vytvor komponenty v `src/components`.
   - [ ] Vytvor obrazovku v `src/screens`.
   - [ ] Použi `StyleSheet` na stylovanie.

4. **Navigácia**
   - [ ] Pridaj novú obrazovku do navigátora v `src/navigation` (napr. `BottomTabNavigator` alebo Stack).
   - [ ] Aktualizuj typy pre navigáciu (`RootStackParamList` atď.).

5. **Lokalizácia (i18n)**
   - [ ] Pridaj všetky texty do `src/i18n/locales/en.ts`.
   - [ ] Pridaj preklady do `src/i18n/locales/sk.ts`.
   - [ ] Pridaj preklady do `src/i18n/locales/cs.ts`.
   - [ ] V kóde používaj `i18n.t('key')`.

6. **Kontrola**
   - [ ] Skontroluj TypeScript chyby (`npx tsc`).
   - [ ] Over funkčnosť na Androide (ak beží build).
   - [ ] Odstráň `console.log` a nepoužívaný kód.
