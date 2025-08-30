# World · TRIP Add-on (Expo SDK 53, RN 0.79.x, TS)
Questo pacchetto aggiunge al tuo progetto World le funzionalità **TRIP** (Trip, Media, Documenti, Checklist, Social base, Audioguide) con servizi Supabase e schermate pronte.
È pensato per essere **copiato dentro il tuo repo** senza rompere ciò che già esiste.

## Cosa include
- `src/services/supabase/*`: client, auth (oauth/email/logout), trips, itinerary (segments/days/slots/stops), documents, photos/albums, checklist, audio.
- `src/navigation/TripNavigator.tsx`: stack dedicato Trip.
- `src/screens/trip/*`: Setup, Itinerario Giorno (meteo placeholder), Documenti (segmenti Andata/Ritorno/In loco), Foto (timeline/album), Upload, Checklist, Audioguida Giorno/POI, Modali “Gestisci provider”, “Condivisione esterna”, “Aggiungi a Giorno/Fascia”.
- `src/screens/auth/*`: Login social/email/magic link e Impostazioni Account (logout, provider, privacy).
- `src/components/*`: UI di base riusabile (Chip, Badge, Card, Banner, Button, Grid, DocCard, FilterBar).
- `src/i18n/*`: setup react-i18next + stringhe base (IT/EN/ES/DE/FR).
- `src/utils/*`: env, feature-gate, dayjs, types condivisi.
- `tools/*`: script per patch automatico di `package.json` e `app.config.ts`.

## Dipendenze richieste
```
expo install expo-location expo-notifications expo-speech expo-linking expo-constants react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context react-native-svg
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @supabase/supabase-js react-i18next i18next dayjs react-native-webview
# (opz) STT in dev build/standalone
npm i react-native-voice
```

## Merge automatico (consigliato)
1. Copia questa cartella **nel root del tuo repo** (allo stesso livello di `src/`).
2. Esegui:
```bash
node tools/merge-trip.mjs
```
Lo script:
- aggiunge le dipendenze sopra a `package.json` (se mancanti),
- applica `app.config.ts` patch (scheme `world`, permessi, JSC, notifiche),
- crea `.env.example` con nuove chiavi,
- **non** tocca i tuoi file esistenti al di fuori delle patch minime.

> Se preferisci fare a mano, vedi sotto.

## Merge manuale (alternativa)
- Aggiungi il contenuto di `src/services`, `src/navigation`, `src/screens`, `src/components`, `src/i18n`, `src/utils` nella tua `src/`.
- Integra il **TripNavigator** nei tuoi tabs (ad es. tab “Trip” → `TripNavigator`).
- Aggiorna `app.config.ts`: aggiungi `scheme: 'world'`, permessi microfono/location/notifications, engine JSC, intent filter.
- Installa le dipendenze richieste.

## .env (nuove variabili) — con degradazione elegante
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_TRANSLATE_PROVIDER=deepl|google|none
EXPO_PUBLIC_DEEPL_KEY=
EXPO_PUBLIC_GOOGLE_KEY=
EXPO_PUBLIC_SAFE_MODE=0
EXPO_PUBLIC_ENABLE_STT=0
```
Se mancanti, le feature degradano con banner non bloccante.

## Build rapida (EAS dev build, Android)
```bash
eas build --profile development --platform android
eas build --profile development --platform ios   # se su macOS
```

## Nota
- Nessun `TODO`: tutte le funzioni hanno ritorni sicuri o no-op con messaggi utente chiari.
- Le chiamate Supabase usano tipi stretti ed error handling con retry/backoff.
