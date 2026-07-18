import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Lock, Sparkles } from 'lucide-react-native';
import { BackButton } from '../components/BackButton';
import { COLORS } from '../src/lib/theme';
import { goBack } from '../src/lib/nav';
import { useWorldly } from '../src/hooks/useWorldly';
import { getCoverState, applyCover, lockReason, lockProgress, seasonActive, COVER_SECTIONS, type CoverDef, type CoverState } from '../src/lib/covers';
import { billingEnabled } from '../src/lib/billing';
import { COVER_PRICE_PACK } from '../src/lib/limits';
import { track } from '../src/lib/analytics';
import { COVER_THEMES } from '../src/lib/coverThemes.gen';
import { CoverParticles } from '../components/CoverParticles';

/** Passport Covers — pick an alternate app icon. On binaries without the
 *  native module the grid is a read-only preview with an "arriving soon" note.
 *  All native access is async and off the render path. */
export default function CoversScreen() {
  const { width } = useWindowDimensions();
  const { stats, level } = useWorldly();
  const [state, setState] = useState<CoverState | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCoverState().then((s) => {
      if (mounted) setState(s);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const available = state != null;
  const current = state?.current ?? null;
  const cell = (width - 40 - 24) / 3;
  // The active cover themes this screen: header gradient + ambient particles.
  const theme = COVER_THEMES[current ?? 'Classic'] ?? COVER_THEMES.Classic;
  const HEADER_H = 148;

  const month = new Date().getMonth() + 1;

  async function pick(cover: CoverDef, inSeason: boolean) {
    if (busy) return;
    const locked = lockReason(cover, stats.countriesDiscovered, level.level);
    if (locked) {
      setNote(`${cover.title} is still locked — ${locked.toLowerCase()}.`);
      return;
    }
    // Out-of-season packs stay switchable while billing is dormant (a live
    // preview); once billing goes live they wait for their season.
    if (!inSeason && billingEnabled()) {
      setNote(`${cover.title} is out of season — it comes back later in the year.`);
      return;
    }
    if (!available) {
      setNote('Passport Covers arrive with the next app update — this is a preview.');
      return;
    }
    if (cover.name === current) return;
    setBusy(true);
    try {
      await applyCover(cover.name);
      setState({ current: cover.name });
      setNote(null);
      track('cover_changed', { cover: cover.name ?? 'classic' });
    } catch {
      // Most common cause: a newly added cover on a binary whose icon
      // catalog predates it.
      setNote(`${cover.title} isn't in this version yet — it arrives with the next app update.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: 26, paddingHorizontal: 22, minHeight: HEADER_H, overflow: 'hidden' }}>
          <CoverParticles profile={theme.particles} colors={theme.particleColors} width={width} height={HEADER_H + 40} />
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 58, left: 18, zIndex: 20 }} />
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.9, textAlign: 'center' }}>EXPRESS YOUR STYLE</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, textAlign: 'center', marginTop: 2 }}>Passport Covers</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, textAlign: 'center', marginTop: 4 }}>
            Choose a cover to make Worldly your own — same trusted app, a look that reflects you.
          </Text>
        </LinearGradient>

        {!available ? (
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

        {COVER_SECTIONS.map((section) => {
          const inSeason = seasonActive(section.season, month);
          return (
          <View key={section.title} style={{ marginTop: 26 }}>
            <View className="flex-row items-center" style={{ paddingHorizontal: 20, gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, flexShrink: 1 }}>{section.title}</Text>
              {!inSeason && section.season ? (
                <View className="rounded-full" style={{ paddingHorizontal: 9, paddingVertical: 3, backgroundColor: 'rgba(255,184,77,0.22)' }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, color: '#8A5A00' }}>{section.season.returns.toUpperCase()}</Text>
                </View>
              ) : null}
              {billingEnabled() && section.access === 'explorer' && section.season ? (
                <View className="rounded-full" style={{ paddingHorizontal: 9, paddingVertical: 3, backgroundColor: 'rgba(91,108,255,0.14)' }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, color: '#3D4CC9' }}>PACK {COVER_PRICE_PACK} · FREE WITH EXPLORER</Text>
                </View>
              ) : null}
            </View>
            {section.tagline ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 2 }}>{section.tagline}</Text>
            ) : null}
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 14, gap: 12, opacity: inSeason ? 1 : 0.5 }}>
              {section.covers.map((cover) => {
                const locked = lockReason(cover, stats.countriesDiscovered, level.level);
                const progress = lockProgress(cover, stats.countriesDiscovered, level.level);
                const selected = available && current === cover.name;
                return (
                  <Pressable
                    key={cover.title}
                    accessibilityRole="button"
                    accessibilityLabel={locked ? `${cover.title}, locked — ${locked}` : `Use the ${cover.title} cover`}
                    accessibilityState={{ selected }}
                    onPress={() => pick(cover, inSeason)}
                    style={{ width: cell, opacity: busy ? 0.7 : 1 }}
                  >
                    <View style={{ borderRadius: 28, padding: 3, borderWidth: 2.5, borderColor: selected ? theme.accent : 'transparent', backgroundColor: selected ? `${theme.accent}14` : 'transparent', shadowColor: '#14213D', shadowOpacity: selected ? 0.22 : 0.1, shadowRadius: selected ? 12 : 8, shadowOffset: { width: 0, height: 5 } }}>
                      <View style={{ borderRadius: 24, overflow: 'hidden' }}>
                        <Image source={cover.preview} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />
                        {locked ? (
                          <View className="items-center justify-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,12,20,0.58)' }}>
                            <View className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }}>
                              <Lock size={16} color="#fff" />
                            </View>
                            <View className="rounded-full" style={{ position: 'absolute', bottom: 7, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(255,184,77,0.95)' }}>
                              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 8.5, fontWeight: '800', letterSpacing: 0.4, color: '#5C3A00' }}>
                                {cover.unlock?.level ? `LEVEL ${cover.unlock.level}` : `${cover.unlock?.countries} COUNTRIES`}
                              </Text>
                            </View>
                          </View>
                        ) : null}
                        {!locked && cover.isNew && !selected ? (
                          <View className="rounded-full" style={{ position: 'absolute', top: 7, left: 7, paddingHorizontal: 7, paddingVertical: 2.5, backgroundColor: COLORS.coral }}>
                            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 8.5, fontWeight: '800', letterSpacing: 0.6, color: '#fff' }}>NEW</Text>
                          </View>
                        ) : null}
                      </View>
                      {selected ? (
                        <View className="items-center justify-center rounded-full" style={{ position: 'absolute', top: -5, right: -5, height: 26, width: 26, backgroundColor: theme.accent, borderWidth: 2, borderColor: '#fff' }}>
                          <Check size={14} color="#fff" strokeWidth={3} />
                        </View>
                      ) : null}
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: COLORS.navy, textAlign: 'center', marginTop: 7 }}>{cover.title}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, color: locked ? '#B8860B' : COLORS.ink3, textAlign: 'center', marginTop: 1 }}>
                      {progress ?? cover.tagline}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          );
        })}

        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, textAlign: 'center', marginTop: 26, paddingHorizontal: 32, lineHeight: 17 }}>
          Earn special covers as you travel, explore and achieve milestones. New packs arrive through the year.
        </Text>
      </ScrollView>
    </View>
  );
}
