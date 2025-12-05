---
description: Workflow for Supabase database changes
---

# Database Change Workflow

Tento workflow slúži na bezpečné vykonávanie zmien v databáze Supabase a ich integráciu do aplikácie.

1. **Návrh Zmeny**
   - [ ] Zadefinuj, čo sa má zmeniť (nová tabuľka, stĺpec, politika).
   - [ ] Priprav SQL príkaz.

2. **Migrácia (Lokálne/Remote)**
   - [ ] Vytvor migračný súbor (ak používame Supabase CLI) alebo spusti SQL cez Dashboard/Editor.
   - [ ] Aplikuj zmenu na databázu.

3. **Aktualizácia Typov**
   - [ ] Spusti generovanie typov: `npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/supabase.ts` (alebo manuálne aktualizuj `src/types`).
   - [ ] Uisti sa, že nové typy sedia s DB schémou.

4. **Implementácia v Kóde**
   - [ ] Aktualizuj `src/services` na využitie nových polí/tabuliek.
   - [ ] Aktualizuj UI komponenty.

5. **Verifikácia**
   - [ ] Otestuj čítanie/zápis s novou štruktúrou.
   - [ ] Skontroluj RLS (Row Level Security) policies, či má používateľ prístup.
