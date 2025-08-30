import { getSupabase } from './client';
import type { Daypart } from './itinerary';

export async function uploadDayTrack(tripDayId: string, part: Daypart, uri: string, fileName: string, title: string){
  const supabase = getSupabase();
  const bucket = 'trip-audio';
  const path = `trip/${tripDayId}/audio/${fileName}`;
  const resp = await fetch(uri);
  const blob = await resp.blob();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: 'audio/mpeg' });
  if (error) throw error;
  const { data, error:insErr } = await supabase.from('audio_guide_day_tracks').insert({ audio_day_id: tripDayId, part, title, storage_path: `${bucket}/${path}` }).select('*').single();
  if (insErr) throw insErr;
  return data;
}
