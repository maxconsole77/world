import { getSupabase } from './client';

export type Provider = 'google'|'facebook'|'apple';

export async function signInWithOAuth(provider: Provider, redirectTo?: string){
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string){
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function sendMagicLink(email: string, redirectTo?: string){
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  if (error) throw error;
  return data;
}

export async function signOut(){
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(){
  const supabase = getSupabase();
  return supabase.auth.getSession();
}
