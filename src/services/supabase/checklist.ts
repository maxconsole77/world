import { getSupabase } from './client';

export async function addChecklistItem(tripId: string, title: string, category?: string){
  const supabase = getSupabase();
  const { data, error } = await supabase.from('checklist_items').insert({ trip_id: tripId, title, category }).select('*').single();
  if (error) throw error;
  return data;
}
export async function listChecklist(tripId: string){
  const supabase = getSupabase();
  const { data, error } = await supabase.from('checklist_items').select('*').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
