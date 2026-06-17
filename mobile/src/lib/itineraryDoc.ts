// Export a trip itinerary as a Word-openable document. We emit Office-flavoured
// HTML saved with a .doc extension — Word / Pages / Google Docs all open it —
// and hand it to the native share sheet (works in Expo Go, no native module).
import { writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy';

const esc = (s: string) => s.replace(/[<>&]/g, (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'));

export interface DocSlot {
  label: string;
  items: { name: string; meta?: string }[];
}
export interface DocDay {
  label: string;
  note?: string;
  slots: DocSlot[];
}
export interface DocInput {
  title: string;
  subtitle?: string;
  crew?: string[];
  days: DocDay[];
}

export function buildItineraryHtml(input: DocInput): string {
  const dayHtml = input.days
    .map((d) => {
      const slots = d.slots
        .filter((s) => s.items.length)
        .map(
          (s) => `
        <p style="margin:12px 0 2px;font-weight:bold;color:#FF6B9A;text-transform:uppercase;font-size:11pt;">${esc(s.label)}</p>
        <ul style="margin:0 0 4px 18px;">${s.items
          .map((i) => `<li style="margin:2px 0;">${esc(i.name)}${i.meta ? ` <span style="color:#888;">— ${esc(i.meta)}</span>` : ''}</li>`)
          .join('')}</ul>`,
        )
        .join('');
      const note = d.note ? `<p style="font-style:italic;color:#555;margin:4px 0;">${esc(d.note)}</p>` : '';
      const body = slots || '<p style="color:#999;">Nothing planned yet.</p>';
      return `<h2 style="color:#14213D;border-bottom:1px solid #e6e6ee;padding-bottom:4px;margin-top:22px;">${esc(d.label)}</h2>${note}${body}`;
    })
    .join('');

  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${esc(input.title)}</title></head>
<body style="font-family:Calibri,Arial,sans-serif;color:#14213D;line-height:1.4;">
  <h1 style="margin:0 0 2px;">${esc(input.title)}</h1>
  ${input.subtitle ? `<p style="color:#555;margin:0 0 4px;">${esc(input.subtitle)}</p>` : ''}
  ${input.crew && input.crew.length ? `<p style="color:#555;margin:0 0 6px;"><b>Trip crew:</b> ${esc(input.crew.join(', '))}</p>` : ''}
  <hr/>
  ${dayHtml}
  <hr/>
  <p style="color:#999;font-size:9pt;">Created with Worldly</p>
</body></html>`;
}

/** Write the doc and open the share sheet. Returns false if sharing is unavailable. */
export async function saveItineraryDoc(filename: string, html: string): Promise<boolean> {
  const Sharing = await import('expo-sharing');
  const safe = filename.replace(/[^\w\d -]/g, '').trim() || 'Itinerary';
  const uri = `${cacheDirectory}${safe}.doc`;
  await writeAsStringAsync(uri, html);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/msword', dialogTitle: 'Save itinerary', UTI: 'com.microsoft.word.doc' });
  return true;
}
