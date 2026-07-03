// Share a rendered view as a PNG image — images preview inline in iMessage /
// WhatsApp / Instagram where a PDF only shows as a document attachment.
//
// react-native-view-shot is a native module that older binaries don't include,
// so it's require()'d lazily and callers fall back to the PDF poster when it's
// unavailable (returns false). OTA-safe by construction.
import type { Component } from 'react';

export async function shareViewAsPng(
  ref: number | Component,
  dialogTitle: string,
): Promise<boolean> {
  let uri: string;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: native module absent in older builds
    const { captureRef } = require('react-native-view-shot') as typeof import('react-native-view-shot');
    uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      // Capture at story-sized resolution regardless of on-screen scale.
      width: 1080,
      height: 1920,
    });
  } catch {
    return false; // module missing (older binary) or capture failed → caller falls back
  }
  try {
    const Sharing = await import('expo-sharing');
    if (!(await Sharing.isAvailableAsync())) return false;
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle, UTI: 'public.png' });
    return true;
  } catch {
    // Treat a failure after capture as handled (e.g. user dismissed the sheet).
    return true;
  }
}
