import { getSupabase } from './client';

export type Daypart = 'morning'|'afternoon'|'evening'|'night';

export async function upsertTripDay(trip_id: string, day_date: string){
  const supabase = getSupabase();
  const { data, error } = await supabase.from('trip_days').upsert({ trip_id, day_date }).select('*').single();
  if (error) throw error;
  return data;
}

export async function setSlot(trip_day_id: string, part: Daypart, start_time?: string, end_time?: string){
  const supabase = getSupabase();
  const { data, error } = await supabase.from('trip_slots').upsert({ trip_day_id, part, start_time, end_time }).select('*').single();
  if (error) throw error;
  return data;
}
