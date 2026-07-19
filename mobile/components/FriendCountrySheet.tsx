import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { X, MapPin, Camera, Compass, ChevronRight } from 'lucide-react-native';
import { DestinationImage } from './DestinationImage';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import { VERDICT_META, type Capture, type Discovery, type RecommendationVerdict } from '../src/types';

const VERDICT_TINT: Partial<Record<RecommendationVerdict, string>> = {
  recommend: COLORS.coral,
  'hidden-gem': '#B5731A',
  'worth-visiting': COLORS.lavender,
  overrated: COLORS.ink3,
  avoid: COLORS.ink3,
};

/** A friend's saved photos + discoveries for one country — opened from the
 *  country carousel on their profile. The whole point of the Circle: their
 *  first-hand, trusted picks for a place, not anonymous reviews. */
export function FriendCountrySheet({
  visible,
  onClose,
  friendName,
  code,
  photos,
  discoveries,
}: {
  visible: boolean;
  onClose: () => void;
  friendName: string;
  code: string | null;
  photos: Capture[];
  discoveries: Discovery[];
}) {
  const cc = code ?? '';
  const first = friendName.split(' ')[0] || friendName;
  const empty = photos.length === 0 && discoveries.length === 0;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(14,16,24,0.5)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View className="bg-white dark:bg-card" style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', maxHeight: '86%' }}>
          {/* Country hero */}
          <View style={{ height: 148 }}>
            <DestinationImage code={cc || 'WW'} scrim style={StyleSheet.absoluteFill}>
              <View style={{ flex: 1, justifyContent: 'flex-end', padding: 18 }}>
                <Text style={{ fontSize: 30 }}>{flagEmoji(cc)}</Text>
                <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 25, marginTop: 2 }} numberOfLines={1}>{countryName(cc) || cc}</Text>
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, opacity: 0.92, marginTop: 1 }}>{first}'s photos & places</Text>
              </View>
            </DestinationImage>
            <Pressable onPress={onClose} hitSlop={10} className="rounded-full items-center justify-center" style={{ position: 'absolute', top: 14, right: 14, height: 34, width: 34, backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <X size={18} color="#fff" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
            {photos.length > 0 ? (
              <View style={{ marginBottom: discoveries.length > 0 ? 20 : 6 }}>
                <View className="flex-row items-center" style={{ gap: 6, marginBottom: 10 }}>
                  <Camera size={15} color={COLORS.coral} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3 }}>{first.toUpperCase()}'S PHOTOS</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {photos.map((p) => (
                    <View key={p.id} style={{ borderRadius: 18, overflow: 'hidden' }}>
                      <Image source={{ uri: p.dataUrl }} style={{ width: 128, height: 168 }} contentFit="cover" transition={200} />
                      {p.caption ? (
                        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'rgba(20,33,61,0.55)' }}>
                          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '600' }} numberOfLines={2}>{p.caption}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {discoveries.length > 0 ? (
              <View>
                <View className="flex-row items-center" style={{ gap: 6, marginBottom: 10 }}>
                  <Compass size={15} color={COLORS.lavender} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3 }}>PLACES {first.toUpperCase()} SAVED</Text>
                </View>
                <View style={{ gap: 10 }}>
                  {discoveries.map((d) => {
                    const tint = (d.verdict && VERDICT_TINT[d.verdict]) || COLORS.coral;
                    const where = [d.city, d.countryCode ? countryName(d.countryCode) : null].filter(Boolean).join(', ');
                    return (
                      <View key={d.id} className="rounded-3xl" style={{ padding: 14, backgroundColor: COLORS.warmwhite }}>
                        {d.verdict ? (
                          <View className="rounded-full" style={{ alignSelf: 'flex-start', backgroundColor: `${tint}1F`, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 }}>
                            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 0.3, color: tint }}>{VERDICT_META[d.verdict].label}</Text>
                          </View>
                        ) : null}
                        <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }} numberOfLines={1}>{d.name}</Text>
                        {where ? (
                          <View className="flex-row items-center" style={{ gap: 4, marginTop: 2 }}>
                            <MapPin size={12} color={COLORS.ink3} />
                            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3 }} numberOfLines={1}>{where}</Text>
                          </View>
                        ) : null}
                        {d.note ? (
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, marginTop: 6, lineHeight: 18 }} numberOfLines={3}>"{d.note}"</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {empty ? (
              <View className="items-center" style={{ paddingVertical: 26, paddingHorizontal: 20 }}>
                <View className="rounded-full items-center justify-center" style={{ height: 58, width: 58, backgroundColor: 'rgba(155,124,255,0.14)' }}>
                  <MapPin size={24} color={COLORS.lavender} />
                </View>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 12, textAlign: 'center' }}>Nothing saved here yet</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, color: COLORS.ink3, marginTop: 4, textAlign: 'center', lineHeight: 19 }}>
                  {first} has been to {countryName(cc) || 'this country'} but hasn't saved photos or places here.
                </Text>
              </View>
            ) : null}

            {/* Jump to the full country page (guides, facts, your own notes). */}
            <Pressable
              onPress={() => { onClose(); router.push(`/country/${cc}`); }}
              className="flex-row items-center justify-center rounded-full"
              style={{ marginTop: 18, paddingVertical: 13, gap: 6, backgroundColor: 'rgba(20,33,61,0.06)' }}
            >
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy }}>Explore {countryName(cc) || 'country'}</Text>
              <ChevronRight size={16} color={COLORS.navy} />
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
