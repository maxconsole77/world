import { supabase } from "../lib/supabase";

export async function uploadUriToBucket(bucket: string, uri: string, path: string) {
  const res = await fetch(uri);
  const blob = await res.blob();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: blob.type || "application/octet-stream" });
  if (error) throw error;
  const pub = supabase.storage.from(bucket).getPublicUrl(path);
  return pub.data.publicUrl;
}
