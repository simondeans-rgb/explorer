import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { flagEmoji } from '../src/lib/flags';
import { destinationImage, hasDestinationPhoto } from '../src/lib/destinationImage';
import { jpegsToPdf, sharePdfBytes, type PdfPageImage } from '../src/lib/miniPdf';
import type { AlmanacBookInput } from '../src/lib/almanacBook';

// The Almanac book, rendered as native views at 720x1018 (one component per
// page) and snapshotted into JPEGs — the print path that actually shows
// photography (iOS's WebView print pipeline paints images black) and sets the
// book in the app's real typefaces (Fraunces / Plus Jakarta Sans).

export const BOOK_W = 720;
export const BOOK_H = 1018;

const NAVY = '#0D1428';
const PAPER = '#FBF7F2';
const INK = '#16203A';
const MUTED = '#6B7280';
const FAINT = '#9AA1B2';
const CORAL = '#FF6B9A';
const CORAL_DEEP = '#E2497F';
const STAT_COLORS = ['#FF6B9A', '#24D1C3', '#9B7CFF', '#FFB84D', '#4DA6FF', '#F2557D'];

export type BookPageSpec =
  | { kind: 'cover'; heroUrl?: string; firstName: string; generatedOn: string }
  | { kind: 'title'; firstName: string; generatedOn: string }
  | { kind: 'pictures'; folio: number; cards: { url: string; code: string; name: string }[] }
  | {
      kind: 'numbers';
      folio: number;
      figures: { label: string; value: number }[];
      relationships: { label: string; count: number }[];
      categories: { label: string; count: number }[];
    }
  | { kind: 'continent'; folio: number; name: string; heroUrl?: string; countries: { code: string; name: string }[] }
  | {
      kind: 'trip';
      folio: number;
      title: string;
      meta: string;
      flagCodes: string[];
      photos: string[];
      heroUrl?: string;
      quote?: { text: string; attribution: string };
    }
  | { kind: 'recognitions'; folio: number; items: { symbol: string; title: string; description: string }[] }
  | { kind: 'back'; countries?: number };

/** How many photos a page waits for before it can be captured. */
export function pageImageCount(spec: BookPageSpec): number {
  switch (spec.kind) {
    case 'cover':
      return spec.heroUrl ? 1 : 0;
    case 'pictures':
      return spec.cards.length;
    case 'continent':
      return spec.heroUrl ? 1 : 0;
    case 'trip':
      return spec.photos.length ? Math.min(spec.photos.length, 4) : spec.heroUrl ? 1 : 0;
    default:
      return 0;
  }
}

/** Lay the book out as a page list (folio numbers on content pages only). */
export function buildBookPages(input: AlmanacBookInput): BookPageSpec[] {
  const first = (input.firstName || 'Explorer').split(' ')[0];
  const url = (code?: string) => (code && hasDestinationPhoto(code) ? destinationImage(code).photo : undefined);
  let folio = 0;
  const pages: BookPageSpec[] = [
    { kind: 'cover', heroUrl: url(input.heroCode), firstName: first, generatedOn: input.generatedOn },
    { kind: 'title', firstName: first, generatedOn: input.generatedOn },
  ];
  const cards = (input.photoStrip ?? [])
    .filter((s) => hasDestinationPhoto(s.code))
    .slice(0, 5)
    .map((s) => ({ url: destinationImage(s.code).photo!, code: s.code, name: s.name }));
  if (cards.length) pages.push({ kind: 'pictures', folio: ++folio, cards });
  pages.push({
    kind: 'numbers',
    folio: ++folio,
    figures: input.figures,
    relationships: input.relationships,
    categories: input.categories,
  });
  for (const c of input.continents) {
    pages.push({ kind: 'continent', folio: ++folio, name: c.name, heroUrl: url(c.coverCode), countries: c.countries });
  }
  for (const t of input.trips ?? []) {
    pages.push({
      kind: 'trip',
      folio: ++folio,
      title: t.title,
      meta: t.meta,
      flagCodes: t.flagCodes,
      photos: t.photos.slice(0, 4),
      heroUrl: t.photos.length ? undefined : url(t.heroCode),
      quote: t.quote,
    });
  }
  if (input.recognitions.length) pages.push({ kind: 'recognitions', folio: ++folio, items: input.recognitions });
  pages.push({
    kind: 'back',
    countries: input.figures.find((f) => f.label.toLowerCase().includes('countries'))?.value,
  });
  return pages;
}

/* ---------- building blocks ---------- */

const F = { serif: 'Fraunces', sans: 'PlusJakarta' } as const;

function Photo({ url, onLoad }: { url: string; onLoad: () => void }) {
  return (
    <Image
      source={{ uri: url }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      contentFit="cover"
      cachePolicy="disk"
      onLoad={onLoad}
      onError={onLoad}
    />
  );
}

function BrandGradient() {
  return (
    <LinearGradient
      colors={['#FFB84D', '#FF6B9A', '#9B7CFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}

function BottomScrim() {
  return (
    <LinearGradient
      colors={['rgba(8,12,26,0)', 'rgba(8,12,26,0.72)']}
      locations={[0.4, 1]}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <Text style={{ fontFamily: F.sans, fontSize: 16, fontWeight: '800', letterSpacing: 4.5, color: CORAL_DEEP, marginBottom: 8 }}>
      {text}
    </Text>
  );
}

function Kicker({ text, white }: { text: string; white?: boolean }) {
  return (
    <Text numberOfLines={1} style={{ fontFamily: F.serif, fontSize: 42, color: white ? '#fff' : INK, marginBottom: 8 }}>
      {text}
    </Text>
  );
}

function Folio({ n, firstName, dark }: { n: number; firstName: string; dark?: boolean }) {
  const color = dark ? '#5E6884' : FAINT;
  return (
    <View style={{ position: 'absolute', left: 56, right: 56, bottom: 28, flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontFamily: F.sans, fontSize: 12, fontWeight: '700', letterSpacing: 2.5, color }}>
        THE ALMANAC · {firstName.toUpperCase()}’S EDITION
      </Text>
      <Text style={{ fontFamily: F.sans, fontSize: 12, fontWeight: '700', letterSpacing: 2.5, color }}>{n}</Text>
    </View>
  );
}

/* ---------- the page renderer ---------- */

export function AlmanacBookPage({
  spec,
  firstName,
  onImageLoaded,
}: {
  spec: BookPageSpec;
  firstName: string;
  /** Called once per photo as it finishes decoding. */
  onImageLoaded: () => void;
}) {
  const base = { width: BOOK_W, height: BOOK_H, backgroundColor: PAPER, padding: 56, overflow: 'hidden' as const };

  switch (spec.kind) {
    case 'cover':
      return (
        <View style={{ ...base, padding: 0 }}>
          {spec.heroUrl ? <Photo url={spec.heroUrl} onLoad={onImageLoaded} /> : <BrandGradient />}
          <LinearGradient
            colors={['rgba(8,12,26,0.45)', 'rgba(8,12,26,0.08)', 'rgba(8,12,26,0.82)']}
            locations={[0, 0.34, 0.88]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View style={{ flex: 1, padding: 56, justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: F.serif, fontSize: 40, color: '#fff' }}>worldly</Text>
            <View>
              <Text style={{ fontFamily: F.sans, fontSize: 18, fontWeight: '800', letterSpacing: 5, color: '#FFD9E5' }}>
                A RECORD OF EVERYWHERE YOU’VE BEEN
              </Text>
              <View style={{ width: 64, height: 4, borderRadius: 3, backgroundColor: CORAL, marginTop: 12, marginBottom: 10 }} />
              <Text style={{ fontFamily: F.serif, fontSize: 104, lineHeight: 108, color: '#fff' }}>The{'\n'}Almanac</Text>
              <Text style={{ fontFamily: F.sans, fontSize: 19, letterSpacing: 4, color: 'rgba(255,255,255,0.92)', marginTop: 22 }}>
                {spec.firstName.toUpperCase()}’S EDITION · {spec.generatedOn}
              </Text>
            </View>
          </View>
        </View>
      );

    case 'title':
      return (
        <View style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.serif, fontSize: 30, color: INK }}>worldly</Text>
          <View style={{ width: 64, height: 4, borderRadius: 3, backgroundColor: CORAL, marginVertical: 16 }} />
          <Text style={{ fontFamily: F.serif, fontSize: 64, color: INK, marginTop: 10 }}>The Almanac</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 19, color: MUTED, marginTop: 12 }}>A record of everywhere you’ve been</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 13, fontWeight: '700', letterSpacing: 3, color: FAINT, marginTop: 64, lineHeight: 26, textAlign: 'center' }}>
            FIRST EDITION · PRINTED {spec.generatedOn.toUpperCase()}
            {'\n'}FOR {spec.firstName.toUpperCase()}
          </Text>
        </View>
      );

    case 'pictures': {
      const [lead, ...rest] = spec.cards;
      const cell = (c: (typeof spec.cards)[number], h: number) => (
        <View key={c.code} style={{ flex: 1, height: h, borderRadius: 24, overflow: 'hidden' }}>
          <Photo url={c.url} onLoad={onImageLoaded} />
          <BottomScrim />
          <View style={{ position: 'absolute', left: 18, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
            <Text style={{ fontFamily: F.serif, fontSize: 24, color: '#fff' }}>{c.name}</Text>
          </View>
        </View>
      );
      return (
        <View style={base}>
          <Eyebrow text="CHAPTER ONE" />
          <Kicker text="Your world, in pictures" />
          <Text style={{ fontFamily: F.sans, fontSize: 17, color: MUTED, marginBottom: 20 }}>
            The places you know best — ranked by everything you logged there.
          </Text>
          <View style={{ height: 296, borderRadius: 24, overflow: 'hidden', marginBottom: 14 }}>
            <Photo url={lead.url} onLoad={onImageLoaded} />
            <BottomScrim />
            <View style={{ position: 'absolute', left: 18, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 22 }}>{flagEmoji(lead.code)}</Text>
              <Text style={{ fontFamily: F.serif, fontSize: 24, color: '#fff' }}>{lead.name}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {rest.slice(0, 2).map((c) => cell(c, 196))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14 }}>
            {rest.slice(2, 4).map((c) => cell(c, 196))}
          </View>
          <Folio n={spec.folio} firstName={firstName} />
        </View>
      );
    }

    case 'numbers': {
      const rows = (title: string, list: { label: string; count: number }[]) =>
        list.length ? (
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.serif, fontSize: 24, color: '#fff', marginTop: 30, marginBottom: 12 }}>{title}</Text>
            <View style={{ gap: 7 }}>
              {list.map((r) => (
                <View key={r.label} style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: F.sans, fontSize: 17, color: '#E6E9F2' }}>{r.label}</Text>
                  <Text style={{ fontFamily: F.serif, fontSize: 17, color: '#fff' }}>{r.count}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null;
      return (
        <View style={{ ...base, backgroundColor: NAVY }}>
          <Eyebrow text="CHAPTER TWO" />
          <Kicker text="By the numbers" white />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 16 }}>
            {spec.figures.map((f, i) => (
              <View key={f.label} style={{ width: 297, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20 }}>
                <Text style={{ fontFamily: F.serif, fontSize: 54, lineHeight: 58, color: STAT_COLORS[i % STAT_COLORS.length] }}>{f.value}</Text>
                <Text style={{ fontFamily: F.sans, fontSize: 14, fontWeight: '700', letterSpacing: 1.5, color: '#8E97B8', marginTop: 7 }}>
                  {f.label.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {rows('Relationships', spec.relationships)}
            {rows('Discoveries by kind', spec.categories)}
          </View>
          <Folio n={spec.folio} firstName={firstName} dark />
        </View>
      );
    }

    case 'continent':
      return (
        <View style={base}>
          <Eyebrow text="CHAPTER THREE · THE WORLD" />
          <Kicker text={spec.name} />
          <View style={{ height: 380, borderRadius: 26, overflow: 'hidden', marginTop: 10 }}>
            {spec.heroUrl ? <Photo url={spec.heroUrl} onLoad={onImageLoaded} /> : <BrandGradient />}
            <BottomScrim />
            <View style={{ position: 'absolute', right: 18, bottom: 16, backgroundColor: 'rgba(255,255,255,0.24)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 }}>
              <Text style={{ fontFamily: F.sans, fontSize: 15, fontWeight: '700', color: '#fff' }}>
                {spec.countries.length} {spec.countries.length === 1 ? 'country' : 'countries'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
            {spec.countries.map((c) => (
              <View key={c.code} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 }}>
                <Text style={{ fontSize: 19 }}>{flagEmoji(c.code)}</Text>
                <Text style={{ fontFamily: F.sans, fontSize: 16, color: INK }}>{c.name}</Text>
              </View>
            ))}
          </View>
          <Folio n={spec.folio} firstName={firstName} />
        </View>
      );

    case 'trip': {
      const pics = spec.photos;
      const [lead, ...rest] = pics;
      return (
        <View style={base}>
          <Eyebrow text="CHAPTER FOUR · JOURNEYS OF RECORD" />
          <Kicker text={spec.title} />
          <Text style={{ fontFamily: F.sans, fontSize: 16, color: MUTED, marginBottom: 16 }}>{spec.meta}</Text>
          <View style={{ height: 320, borderRadius: 24, overflow: 'hidden' }}>
            {lead ? <Photo url={lead} onLoad={onImageLoaded} /> : spec.heroUrl ? <Photo url={spec.heroUrl} onLoad={onImageLoaded} /> : <BrandGradient />}
            {!lead ? <BottomScrim /> : null}
          </View>
          {rest.length ? (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              {rest.map((p, i) => (
                <View key={i} style={{ flex: 1, height: 170, borderRadius: 18, overflow: 'hidden' }}>
                  <Photo url={p} onLoad={onImageLoaded} />
                </View>
              ))}
            </View>
          ) : null}
          {spec.flagCodes.length ? (
            <Text style={{ fontSize: 26, marginTop: 16 }}>{spec.flagCodes.map((c) => flagEmoji(c)).join(' ')}</Text>
          ) : null}
          {spec.quote ? (
            <View style={{ marginTop: 18 }}>
              <Text style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 21, lineHeight: 31, color: '#3A4361' }} numberOfLines={3}>
                “{spec.quote.text}”
              </Text>
              <Text style={{ fontFamily: F.sans, fontSize: 14, fontWeight: '700', letterSpacing: 1, color: FAINT, marginTop: 8 }}>
                — {spec.quote.attribution}
              </Text>
            </View>
          ) : null}
          <Folio n={spec.folio} firstName={firstName} />
        </View>
      );
    }

    case 'recognitions':
      return (
        <View style={base}>
          <Eyebrow text="CHAPTER FIVE" />
          <Kicker text="Recognitions earned" />
          <View style={{ gap: 12, marginTop: 16 }}>
            {spec.items.slice(0, 9).map((r) => (
              <View key={r.title} style={{ backgroundColor: '#fff', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Text style={{ fontSize: 34 }}>{r.symbol}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.sans, fontSize: 19, fontWeight: '700', color: INK }}>{r.title}</Text>
                  <Text style={{ fontFamily: F.sans, fontSize: 16, color: MUTED, marginTop: 2 }}>{r.description}</Text>
                </View>
              </View>
            ))}
          </View>
          <Folio n={spec.folio} firstName={firstName} />
        </View>
      );

    case 'back':
      return (
        <View style={{ ...base, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.serif, fontSize: 54, color: '#fff' }}>worldly</Text>
          <View style={{ width: 64, height: 4, borderRadius: 3, backgroundColor: CORAL, marginVertical: 16 }} />
          <Text style={{ fontFamily: F.sans, fontSize: 20, letterSpacing: 3, color: '#9AA3C2' }}>YOUR TRAVEL STORY</Text>
          {spec.countries ? (
            <Text style={{ fontFamily: F.serif, fontSize: 24, color: '#FFB84D', marginTop: 26 }}>
              {spec.countries} countries and counting…
            </Text>
          ) : null}
        </View>
      );
  }
}

/* ---------- the printer ---------- */

/** Renders the book one page at a time offscreen, snapshots each into a JPEG,
 *  binds them into a PDF and opens the share sheet. Mount it to start; it
 *  reports progress and calls onDone (with the error, if any) when finished. */
export function BookPrinter({
  pages,
  firstName,
  dialogTitle,
  onProgress,
  onDone,
}: {
  pages: BookPageSpec[];
  firstName: string;
  dialogTitle: string;
  onProgress: (status: string) => void;
  onDone: (error: Error | null) => void;
}) {
  const [index, setIndex] = useState(0);
  const shots = useRef<PdfPageImage[]>([]);
  const loadedCount = useRef(0);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    loadedCount.current = 0;
    let alive = true;
    const spec = pages[index];
    const need = pageImageCount(spec);
    onProgress(`Printing page ${index + 1} of ${pages.length}…`);
    (async () => {
      // Wait for this page's photos to decode (bounded), then let it paint.
      const start = Date.now();
      while (alive && loadedCount.current < need && Date.now() - start < 3500) {
        await new Promise((r) => setTimeout(r, 100));
      }
      await new Promise((r) => setTimeout(r, 200));
      if (!alive) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: native module absent in older builds
        const { captureRef } = require('react-native-view-shot') as typeof import('react-native-view-shot');
        const base64 = await captureRef(viewRef, {
          format: 'jpg',
          quality: 0.9,
          result: 'base64',
          width: 1440,
          height: 2036,
        });
        shots.current.push({ base64: base64.replace(/[\r\n]/g, ''), width: 1440, height: 2036 });
      } catch (e) {
        if (alive) onDone(e instanceof Error ? e : new Error('capture failed'));
        return;
      }
      if (!alive) return;
      if (index + 1 < pages.length) {
        setIndex(index + 1);
      } else {
        try {
          onProgress('Binding your book…');
          const pdf = jpegsToPdf(shots.current, BOOK_W, BOOK_H);
          await sharePdfBytes(pdf, 'worldly-almanac.pdf', dialogTitle);
          onDone(null);
        } catch (e) {
          onDone(e instanceof Error ? e : new Error('binding failed'));
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the loop advances only via index
  }, [index]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: -9999, top: 0, width: BOOK_W, height: BOOK_H }}>
      <View ref={viewRef} collapsable={false} style={{ width: BOOK_W, height: BOOK_H }}>
        <AlmanacBookPage
          spec={pages[index]}
          firstName={firstName}
          onImageLoaded={() => {
            loadedCount.current += 1;
          }}
        />
      </View>
    </View>
  );
}
