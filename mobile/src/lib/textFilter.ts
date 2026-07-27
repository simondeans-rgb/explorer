// Pure, dependency-free objectionable-text filter (App Store Guideline 1.2).
// Kept separate from moderation.ts (which pulls in Firebase) so it can be
// unit-tested and reused anywhere without native modules.

// A compact blocklist of slurs and unambiguously objectionable terms. Matched
// case-insensitively on word boundaries so ordinary words that merely contain a
// short substring aren't caught. A pragmatic first-line filter, not a
// substitute for the human review that actions reports.
export const BLOCKED_TERMS = [
  'nigger', 'nigga', 'faggot', 'faggots', 'retard', 'retarded', 'spic', 'chink',
  'kike', 'wetback', 'tranny', 'coon', 'paki', 'gook', 'cunt', 'whore', 'slut',
  'rape', 'rapist', 'molest', 'pedophile', 'paedophile', 'kys',
];
const BLOCKED_RE = new RegExp(`\\b(${BLOCKED_TERMS.join('|')})\\b`, 'i');

/** True if the text contains an unambiguously objectionable term. */
export function isObjectionable(text: string): boolean {
  return BLOCKED_RE.test((text || '').toLowerCase());
}

/** Throws with a user-facing message when the text is objectionable. */
export function assertClean(text: string): void {
  if (isObjectionable(text)) {
    throw new Error('That message contains language we don’t allow. Please revise it.');
  }
}
