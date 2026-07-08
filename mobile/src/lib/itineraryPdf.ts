// Export a trip itinerary as a clean A4 PDF via expo-print. Text-only HTML is
// safe with the iOS print renderer (the on-device black-box bug affects images,
// not type), so this stays lightweight and works without any native module.
// Styling follows the brand: navy ink, coral accents, serif display headings.
import type { DocInput } from './itineraryDoc';

const esc = (s: string) => s.replace(/[<>&]/g, (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'));

export function buildItineraryPdfHtml(input: DocInput): string {
  const days = input.days
    .map((d) => {
      const slots = d.slots
        .filter((s) => s.items.length)
        .map(
          (s) => `
      <div class="slot">${esc(s.label)}</div>
      <ul>${s.items.map((i) => `<li>${esc(i.name)}${i.meta ? `<span class="meta"> — ${esc(i.meta)}</span>` : ''}</li>`).join('')}</ul>`,
        )
        .join('');
      const note = d.note ? `<p class="note">${esc(d.note)}</p>` : '';
      return `<div class="day"><h2>${esc(d.label)}</h2>${note}${slots || '<p class="empty">Nothing planned yet.</p>'}</div>`;
    })
    .join('');
  const crew = input.crew?.length ? `<p class="crew">Travelling with ${input.crew.map(esc).join(', ')}</p>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #2A3244; margin: 0; padding: 34pt 40pt; }
    h1 { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; font-size: 26pt; color: #14213D; margin: 0 0 2pt; }
    .subtitle { font-size: 10.5pt; color: #8A90A3; margin: 0 0 4pt; }
    .crew { font-size: 10pt; color: #5B6478; font-style: italic; margin: 0; }
    .rule { height: 2pt; background: #FF6A55; width: 64pt; border: 0; margin: 14pt 0 4pt; }
    .day { page-break-inside: avoid; margin-top: 16pt; }
    h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; font-size: 14.5pt; color: #14213D; border-bottom: 0.75pt solid #E6E8F0; padding-bottom: 3pt; margin: 0 0 4pt; }
    .slot { font-size: 8.5pt; font-weight: 700; letter-spacing: 1.4pt; color: #FF6A55; text-transform: uppercase; margin: 9pt 0 2pt; }
    ul { margin: 0 0 2pt 14pt; padding: 0; }
    li { font-size: 11pt; line-height: 1.5; margin: 1pt 0; }
    .meta { color: #8A90A3; font-size: 9.5pt; }
    .note { font-style: italic; color: #5B6478; font-size: 10.5pt; margin: 2pt 0 4pt; }
    .empty { color: #A6ABBC; font-size: 10.5pt; }
    .footer { margin-top: 26pt; font-size: 8.5pt; color: #A6ABBC; letter-spacing: 0.8pt; }
  </style></head><body>
    <h1>${esc(input.title)}</h1>
    ${input.subtitle ? `<p class="subtitle">${esc(input.subtitle)}</p>` : ''}
    ${crew}
    <hr class="rule" />
    ${days}
    <p class="footer">MADE WITH WORLDLY</p>
  </body></html>`;
}

/** Render the itinerary to a PDF and hand it to the native share sheet.
 *  Returns false when sharing isn't available on the device. */
export async function shareItineraryPdf(input: DocInput): Promise<boolean> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');
  const { uri } = await Print.printToFileAsync({ html: buildItineraryPdfHtml(input) });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: `${input.title} — itinerary` });
  return true;
}

/** A compact plain-text itinerary for Messages/WhatsApp. */
export function buildItineraryText(input: DocInput): string {
  const lines: string[] = [input.title.toUpperCase()];
  if (input.subtitle) lines.push(input.subtitle);
  for (const d of input.days) {
    const slots = d.slots.filter((s) => s.items.length);
    if (!slots.length && !d.note) continue;
    lines.push('', d.label);
    if (d.note) lines.push(`  ${d.note}`);
    for (const s of slots) {
      lines.push(`  ${s.label}:`);
      for (const i of s.items) lines.push(`   • ${i.name}${i.meta ? ` (${i.meta})` : ''}`);
    }
  }
  lines.push('', 'Made with Worldly');
  return lines.join('\n');
}
