import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/** Pick from the library or take a photo, then resize + compress it to a
 *  compact JPEG data URL (well under the 2 MB Storage limit). Returns null if
 *  the user cancels or denies permission. */
export async function pickPhotoDataUrl(
  source: 'camera' | 'library',
  maxWidth = 1280,
  aspect: [number, number] = [4, 3],
): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 1,
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

  const out = await manipulateAsync(
    asset.uri,
    [{ resize: { width: maxWidth } }],
    { compress: 0.6, format: SaveFormat.JPEG, base64: true },
  );
  if (!out.base64) return null;
  return `data:image/jpeg;base64,${out.base64}`;
}
