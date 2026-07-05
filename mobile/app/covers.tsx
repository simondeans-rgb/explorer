import { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Lock, Sparkles } from 'lucide-react-native';
import { BackButton } from '../components/BackButton';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { goBack } from '../src/lib/nav';
import { useWorldly } from '../src/hooks/useWorldly';
import { altIcons, lockReason, COVER_SECTIONS, type CoverDef } from '../src/lib/covers';
import { track } from '../src/lib/analytics';

/** Passport Covers — pick an alternate app icon. On binaries without the
 *  native module the grid is a read-only preview with an "arriving soon" note. */
export default function CoversScreen() {
  const { width } = useWindowDimensions();
  const { stats, level } = useWorldly();
  const icons = altIcons();
  const [current, setCurrent] = useState<string | null>(() => icons?.getAppIconName() ?? null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cell = (width - 40 - 24) / 3;

  async function pick(cover: CoverDef) {
    if (busy) return;
    const locked = lockReason(cover, stats.countriesDiscovered, level.level);
    if (locked) {
      setNote(`${cover.title} is still locked — ${locked.toLowerCase()}.`);
      return;
    }
    if (!icons) {
      setNote('Passport Covers arrive with the next app update — this is a preview.');
      return;
    }
    if (cover.name === current) return;
    setBusy(true);
    try {
      await icons.setAlternateAppIcon(cover.name);
      setCurrent(cover.name);
      setNote(null);
      track('cover_changed', { cover: cover.name ?? 'classic' });
    } catch {
      setNote("That cover couldn't be applied — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: 26, paddingHorizontal: 22 }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 58, left: 18, zIndex: 20 }} />
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.9, textAlign: 'center' }}>EXPRESS YOUR STYLE</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, textAlign: 'center', marginTop: 2 }}>Passport Covers</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, textAlign: 'center', marginTop: 4 }}>
            Choose a cover to make Worldly your own — same trusted app, a look that reflects you.
          </Text>
        </LinearGradient>

        {!icons ? (
          <View className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 16, padding: 14, gap: 12 }}>
            <Sparkles size={18} color={COLORS.coral} />
            <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, lineHeight: 18 }}>
              Passport Covers arrive with the next app update. Here's a preview of the collection.
            </Text>
          </View>
        ) : null}

        {note ? (
          <View className="rounded-2xl" style={{ marginHorizontal: 20, marginTop: 14, padding: 12, backgroundColor: 'rgba(255,107,154,0.12)' }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.coral, textAlign: 'center' }}>{note}</Text>
          </View>
        ) : null}

        {COVER_SECTIONS.map((section) => (
          <View key={section.title} style={{ marginTop: 22 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.4, color: COLORS.ink3, paddingHorizontal: 20 }}>
              {section.title.toUpperCase()}
            </Text>
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 12, gap: 12 }}>
              {section.covers.map((cover) => {
                const locked = lockReason(cover, stats.countriesDiscovered, level.level);
                const selected = icons != null && current === cover.name;
                return (
                  <Pressable
                    key={cover.title}
                    accessibilityRole="button"
                    accessibilityLabel={locked ? `${cover.title}, locked — ${locked}` : `Use the ${cover.title} cover`}
                    accessibilityState={{ selected }}
                    onPress={() => pick(cover)}
                    style={{ width: cell, opacity: busy ? 0.7 : 1 }}
                  >
                    <View style={{ borderRadius: 26, padding: 3, borderWidth: 2.5, borderColor: selected ? COLORS.coral : 'transparent' }}>
                      <View style={{ borderRadius: 22, overflow: 'hidden' }}>
                        <Image source={cover.preview} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />
                        {locked ? (
                          <View className="items-center justify-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,12,20,0.55)' }}>
                            <Lock size={20} color="#fff" />
                          </View>
                        ) : null}
                      </View>
                      {selected ? (
                        <View className="items-center justify-center rounded-full" style={{ position: 'absolute', top: -4, right: -4, height: 24, width: 24, backgroundColor: COLORS.coral, borderWidth: 2, borderColor: '#fff' }}>
                          <Check size={13} color="#fff" strokeWidth={3} />
                        </View>
                      ) : null}
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: COLORS.navy, textAlign: 'center', marginTop: 6 }}>{cover.title}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, color: COLORS.ink3, textAlign: 'center', marginTop: 1 }}>
                      {locked ?? cover.tagline}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, textAlign: 'center', marginTop: 26, paddingHorizontal: 32, lineHeight: 17 }}>
          Earn special covers as you travel, explore and achieve milestones.
        </Text>
      </ScrollView>
    </View>
  );
}
