// Minimal PDF writer: one full-bleed JPEG per page. The Almanac book's pages
// are captured from real React Native views and bound here by hand — iOS's
// WebView print pipeline (expo-print) renders images as black boxes, so the
// book avoids it entirely.

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = (() => {
  const t = new Uint8Array(128);
  for (let i = 0; i < B64.length; i++) t[B64.charCodeAt(i)] = i;
  return t;
})();

export function base64ToBytes(b64: string): Uint8Array {
  const s = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  let len = Math.floor((s.length / 4) * 3);
  if (s.endsWith('==')) len -= 2;
  else if (s.endsWith('=')) len -= 1;
  const out = new Uint8Array(len);
  let o = 0;
  for (let i = 0; i + 3 < s.length; i += 4) {
    const a = B64_LOOKUP[s.charCodeAt(i)];
    const b = B64_LOOKUP[s.charCodeAt(i + 1)];
    const c = B64_LOOKUP[s.charCodeAt(i + 2)];
    const d = B64_LOOKUP[s.charCodeAt(i + 3)];
    out[o++] = (a << 2) | (b >> 4);
    if (o < len) out[o++] = ((b & 15) << 4) | (c >> 2);
    if (o < len) out[o++] = ((c & 3) << 6) | d;
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  const parts: string[] = [];
  let chunk = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const hasB = i + 1 < bytes.length;
    const hasC = i + 2 < bytes.length;
    const b = hasB ? bytes[i + 1] : 0;
    const c = hasC ? bytes[i + 2] : 0;
    chunk +=
      B64[a >> 2] +
      B64[((a & 3) << 4) | (b >> 4)] +
      (hasB ? B64[((b & 15) << 2) | (c >> 6)] : '=') +
      (hasC ? B64[c & 63] : '=');
    if (chunk.length >= 65536) {
      parts.push(chunk);
      chunk = '';
    }
  }
  parts.push(chunk);
  return parts.join('');
}

export interface PdfPageImage {
  /** Base64 JPEG (no data: prefix). */
  base64: string;
  /** JPEG pixel dimensions. */
  width: number;
  height: number;
}

/** Bind full-bleed JPEG pages into a PDF (page size in PDF points). */
export function jpegsToPdf(pages: PdfPageImage[], pageW: number, pageH: number): Uint8Array {
  const enc = (s: string) => {
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff;
    return u;
  };
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (u: Uint8Array) => {
    chunks.push(u);
    pos += u.length;
  };
  const obj = (n: number, body: string) => {
    offsets[n] = pos;
    push(enc(`${n} 0 obj\n${body}\nendobj\n`));
  };

  push(enc('%PDF-1.4\n%ÿÿÿÿ\n'));
  const n = pages.length;
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + 3 * i} 0 R`).join(' ')}] /Count ${n} >>`);
  pages.forEach((p, i) => {
    const pageN = 3 + 3 * i;
    const contentN = pageN + 1;
    const imageN = pageN + 2;
    obj(
      pageN,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${i} ${imageN} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${contentN} 0 R >>`,
    );
    const draw = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im${i} Do Q`;
    obj(contentN, `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`);
    const jpeg = base64ToBytes(p.base64);
    offsets[imageN] = pos;
    push(
      enc(
        `${imageN} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      ),
    );
    push(jpeg);
    push(enc('\nendstream\nendobj\n'));
  });

  const xrefPos = pos;
  const total = 3 + 3 * n;
  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  push(enc(xref));

  const out = new Uint8Array(pos);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

/** Write PDF bytes to the cache directory and open the share sheet. */
export async function sharePdfBytes(bytes: Uint8Array, filename: string, dialogTitle: string): Promise<void> {
  const FS = await import('expo-file-system/legacy');
  const uri = `${FS.cacheDirectory}${filename}`;
  await FS.writeAsStringAsync(uri, bytesToBase64(bytes), { encoding: 'base64' });
  const Sharing = await import('expo-sharing');
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle, UTI: 'com.adobe.pdf' });
  }
}
