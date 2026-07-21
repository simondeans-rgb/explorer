import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface PickedPhoto {
  dataUrl: string;
  /** EXIF geotag, when the photo carries one and the OS shares it. */
  latitude?: number;
  longitude?: number;
  /** When the photo was taken (EXIF DateTimeOriginal), ms epoch. */
  takenAt?: number;
}

const NUM = (v: unknown): number | undefined => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return isFinite(n) ? n : undefined;
};

/** EXIF "YYYY:MM:DD HH:MM:SS" (local time where taken) → ms epoch. */
function parseExifDate(v: unknown): number | undefined {
  if (typeof v !== 'string') return undefined;
  const m = v.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return undefined;
  const t = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
  return isFinite(t) ? t : undefined;
}

/** Pull GPS + timestamp out of an ImagePicker asset's EXIF block. iOS reports
 *  signed decimal degrees; some Android builds give unsigned values + N/S/E/W
 *  refs, so both shapes are handled. */
function metaFromExif(exif: Record<string, unknown> | null | undefined): Omit<PickedPhoto, 'dataUrl'> {
  if (!exif) return {};
  const gps = (exif.GPS ?? {}) as Record<string, unknown>; // Android sometimes nests
  let lat = NUM(exif.GPSLatitude) ?? NUM(gps.Latitude ?? gps.GPSLatitude);
  let lng = NUM(exif.GPSLongitude) ?? NUM(gps.Longitude ?? gps.GPSLongitude);
  const latRef = (exif.GPSLatitudeRef ?? gps.LatitudeRef) as string | undefined;
  const lngRef = (exif.GPSLongitudeRef ?? gps.LongitudeRef) as string | undefined;
  if (lat !== undefined && latRef === 'S' && lat > 0) lat = -lat;
  if (lng !== undefined && lngRef === 'W' && lng > 0) lng = -lng;
  const takenAt = parseExifDate(exif.DateTimeOriginal) ?? parseExifDate(exif.DateTimeDigitized) ?? parseExifDate(exif.DateTime);
  const valid = lat !== undefined && lng !== undefined && (lat !== 0 || lng !== 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  return valid ? { latitude: lat, longitude: lng, takenAt } : { takenAt };
}

/** Pick from the library or take a photo: a compact JPEG data URL (well under
 *  the 2 MB Storage limit) plus any geotag / taken-at metadata the photo
 *  carries. Returns null if the user cancels or denies permission. */
export async function pickPhotoWithMeta(
  source: 'camera' | 'library',
  maxWidth = 1280,
  aspect: [number, number] = [4, 3],
): Promise<PickedPhoto | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 1,
    exif: true,
  };

  let result: ImagePicker.ImagePickerResult;
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;
    result = await ImagePicker.launchImageLibraryAsync(options);
  }

  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return assetToPicked(asset, maxWidth);
}

/** Turn one picked asset into a compact captured photo + its recovered EXIF
 *  location/timestamp. Shared by the single- and multi-photo pickers. */
async function assetToPicked(asset: ImagePicker.ImagePickerAsset, maxWidth: number): Promise<PickedPhoto | null> {
  let meta = metaFromExif(asset.exif as Record<string, unknown> | null | undefined);
  // The in-picker crop step often strips GPS from the returned EXIF. When the
  // library asset id is available, best-effort recover location + timestamp.
  if (meta.latitude === undefined && asset.assetId) {
    try {
      const MediaLibrary = await import('expo-media-library');
      const info = await MediaLibrary.getAssetInfoAsync(asset.assetId);
      if (info.location) meta = { ...meta, latitude: info.location.latitude, longitude: info.location.longitude };
      if (meta.takenAt === undefined && info.creationTime) meta = { ...meta, takenAt: info.creationTime };
    } catch {
      /* limited permissions or missing asset — geotag stays unknown */
    }
  }
  const out = await manipulateAsync(asset.uri, [{ resize: { width: maxWidth } }], { compress: 0.6, format: SaveFormat.JPEG, base64: true });
  if (!out.base64) return null;
  return { dataUrl: `data:image/jpeg;base64,${out.base64}`, ...meta };
}

/** Pick several library photos at once — each keeps its own EXIF location +
 *  timestamp so callers can auto-place and auto-link them per photo. Library
 *  only (no crop step for a batch). Returns [] on cancel / denied permission. */
export async function pickMultiplePhotosWithMeta(maxWidth = 1280, limit = 30): Promise<PickedPhoto[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 1,
    exif: true,
  });
  if (result.canceled) return [];
  const out: PickedPhoto[] = [];
  for (const asset of result.assets) {
    const p = await assetToPicked(asset, maxWidth);
    if (p) out.push(p);
  }
  return out;
}

/** Downscale any local/library image uri into a compact JPEG data URL —
 *  the storage format for captures. Returns null when the uri can't be read
 *  (e.g. an iCloud-offloaded photo with no local copy). */
export async function uriToDataUrl(uri: string, maxWidth = 1600): Promise<string | null> {
  try {
    const out = await manipulateAsync(uri, [{ resize: { width: maxWidth } }], {
      compress: 0.6,
      format: SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ? `data:image/jpeg;base64,${out.base64}` : null;
  } catch {
    return null;
  }
}

/** Back-compat: just the data URL (callers that don't need the metadata). */
export async function pickPhotoDataUrl(
  source: 'camera' | 'library',
  maxWidth = 1280,
  aspect: [number, number] = [4, 3],
): Promise<string | null> {
  const picked = await pickPhotoWithMeta(source, maxWidth, aspect);
  return picked?.dataUrl ?? null;
}
