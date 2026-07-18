// App Store rating prompt, asked only at delightful moments (a Wrapped share,
// a milestone country, a successful photo scan) — never on launch or mid-task.
//
// expo-store-review's native module ships with the next binary; today's
// TestFlight builds don't have it, and this file arrives over-the-air. So the
// module is require()'d lazily inside try/catch and every path fails silent —
// on an older binary the prompt simply never appears. Apple itself caps the
// system dialog at 3 shows per year; we stay well under it with our own
// cooldown so the ask always lands on a high note.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'worldly:rating';
const COOLDOWN_MS = 60 * 24 * 3600 * 1000; // at most one ask per ~2 months
const MAX_ASKS = 3;

interface RatingState {
  asks: number;
  lastAsk: number;
}

async function readState(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as RatingState;
  } catch {
    /* fall through */
  }
  return { asks: 0, lastAsk: 0 };
}

/** Ask for a rating if this is a good moment and we haven't asked recently.
 *  Safe to call from anywhere — all failure paths are silent no-ops. */
export async function maybeAskForRating(moment: string): Promise<void> {
  try {
    const state = await readState();
    if (state.asks >= MAX_ASKS) return;
    if (Date.now() - state.lastAsk < COOLDOWN_MS) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: the native module may not exist in this binary yet
    const StoreReview = require('expo-store-review') as typeof import('expo-store-review');
    if (!(await StoreReview.isAvailableAsync())) return;

    // Record the ask BEFORE showing: if the dialog appears and the app is
    // backgrounded, we still must not re-ask soon after.
    await AsyncStorage.setItem(KEY, JSON.stringify({ asks: state.asks + 1, lastAsk: Date.now() }));

    // Let the moment breathe (toast/share sheet settling) before the dialog.
    setTimeout(() => {
      StoreReview.requestReview().catch(() => {});
    }, 1200);

    // Analytics is imported lazily to keep this module dependency-light.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose
    const { track } = require('./analytics') as typeof import('../lib/analytics');
    track('rating_prompt_shown', { moment });
  } catch {
    /* older binary without the module, or the OS declined — never surface */
  }
}
