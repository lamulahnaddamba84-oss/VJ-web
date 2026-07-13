import { supabase } from "@/integrations/supabase/client";

/**
 * Fast Supabase upload with real byte-level progress.
 * Uses XMLHttpRequest to POST directly to the Storage endpoint so we can
 * report upload progress (the JS SDK has no progress event).
 */
export type UploadProgress = { loaded: number; total: number; percent: number };

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export async function fastUpload(opts: {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (p: UploadProgress) => void;
  signedUrlTtlSeconds?: number;
}): Promise<{ path: string; signedUrl: string }> {
  const { bucket, path, file, onProgress } = opts;

  // Get the current session so RLS applies as the user.
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token ?? SUPABASE_KEY;

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURI(path)}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", SUPABASE_KEY);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "31536000");
    if (file.type) xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  const ttl = opts.signedUrlTtlSeconds ?? 60 * 60 * 24 * 365 * 10;
  const { data: signed, error } = await supabase.storage.from(bucket).createSignedUrl(path, ttl);
  if (error || !signed) throw error ?? new Error("Could not sign URL");
  return { path, signedUrl: signed.signedUrl };
}
