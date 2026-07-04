import { Modal, View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Users, MapPin } from 'lucide-react-native';
import { DestinationImage } from './DestinationImage';
import { COLORS } from '../src/lib/theme';
import { VERDICT_META, type RecommendationVerdict } from '../src/types';
import { useLandmarkInfo } from '../src/lib/landmarkInfo';

export interface LandmarkPerson {
  name: string;
  verdict?: RecommendationVerdict;
  note?: string;
}

/** A verdict pill in the brand coral. */
function VerdictPill({ verdict }: { verdict: RecommendationVerdict }) {
  return (
    <View className="rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '700', color: COLORS.coral }}>{VERDICT_META[verdict].label}</Text>
    </View>
  );
}

/**
 * A reusable detail screen for a place — a popular landmark, a friend's
 * recommendation, or both. Shows a hero photo (the user's / a friend's own
 * photo, else a free-to-reuse Wikipedia image, else the country's stock photo),
 * the landmark's one-sentence description from Wikipedia, and any saved info
 * from you or your friends.
 */
export function LandmarkDetailSheet({
  visible,
  onClose,
  name,
  countryCode,
  placeLabel,
  hint,
  photo,
  own,
  friends = [],
}: {
  visible: boolean;
  onClose: () => void;
  name?: string;
  countryCode?: string;
  /** A subtitle line, e.g. "Tokyo · Japan". */
  placeLabel?: string;
  /** Country name, used to disambiguate the Wikipedia lookup. */
  hint?: string;
  /** The user's or a friend's own photo — takes priority over the stock image. */
  photo?: string;
  /** The current user's own saved info, when they've recorded this place. */
  own?: { verdict?: RecommendationVerdict; note?: string } | null;
  /** Friends who saved this place. */
  friends?: LandmarkPerson[];
}) {
  const info = useLandmarkInfo(name, visible, hint);
  const heroUri = photo ?? info?.image ?? undefined;
  const loading = info === undefined;
  const description = info?.description;
  const usedWikipedia = !photo && (!!info?.image || !!description);
  const hasFriends = friends.length > 0;
  const hasOwn = !!(own && (own.note || own.verdict));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(14,16,24,0.5)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View className="bg-white dark:bg-card" style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', maxHeight: '88%' }}>
          {/* Hero */}
          <View style={{ height: 230 }}>
            <DestinationImage code={countryCode ?? 'WW'} scrim={!heroUri} style={StyleSheet.absoluteFill}>
              {null}
            </DestinationImage>
            {heroUri ? (
              <>
                <Image source={{ uri: heroUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={260} cachePolicy="memory-disk" />
                <LinearGradient colors={['rgba(20,33,61,0)', 'rgba(20,33,61,0.18)', 'rgba(20,33,61,0.78)']} locations={[0.25, 0.6, 1]} style={StyleSheet.absoluteFill} />
              </>
            ) : null}
            <Pressable onPress={onClose} hitSlop={10} className="rounded-full items-center justify-center" style={{ position: 'absolute', top: 14, right: 14, height: 34, width: 34, backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <X size={18} color="#fff" />
            </Pressable>
            <View style={{ position: 'absolute', left: 20, right: 20, bottom: 16 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 28, color: '#fff' }}>{name}</Text>
              {placeLabel ? (
                <View className="flex-row items-center" style={{ gap: 5, marginTop: 3 }}>
                  <MapPin size={13} color="rgba(255,255,255,0.92)" />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>{placeLabel}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 34 }}>
            {/* One-sentence description from Wikipedia */}
            {loading ? (
              <View className="flex-row items-center" style={{ gap: 8, paddingVertical: 4 }}>
                <ActivityIndicator color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>Looking it up…</Text>
              </View>
            ) : description ? (
              <Text style={{ fontFamily: 'Fraunces', fontSize: 16.5, lineHeight: 24, color: COLORS.ink2 }}>{description}</Text>
            ) : (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, lineHeight: 21, color: COLORS.ink3 }}>A place worth seeing.</Text>
            )}
            {usedWikipedia ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginTop: 8 }}>via Wikipedia</Text>
            ) : null}

            {/* Your saved info */}
            {hasOwn ? (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginBottom: 8 }}>YOUR NOTE</Text>
                {own?.verdict ? <View className="flex-row" style={{ marginBottom: own?.note ? 8 : 0 }}><VerdictPill verdict={own.verdict} /></View> : null}
                {own?.note ? (
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 15, fontStyle: 'italic', color: COLORS.ink2, lineHeight: 22, borderLeftWidth: 2, borderLeftColor: 'rgba(255,107,154,0.5)', paddingLeft: 12 }}>“{own.note}”</Text>
                ) : null}
              </View>
            ) : null}

            {/* Friends' saved info */}
            {hasFriends ? (
              <View style={{ marginTop: 20 }}>
                <View className="flex-row items-center" style={{ gap: 6, marginBottom: 10 }}>
                  <Users size={14} color={COLORS.lavender} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3 }}>
                    {friends.length === 1 ? 'FROM YOUR FRIEND' : 'FROM YOUR FRIENDS'}
                  </Text>
                </View>
                <View style={{ gap: 12 }}>
                  {friends.map((f, i) => (
                    <View key={`${f.name}-${i}`} className="bg-white dark:bg-card rounded-2xl" style={{ padding: 13, backgroundColor: 'rgba(155,124,255,0.07)' }}>
                      <View className="flex-row items-center" style={{ gap: 10 }}>
                        <View className="rounded-full items-center justify-center" style={{ height: 32, width: 32, backgroundColor: 'rgba(155,124,255,0.18)' }}>
                          <Text style={{ fontFamily: 'Fraunces', fontSize: 14, color: COLORS.lavender }}>{f.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14.5, fontWeight: '700', color: COLORS.navy }}>{f.name}</Text>
                        {f.verdict ? <VerdictPill verdict={f.verdict} /> : null}
                      </View>
                      {f.note ? (
                        <Text style={{ fontFamily: 'Fraunces', fontSize: 14.5, fontStyle: 'italic', color: COLORS.ink2, lineHeight: 21, marginTop: 9 }}>“{f.note}”</Text>
                      ) : (
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 7 }}>Recommended this — no note left.</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
