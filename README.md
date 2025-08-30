# World – Expo 53 / React Native 0.79 / TypeScript

App multilingua con login Supabase, frasario con TTS/STT, traduttore, meteo con mappa Windy/Radar, trip POI e notifiche.

## Requisiti
- Node 20.x, npm 10+
- Expo CLI (`npm i -g expo`)
- (Opzionale) EAS CLI per dev build: `npm i -g eas-cli`

## Setup rapido
```bash
cp .env.example .env
npm install
npx expo start -c
```

### Variabili `.env`
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_TRANSLATE_PROVIDER=deepl|google|none
EXPO_PUBLIC_DEEPL_KEY=
EXPO_PUBLIC_GOOGLE_KEY=
```

> Se `.env` manca o le chiavi non sono impostate, l'app degrada con grazia: login disabilitato, profilo salvato solo su dispositivo, traduzioni via fallback gratuito o eco dell'input.

## Supabase
1. Crea un progetto e imposta **URL** e **ANON KEY** nel `.env`.
2. Esegui lo schema RLS:
   ```sql
-- Supabase schema for World app
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text generated always as ((auth.email())) stored,
  language text not null default 'en',
  destination_language text not null default 'it',
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Row owner policy
create policy "Allow read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Allow upsert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Allow update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Optional: ensure a profile row exists on signup (edge function or DB trigger)
-- For simplicity, the app calls ensureProfileRow() after login.

   ```
3. (Consigliato) Abilita email/password in Authentication.
4. Dopo il login la prima volta, l'app esegue `ensureProfileRow()` per creare/upsert il profilo con default.

## Scelta Login
Questa build usa **email + password** per semplicità e affidabilità offline. Il magic link resta supportabile (vedi `src/context/AuthContext.tsx` per deep link), ma non è abilitato di default in UI.

## Funzioni chiave
- **Profilo**: lingua utente e destinazione sincronizzate su Supabase (RLS) con **fallback AsyncStorage** se offline/non configurato.
- **Frasi utili (Phrases)**:
  - UI con disabilitazione quando le lingue coincidono; **bottone swap a destra**.
  - Card con TTS a sinistra; mostra prima la frase nella lingua utente, poi traduzione.
  - **Traduttore libero** con STT (solo Dev Build/standalone). In **Expo Go** il microfono è disabilitato con banner esplicativo.
  - `src/lib/translate.ts`: provider **DeepL/Google** via `.env` con retry/backoff e **fallback LibreTranslate**; **sanitizzazione** output (apostrofi, spazi, %XX).
  - Script: `tools/patch-locales-phrases.mjs` e `tools/fix-locales.mjs` per bonifiche e coerenza JSON UTF‑8 (no BOM).
- **Meteo**: fino a 10 giorni (Open‑Meteo), dettagli (min/max, pioggia%, umidità, vento, pressione, UV, visibilità) e **fasce Notte/Mattino/Pomeriggio/Sera**. **Mappa Windy/Radar** in WebView; la timeline segue il daypart selezionato.
- **Trip/Itinerari**: POI ampliati per Roma/Parigi/Londra con filtri Indoor/Outdoor. L'itinerario suggerito tiene conto del meteo (favorisce indoor se piove).
- **Notifiche**: scheduling locale (`src/services/notifications.ts`) con canale Android configurato.

## Build Dev con STT (react-native-voice)
Lo **Speech‑to‑Text** non funziona in Expo Go. Per abilitarlo:
```bash
eas build --profile development --platform android
# oppure iOS
eas build --profile development --platform ios
```
Installa la Dev Build sul dispositivo. In app, nella sezione Frasi, comparirà il microfono attivo.

## Comandi utili
- Avvio: `npx expo start -c`
- Lint/Typecheck: `npm run lint` / `npm run typecheck`
- Script locali:
  - `node tools/fix-locales.mjs`
  - `node tools/patch-locales-phrases.mjs`

## Note di rilascio
- **Aggiunto** profilo con persistenza Supabase + fallback AsyncStorage.
- **Allineato** `.env.example` alle chiavi supportate.
- **Banner Expo Go** in Phrases quando STT non disponibile.
- **Canale notifiche Android** e helper `scheduleAt`.
- **Confermato** JSC come engine per iOS/Android per stabilità.
- **Locali**: JSON senza BOM, apostrofi normalizzati; script di patch inclusi.

## Definition of Done (verifica rapida)
- [x] Login Supabase funzionante (email/pw).  
- [x] Profilo lingue con RLS + fallback.  
- [x] Phrases per categorie, swap a destra, disabilitazione lingua se uguale, TTS/Traduzioni pulite.  
- [x] Traduttore con STT in Dev Build e gating in Expo Go.  
- [x] Meteo completo + mappa Windy con timeline.  
- [x] POI estesi + filtri + itinerario adattivo al meteo.  
- [x] Notifiche locali schedulabili.  
- [x] `app.config.ts` con permessi e JSC; `.env` con degradazione elegante.  
- [x] Tools di bonifica locali funzionanti.
