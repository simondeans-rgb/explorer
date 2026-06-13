// Turn an ISO 3166-1 alpha-2 code into its flag, using Unicode regional
// indicator symbols. No image assets required — the OS renders the flag.
const FALLBACK = '🏳️';
const A = 0x1f1e6; // 🇦
const ASCII_A = 'A'.charCodeAt(0);

export function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return FALLBACK;
  const cc = code.toUpperCase();
  const first = cc.charCodeAt(0) - ASCII_A;
  const second = cc.charCodeAt(1) - ASCII_A;
  if (first < 0 || first > 25 || second < 0 || second > 25) return FALLBACK;
  return String.fromCodePoint(A + first, A + second);
}
