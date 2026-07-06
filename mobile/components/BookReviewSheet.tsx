import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ImagePlus, BookOpen } from 'lucide-react-native';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { pickPhotoDataUrl } from '../src/lib/photo';
import { track } from '../src/lib/analytics';
import type { BookPageSpec } from './AlmanacBookPages';

// Personalise-your-book review: every photo the book will print, laid out as
// editable slots. Stock destination photos are flagged; any slot can be
// replaced from the user's library (and trips can take extra photos). The
// book only builds once the user confirms.

const isStock = (url?: string) => !!url && !url.startsWith('data:');

interface Slot {
  pageIdx: number;
  slot: number;
  url?: string;
  caption?: string;
  /** True when this slot can hold a photo but has none yet (trip add tile). */
  add?: boolean;
}

interface Section {
  title: string;
  slots: Slot[];
}

function sectionsOf(pages: BookPageSpec[]): Section[] {
  const sections: Section[] = [];
  pages.forEach((p, pageIdx) => {
    switch (p.kind) {
      case 'cover':
        sections.push({ title: 'Cover', slots: [{ pageIdx, slot: 0, url: p.heroUrl, caption: 'Full-page cover' }] });
        break;
      case 'pictures':
        sections.push({
          title: 'Your world, in pictures',
          slots: p.cards.map((c, i) => ({ pageIdx, slot: i, url: c.url, caption: c.name })),
        });
        break;
      case 'continent':
        sections.push({ title: p.name, slots: [{ pageIdx, slot: 0, url: p.heroUrl, caption: 'Chapter cover' }] });
        break;
      case 'trip': {
        const slots: Slot[] = p.photos.length
          ? p.photos.map((url, i) => ({ pageIdx, slot: i, url, caption: i === 0 ? 'Lead photo' : `Photo ${i + 1}` }))
          : [{ pageIdx, slot: 0, url: p.heroUrl, caption: 'Suggested' }];
        if (p.photos.length > 0 && p.photos.length < 4) {
          slots.push({ pageIdx, slot: p.photos.length, add: true });
        }
        sections.push({ title: p.title, slots });
        break;
      }
      default:
        break;
    }
  });
  return sections;
}

export function BookReviewSheet({
  visible,
  pages,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  pages: BookPageSpec[] | null;
  onCancel: () => void;
  onConfirm: (pages: BookPageSpec[]) => void;
}) {
  const [draft, setDraft] = useState<BookPageSpec[] | null>(null);
  const [busySlot, setBusySlot] = useState<string | null>(null);

  useEffect(() => {
    if (visible && pages) {
      setDraft(JSON.parse(JSON.stringify(pages)) as BookPageSpec[]);
      track('book_review_opened');
    }
    if (!visible) setDraft(null);
  }, [visible, pages]);

  if (!draft) {
    return <Modal visible={visible} animationType="slide" onRequestClose={onCancel}><View style={{ flex: 1, backgroundColor: COLORS.warmwhite }} /></Modal>;
  }

  const sections = sectionsOf(draft);
  const stockCount = sections.reduce((n, s) => n + s.slots.filter((sl) => !sl.add && isStock(sl.url)).length, 0);

  async function replace(s: Slot) {
    const key = `${s.pageIdx}:${s.slot}`;
    if (busySlot) return;
    setBusySlot(key);
    try {
      const pageKind = draft![s.pageIdx].kind;
      const dataUrl = await pickPhotoDataUrl('library', 1600, pageKind === 'cover' ? [12, 17] : [4, 3]);
      if (!dataUrl) return;
      setDraft((d) => {
        if (!d) return d;
        const next = d.map((p, i) => (i === s.pageIdx ? (JSON.parse(JSON.stringify(p)) as BookPageSpec) : p));
        const p = next[s.pageIdx];
        if (p.kind === 'cover' || p.kind === 'continent') p.heroUrl = dataUrl;
        else if (p.kind === 'pictures') p.cards[s.slot].url = dataUrl;
        else if (p.kind === 'trip') {
          if (s.slot < p.photos.length) p.photos[s.slot] = dataUrl;
          else p.photos = [...p.photos, dataUrl];
        }
        return next;
      });
      track('book_photo_replaced', { page: draft![s.pageIdx].kind });
    } finally {
      setBusySlot(null);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
        {/* Header */}
        <View style={{ paddingTop: 58, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 26, color: COLORS.navy }}>Personalise your book</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 3, lineHeight: 18 }}>
              Swap any photo before it goes to print. Stock photos are marked — replace them with your own to make it truly yours.
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel" onPress={onCancel} hitSlop={10} className="rounded-full items-center justify-center" style={{ height: 36, width: 36, backgroundColor: 'rgba(20,33,61,0.08)', marginLeft: 12 }}>
            <X size={19} color={COLORS.ink2} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}>
          {sections.map((section, si) => (
            <View key={`${section.title}-${si}`} style={{ marginTop: si === 0 ? 6 : 20 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, color: COLORS.ink3, marginBottom: 8 }}>
                {section.title.toUpperCase()}
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                {section.slots.map((s) => {
                  const key = `${s.pageIdx}:${s.slot}`;
                  const stock = !s.add && isStock(s.url);
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityLabel={s.add ? `Add a photo to ${section.title}` : `Replace ${stock ? 'stock' : 'your'} photo in ${section.title}`}
                      onPress={() => replace(s)}
                      style={{ width: 104, opacity: busySlot && busySlot !== key ? 0.6 : 1 }}
                    >
                      <View className="rounded-2xl items-center justify-center" style={{ height: 128, overflow: 'hidden', backgroundColor: s.add ? 'rgba(20,33,61,0.06)' : COLORS.card }}>
                        {s.add ? (
                          <ImagePlus size={26} color={COLORS.ink3} />
                        ) : (
                          <>
                            <Image source={{ uri: s.url }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" cachePolicy="disk" />
                            <View className="rounded-full" style={{ position: 'absolute', left: 6, bottom: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: stock ? 'rgba(255,184,77,0.95)' : 'rgba(36,209,195,0.95)' }}>
                              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6, color: stock ? '#5C3A00' : '#003D38' }}>
                                {stock ? 'STOCK' : 'YOURS'}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                      <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
                        {s.add ? 'Add photo' : (s.caption ?? 'Photo')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Sticky footer */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 14, backgroundColor: COLORS.warmwhite }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, textAlign: 'center', marginBottom: 10 }}>
            {stockCount > 0
              ? `${stockCount} stock photo${stockCount === 1 ? '' : 's'} still in — swap them, or build anyway.`
              : 'Every photo is yours — this will be a beautiful edition.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Build my book"
            onPress={() => draft && onConfirm(draft)}
            style={{ borderRadius: 24, overflow: 'hidden' }}
          >
            <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 }}>
              <BookOpen size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Build my book</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
