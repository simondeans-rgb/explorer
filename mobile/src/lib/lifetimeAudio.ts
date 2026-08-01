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

/** Create a player for the bundled soundtrack. Returns a silent no-op player if
 *  expo-audio's native module isn't present (older binary) or setup fails. */
export function createLifetimePlayer(muted: boolean): LifetimePlayer {
  try {
    // Lazy — never evaluated at import time, so the bundle is safe on binaries
    // without the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const audio = require('expo-audio') as typeof import('expo-audio');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const source = require('../../assets/audio/lifetime-wrapped.mp3');
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
