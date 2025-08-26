import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as ExpoLinking from "expo-linking";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap session
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess ?? null);
      setUser(sess?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  // deep link handler per magic link
  useEffect(() => {
    const handler = async ({ url }: { url: string }) => {
      const parsed = ExpoLinking.parse(url);
      const params = parsed.queryParams ?? {};
      const token_hash = (params.token_hash as string) || (params.token as string) || "";
      const type = (params.type as string) || "magiclink";
      const email = (params.email as string) || undefined;
      if (token_hash) {
        await supabase.auth.verifyOtp({ type: type as any, token_hash, email });
      }
    };
    const sub = ExpoLinking.addEventListener("url", handler);
    // anche se l'app è aperta dal link quando è "cold"
    (async () => {
      const initUrl = await ExpoLinking.getInitialURL();
      if (initUrl) handler({ url: initUrl });
    })();
    return () => sub.remove();
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
