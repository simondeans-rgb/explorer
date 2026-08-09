// Lifetime Wrapped soundtrack + its analysed timeline.
//
// The bundled instrumental was analysed offline (ffmpeg-decoded RMS envelope +
// onset detection). Key structure, in seconds:
//   • 0.0–3.6   soft intro building in
//   • 3.6–11.0  first phrase          (onset ~11.0)
//   • 11.0–18.3 second phrase         (onset ~18.3)
//   • 18.3–25.6 third phrase          (onset ~25.6)
//   • 25.6–32.7 fourth phrase / pre-build (build onset ~32.7)
//   • 32.7–35.0 the build / drop
//   • 35.0–49.3 climax (sustained ~0.9 energy, absolute peak ~47.6)
//   • 49.3–53.8 resolution / natural fade-out (last audible ~53.1)
// The scene timeline (see lifetimeWrapped.ts) snaps its cuts to these onsets so
// major visual changes land on musical phrases and the climax.

export const TRACK_MS = 53_800; // full track length
/** Section onsets (ms) used to place scene boundaries on musical phrases. */
export const ONSETS_MS = {
  introEnd: 3_600,
  phrase1: 11_000,
  phrase2: 18_300,
  phrase3: 25_600,
  build: 32_700,
  climax: 35_000,
  peak: 47_600,
  resolution: 49_300,
  end: TRACK_MS,
} as const;

// ── Fail-silent audio player ────────────────────────────────────────────────
// expo-audio's native module only exists in a binary built with it. On an older
// binary running OTA'd JS the player must no-op (the visual timeline still runs
// on its own clock, just silent), mirroring the haptics/frameVideo pattern.

export interface LifetimePlayer {
  available: boolean;
  play(): void;
  pause(): void;
  /** seconds */
  seekTo(sec: number): void;
  setMuted(muted: boolean): void;
  /** current playback position in seconds, or null when unavailable */
  position(): number | null;
  release(): void;
}

// Native audio is temporarily DISABLED. A confirmed native crash (Sentry:
// EXC_BAD_ACCESS / KERN_INVALID_ADDRESS, mechanism "mach", on Play) originates
// in expo-audio's native player — the only native call made when playback
// starts — and can't be caught from JS. Until it's fixed and verified in a
// native build (with dSYMs uploaded so the frame symbolicates), Lifetime Wrapped
// runs its visual timeline silently rather than crashing. Flip back to true to
// re-enable once the native path is proven safe.
const NATIVE_AUDIO_ENABLED = false;

const SILENT: LifetimePlayer = {
  available: false,
  play() {},
  pause() {},
  seekTo() {},
  setMuted() {},
  position() {
    return null;
  },
  release() {},
};

/** Prepare the bundled soundtrack as a LOCAL file URI before it's played.
 *  Over an EAS OTA update the .mp3 lives on Expo's CDN; handing that unresolved
 *  asset straight to the native player crashed on device. Downloading it first
 *  (expo-asset caches after the first time) gives the player a local file. Returns
 *  null if it can't be prepared, in which case playback is simply silent. */
export async function loadLifetimeAudioSource(): Promise<{ uri: string } | null> {
  if (!NATIVE_AUDIO_ENABLED) return null;
  try {
    const { Asset } = await import('expo-asset');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asset = Asset.fromModule(require('../../assets/audio/lifetime-wrapped.mp3'));
    if (!asset.localUri) await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    return uri ? { uri } : null;
  } catch {
    return null;
  }
}

/** Create a player for the (pre-resolved local) soundtrack. Returns a silent
 *  no-op player if there's no source, expo-audio's native module isn't present
 *  (older binary), or setup fails. */
export function createLifetimePlayer(muted: boolean, source: { uri: string } | null): LifetimePlayer {
  if (!NATIVE_AUDIO_ENABLED || !source) return SILENT;
  try {
    // Lazy — never evaluated at import time, so the bundle is safe on binaries
    // without the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const audio = require('expo-audio') as typeof import('expo-audio');
    const player = audio.createAudioPlayer(source, { updateInterval: 100 });
    player.muted = muted;
    return {
      available: true,
      play() {
        try {
          player.play();
        } catch {}
      },
      pause() {
        try {
          player.pause();
        } catch {}
      },
      seekTo(sec) {
        try {
          void player.seekTo(sec);
        } catch {}
      },
      setMuted(m) {
        try {
          player.muted = m;
        } catch {}
      },
      position() {
        try {
          return player.currentTime;
        } catch {
          return null;
        }
      },
      release() {
        try {
          player.remove();
        } catch {}
      },
    };
  } catch {
    return SILENT;
  }
}
