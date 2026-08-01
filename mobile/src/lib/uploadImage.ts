import { ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';

const CACHE_CONTROL = 'public, max-age=31536000, immutable';

/** Upload a base64 image data URL to Storage and return its download URL.
 *
 *  Why not `uploadString(ref, dataUrl, 'data_url')`? The Firebase **web** SDK
 *  builds that upload from a Blob created out of raw bytes. React Native's Blob
 *  can't hold raw bytes, so on a real device the upload never completes — it
 *  fails immediately — even though the same code works in a browser/dev. The
 *  reliable React Native path is to give Storage a Blob backed by a real file:
 *  write the base64 to a cache file, `fetch` a Blob from it, and `uploadBytes`
 *  that. */
export async function uploadImageDataUrl(
  storage: FirebaseStorage,
  path: string,
  dataUrl: string,
  contentType = 'image/jpeg',
): Promise<string> {
  const FS = await import('expo-file-system/legacy');
  const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl;
  const tmp = `${FS.cacheDirectory}upload-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
  await FS.writeAsStringAsync(tmp, base64, { encoding: FS.EncodingType.Base64 });
  try {
    const blob = await (await fetch(tmp)).blob();
    const r = ref(storage, path);
    await uploadBytes(r, blob, { contentType, cacheControl: CACHE_CONTROL });
    return await getDownloadURL(r);
  } finally {
    FS.deleteAsync(tmp, { idempotent: true }).catch(() => {});
  }
}
