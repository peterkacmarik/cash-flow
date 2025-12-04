# Návod na vytvorenie APK súboru

## Krok 1: Prihlásenie do Expo účtu

Otvorte terminál a spustite:
```bash
eas login
```

Zadajte váš Expo email a heslo.

**Ak nemáte Expo účet:**
1. Navštívte https://expo.dev
2. Kliknite na "Sign up"
3. Vytvorte si účet zadarmo
4. Potom sa prihláste pomocou `eas login`

## Krok 2: Konfigurácia projektu

Projekt je už nakonfigurovaný s:
- ✅ `eas.json` - konfiguračný súbor
- ✅ `app.json` - package názov nastavený
- ✅ EAS CLI nainštalované

## Krok 3: Spustenie buildu

Po prihlásení spustite:
```bash
eas build --platform android --profile preview
```

Tento príkaz:
1. Nahrá váš kód na Expo servery
2. Vytvorí APK súbor v cloude
3. Po dokončení vám poskytne odkaz na stiahnutie APK

**Čas buildu:** Približne 10-20 minút

## Krok 4: Stiahnutie APK

Po dokončení buildu:
1. Dostanete odkaz v termináli
2. Alebo navštívte https://expo.dev/accounts/[váš-účet]/projects/cash-flow/builds
3. Stiahnite si APK súbor
4. Nainštalujte ho na Android zariadenie

## Alternatíva: Lokálny build (bez Expo účtu)

Ak nechcete používať Expo účet, môžete vytvoriť APK lokálne:

### Predpoklady:
- Android Studio nainštalované
- Android SDK nakonfigurované
- Java Development Kit (JDK)

### Príkazy:
```bash
# 1. Nainštalovať závislosti
npx expo install expo-dev-client

# 2. Vytvoriť Android projekt
npx expo prebuild --platform android

# 3. Vytvoriť APK
cd android
./gradlew assembleRelease

# APK bude v: android/app/build/outputs/apk/release/app-release.apk
```

## Poznámky

- **EAS Build** je jednoduchší a odporúčaný spôsob
- **Lokálny build** vyžaduje viac nastavení, ale nepotrebuje Expo účet
- APK súbor môžete nainštalovať priamo na Android zariadenie (nie cez Google Play)
- Pre publikovanie na Google Play potrebujete AAB súbor (nie APK)

## Riešenie problémov

Ak build zlyhá:
1. Skontrolujte, či ste prihlásení: `eas whoami`
2. Aktualizujte EAS CLI: `npm install -g eas-cli@latest`
3. Vyčistite cache: `eas build --clear-cache`
