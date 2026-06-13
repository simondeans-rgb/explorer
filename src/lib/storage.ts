// Photo storage. New photos (captures, discovery photos, country covers) are
// uploaded to Firebase Cloud Storage and only their download URL is kept in
// Firestore — keeping documents tiny and reads fast. Old base64 data-URL
// documents keep working (an <img> renders both), and demo / no-Storage mode
// passes the data URL straight through.

import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

function newId(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export interface StoredImage {
  /** Download URL (or the original data URL when Storage isn't available). */
  url: string;
  /** Storage object path, for later deletion. Empty when not uploaded. */
  path: string;
}

/**
 * Upload a compact JPEG data URL to Storage under the owner's folder and return
 * its download URL + path. If Storage isn't configured, or the value is already
 * an https URL (e.g. editing without changing the photo), it's returned as-is.
 */
export async function uploadImage(
  userId: string,
  folder: string,
  dataUrl: string,
): Promise<StoredImage> {
  if (!storage || !userId || !dataUrl.startsWith('data:')) {
    return { url: dataUrl, path: '' };
  }
  const path = `users/${userId}/${folder}/${newId()}.jpg`;
  const r = ref(storage, path);
  await uploadString(r, dataUrl, 'data_url', {
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=31536000, immutable',
  });
  const url = await getDownloadURL(r);
  return { url, path };
}

/** Delete a Storage object by path. No-ops in demo mode or if already gone. */
export async function deleteImage(path: string | undefined): Promise<void> {
  if (!storage || !path) return;
  const r = ref(storage, path);
  try {
    await getMetadata(r); // avoids a noisy 404 when the object isn't there
    await deleteObject(r);
  } catch {
    /* already deleted or never existed */
  }
}
