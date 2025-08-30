import { getSupabase } from './client';
export type DocSegment = 'outbound'|'return'|'on_site';

export async function uploadDocument(tripId: string, segment: DocSegment, uri: string, fileName: string, title: string){
  const supabase = getSupabase();
  const bucket = 'trip-documents';
  const path = `trip/${tripId}/docs/${fileName}`;
  const resp = await fetch(uri);
  const blob = await resp.blob();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: blob.type || 'application/pdf' });
  if (error) throw error;
  const { data, error:insErr } = await supabase.from('documents').insert({ trip_id: tripId, segment, title, storage_path: `${bucket}/${path}` }).select('*').single();
  if (insErr) throw insErr;
  return data;
}
