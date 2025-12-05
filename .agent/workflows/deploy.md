---
description: Workflow for building and deploying the application
---

# Deployment Workflow

Tento workflow slúži na buildovanie a nasadenie aplikácie cez EAS (Expo Application Services).

1. **Príprava**
   - [ ] Spusti `npx tsc` na kontrolu typov.
   - [ ] Spusti `npx eslint .` (ak je nastavený) na kontrolu kódu.
   - [ ] Uisti sa, že všetky zmeny sú commitnuté v gite.

2. **Verzionovanie**
   - [ ] Zisti aktuálnu verziu v `app.json`.
   - [ ] Zvýš `version` (semver: major.minor.patch).
   - [ ] Zvýš `android.versionCode` (integer).
   - [ ] Zvýš `ios.buildNumber` (string).

3. **Build**
   - [ ] Rozhodni sa pre profil: `preview` (pre testovanie) alebo `production` (pre store).
   - [ ] Spusti build príkaz:
     - Android: `eas build --platform android --profile [profile]`
     - iOS: `eas build --platform ios --profile [profile]`
     - All: `eas build --platform all --profile [profile]`

4. **Post-Build**
   - [ ] Počkať na dokončenie buildu.
   - [ ] Stiahnuť .apk/.aab súbor alebo poslať link testerom.
   - [ ] Ak je to produkčný build, pripraviť na submit do Store.
