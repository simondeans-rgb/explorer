import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Gem, Heart, Meh, ThumbsDown, ThumbsUp, Users, MapPin } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { PageHero } from '../../components/PageHero';
import { goBack } from '../../src/lib/nav';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { buildCityGuides } from '../../src/lib/cityGuides';
import { DetailSkeleton } from '../../components/DetailSkeleton';
import { DISCOVERY_CATEGORY_META, VERDICT_META, type RecommendationVerdict } from '../../src/types';
import { useData } from '../../src/store/data';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';

const VERDICT_STYLE: Record<RecommendationVerdict, { tint: string; icon: ComponentType<{ size?: number; color?: string }> }> = {
  recommend: { tint: '#00A88E', icon: ThumbsUp },
  'hidden-gem': { tint: '#F5A623', icon: Gem },
  'worth-visiting': { tint: '#1E6BFF', icon: Heart },
  overrated: { tint: '#FF8A3D', icon: Meh },
  avoid: { tint: COLORS.danger, icon: ThumbsDown },
};

/** One city's trusted guide: every place you or your circle rated there,
 *  strongest verdicts first. */
export default function GuideScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { discoveries, loaded } = useData();
  const { user } = useAuth();
  const myName = user?.displayName?.split(' ')[0] || 'You';
  const { friends, friendsData } = useFriends(user?.uid, myName);

  const guide = useMemo(
    () => buildCityGuides(discoveries, friendsData.discoveries, friends).find((g) => g.key === key),
    [discoveries, friendsData.discoveries, friends, key],
  );

  if (!guide && !loaded) return <DetailSkeleton />;
  if (!guide) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>No guide here yet</Text>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, textAlign: 'center', marginTop: 8 }}>
          Leave a verdict somewhere in this city and it starts one.
        </Text>
        <Pressable accessibilityRole="button" onPress={goBack} style={{ marginTop: 14 }}>
          <Text style={{ fontFamily: 'PlusJakarta', color: COLORS.coral, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const others = guide.contributors.filter((c) => c !== 'You');
  const subtitle =
    others.length === 0
      ? `${guide.entries.length} place${guide.entries.length === 1 ? '' : 's'} you've rated`
      : `${guide.entries.length} place${guide.entries.length === 1 ? '' : 's'} from ${['you', ...others].slice(0, 3).join(', ')}${others.length > 2 ? ' & more' : ''}`;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <PageHero
          eyebrow={`${flagEmoji(guide.countryCode)} ${guide.countryName.toUpperCase()}`}
          title={others.length ? `Your circle's ${guide.city}` : `Your ${guide.city}`}
          subtitle={subtitle}
          gradient={GRADIENTS.explore}
          imageCode={guide.countryCode}
          onBack={goBack}
        />

        {guide.gems > 0 ? (
          <View className="flex-row items-center rounded-2xl" style={{ marginHorizontal: 20, marginTop: 14, paddingHorizontal: 14, paddingVertical: 11, gap: 9, backgroundColor: 'rgba(245,166,35,0.10)' }}>
            <Gem size={16} color="#F5A623" />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink2 }}>
              {guide.gems} hidden gem{guide.gems === 1 ? '' : 's'} in this guide
            </Text>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {guide.entries.map(({ discovery: d, by, mine }) => {
            const vs = d.verdict ? VERDICT_STYLE[d.verdict] : undefined;
            const Icon = vs?.icon ?? MapPin;
            return (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                accessibilityLabel={`${d.name}${d.verdict ? `, ${VERDICT_META[d.verdict].label}` : ''}, by ${by}`}
                onPress={() => (mine ? router.push(`/discovery/${d.id}`) : undefined)}
                className="bg-white dark:bg-card rounded-2xl"
                style={{ padding: 14 }}
              >
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View className="rounded-full items-center justify-center" style={{ height: 38, width: 38, backgroundColor: (vs?.tint ?? COLORS.ink3) + '1A' }}>
                    <Icon size={18} color={vs?.tint ?? COLORS.ink3} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 15.5, fontWeight: '700', color: COLORS.navy }}>{d.name}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
                      {DISCOVERY_CATEGORY_META[d.category].label}
                      {d.verdict ? ` · ${VERDICT_META[d.verdict].label}` : ''}
                    </Text>
                  </View>
                  <View className="rounded-full" style={{ backgroundColor: mine ? 'rgba(255,107,154,0.10)' : 'rgba(30,107,255,0.08)', paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: mine ? COLORS.coral : '#1E6BFF' }}>{by}</Text>
                  </View>
                </View>
                {d.note ? (
                  <Text numberOfLines={3} style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, marginTop: 9, lineHeight: 19 }}>
                    “{d.note}”
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row items-center justify-center" style={{ gap: 6, marginTop: 18 }}>
          <Users size={13} color={COLORS.ink3} />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
            Verdicts from you and your circle build this guide.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
