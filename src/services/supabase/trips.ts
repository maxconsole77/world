import { getSupabase } from './client';

export type Trip = {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at: string;
  hours_per_day: number;
  privacy: 'private'|'friends'|'public';
  cap?: number | null;
  base_address?: string | null;
  base_lat?: number | null;
  base_lng?: number | null;
  created_at: string;
  updated_at: string;
};

export async function createTrip(input: Omit<Trip,'id'|'created_at'|'updated_at'>){
  const supabase = getSupabase();
  const { data, error } = await supabase.from('trips').insert(input).select('*').single();
  if (error) throw error;
  return data as Trip;
}
export async function listMyTrips(){
  const supabase = getSupabase();
  const { data, error } = await supabase.from('trips').select('*').order('created_at',{ascending:false});
  if (error) throw error;
  return data as Trip[];
}
