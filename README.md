# Cash Flow Kalkulačka

Mobilná aplikácia pre výpočet cash flow pri budúcom prenájme nehnuteľnosti.

## Funkcie

- 📊 Výpočet mesačného a ročného cash flow
- 💰 Výpočet Cash on Cash Return
- 📱 Responzívne mobilné rozhranie
- 🎨 Farebné indikátory (zelená = zisk, červená = strata)
- 📋 Prehľadné zobrazenie všetkých výsledkov

## Spustenie

```bash
npx expo start
```

Potom naskenujte QR kód pomocou Expo Go aplikácie.

## Vstupné parametre

- Kúpna cena nehnuteľnosti
- Vlastné zdroje / akontácia
- Výška hypotéky
- Úroková sadzba
- Doba splatnosti
- Očakávané mesačné nájomné
- Očakávaná obsadenosť (%)
- Mesačné náklady (fond opráv, správa, poistenie, dane, energie, atď.)

## Výpočty

Aplikácia vypočíta:
- Mesačnú splátku hypotéky
- Efektívne nájomné (zohľadnená obsadenosť)
- NOI (Net Operating Income)
- Mesačný a ročný Cash Flow
- Cash on Cash Return (%)

## Technológie

- React Native
- Expo
- TypeScript
- react-native-tab-view

## Dokumentácia

Kompletná dokumentácia je dostupná v súbore `walkthrough.md` v artifacts priečinku.
