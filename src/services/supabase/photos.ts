import { getSupabase } from './client';

export async function uploadPhoto(tripId: string, uri: string, fileName: string){
  const supabase = getSupabase();
  const bucket = 'trip-photos';
  const path = `trip/${tripId}/photos/${fileName}`;
  const resp = await fetch(uri);
  const blob = await resp.blob();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
  if (error) throw error;
  const { data, error:insErr } = await supabase.from('photos').insert({ trip_id: tripId, storage_path: `${bucket}/${path}` }).select('*').single();
  if (insErr) throw insErr;
  return data;
}
