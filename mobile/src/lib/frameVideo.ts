// Bridge to the local FrameVideo native module (iOS only): encodes a sequence
// of captured PNG frames into a shareable H.264 MP4. The module only exists in
// binaries built after it was added, so everything is availability-gated —
// OTA-safe by construction (older builds simply don't offer video export).
import { requireOptionalNativeModule } from 'expo-modules-core';

type FrameVideoNative = {
  encodeFrames(paths: string[], fps: number, width: number, height: number): Promise<string>;
};

const native = requireOptionalNativeModule<FrameVideoNative>('FrameVideo');

export function canExportFrameVideo(): boolean {
  return native != null;
}

/** Encode PNG frames to an MP4; returns the video's file URI, or null when the
 *  native module isn't in this binary. Repeat the last path to hold the final
 *  frame on screen. */
export async function encodeFramesToVideo(
  paths: string[],
  fps: number,
  width: number,
  height: number,
): Promise<string | null> {
  if (!native) return null;
  return native.encodeFrames(paths, fps, width, height);
}
