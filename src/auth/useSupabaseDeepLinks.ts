// src/auth/useSupabaseDeepLinks.ts
import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

/**
 * Completa la sessione Supabase quando l'app viene aperta da un magic link.
 * Gestisce sia i deep link con access_token/refresh_token sia quelli con solo "code".
 */
export function useSupabaseDeepLinks() {
  const handledRef = useRef(false);

  useEffect(() => {
    const handle = async (url?: string | null) => {
      if (!url || handledRef.current) return;

      try {
        const parsed = Linking.parse(url);
        const qp = (parsed.queryParams || {}) as Record<string, string | undefined>;
        const access_token = qp.access_token?.toString();
        const refresh_token = qp.refresh_token?.toString();
        const code = qp.code?.toString();

        if (access_token && refresh_token) {
          // Variante: Supabase passa direttamente i token nel deep link
          await supabase.auth.setSession({ access_token, refresh_token });
          handledRef.current = true;
          return;
        }

        if (code) {
          // Variante: Supabase passa un "code" da scambiare con la sessione
          await supabase.auth.exchangeCodeForSession(code);
          handledRef.current = true;
          return;
        }
      } catch (e) {
        console.warn('[deep-link auth] failed:', e);
      }
    };

    // 1) Eventi runtime (app già aperta)
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    // 2) URL iniziale (app aperta dal link da "fredda")
    Linking.getInitialURL().then(handle);

    return () => sub.remove();
  }, []);
}
