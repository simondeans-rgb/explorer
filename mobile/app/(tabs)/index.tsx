import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Bell, Plus, Search, Camera } from 'lucide-react-native';
import { WorldlyMark } from '../../components/Brand';
import { AddPlaceSheet } from '../../components/AddPlaceSheet';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useData } from '../../src/store/data';
import { useAuth } from '../../src/store/auth';

export default function StoryScreen() {
  const { aggregates, stats, level } = useWorldly();
  const { captures, removeCapture } = useData();
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Alex');
  const discovered = aggregates.filter((a) => a.discovered);
  const [addOpen, setAddOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  function confirmRemoveCapture(id: string) {
    Alert.alert('Remove memory?', 'This photo will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeCapture(id) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero */}
      <LinearGradient colors={GRADIENTS.sunrise} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'relative', paddingTop: 64, paddingBottom: 64, paddingHorizontal: 20 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <WorldlyMark size={28} />
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22 }}>worldly</Text>
          </View>
          <View className="h-10 w-10 rounded-full items-center justify-center bg-white/20">
            <Bell size={18} color="#fff" />
          </View>
        </View>

        <View style={{ marginTop: 56 }}>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.9 }}>Hi {firstName},</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 38, lineHeight: 40, marginTop: 6 }}>Where will your next story take you?</Text>
          <View className="flex-row items-center bg-white rounded-full" style={{ marginTop: 20, paddingHorizontal: 18, paddingVertical: 14, gap: 10 }}>
            <Search size={18} color={COLORS.coral} />
            <Text style={{ color: COLORS.ink2, fontFamily: 'PlusJakarta', fontSize: 15 }}>Search places, food & journeys…</Text>
          </View>
        </View>

        <Svg width="100%" height={48} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <Path d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
        </Svg>
      </LinearGradient>

      {/* Milestone */}
      <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 26, padding: 20 }}>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.85 }}>EXPLORER LEVEL {level.level}</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 40, marginTop: 2 }}>{level.title}</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            {stats.countriesDiscovered} countries · {stats.continentsDiscovered} continents · {level.xp.toLocaleString()} XP
          </Text>
        </LinearGradient>
      </View>

      {/* Your world rail */}
      <View style={{ paddingTop: 18 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, paddingHorizontal: 20 }}>Your world</Text>
        {discovered.length === 0 ? (
          <Pressable onPress={() => setAddOpen(true)} className="bg-white rounded-3xl items-center" style={{ marginHorizontal: 20, marginTop: 12, paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 40 }}>🌍</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 8 }}>Start your map</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              Add the first country you've been to and watch your world fill in.
            </Text>
            <View className="rounded-full" style={{ marginTop: 14, backgroundColor: COLORS.coral, paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Add a country</Text>
            </View>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
            {discovered.map((a) => (
              <Pressable key={a.code} onPress={() => router.push(`/country/${a.code}`)} style={{ width: 132 }}>
                <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 168, borderRadius: 26, padding: 14, justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 34, position: 'absolute', top: 12, left: 12 }}>{flagEmoji(a.code)}</Text>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 18 }}>{countryName(a.code)}</Text>
                  {a.cities.length > 0 ? (
                    <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.85, marginTop: 2 }}>{a.cities.length} cities</Text>
                  ) : null}
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Memories */}
      <View style={{ paddingTop: 6 }}>
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Memories</Text>
          <Pressable onPress={() => setPhotoOpen(true)} hitSlop={8} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
            <Camera size={14} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>Add</Text>
          </Pressable>
        </View>
        {captures.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
            {captures.map((c) => (
              <Pressable key={c.id} onLongPress={() => confirmRemoveCapture(c.id)} style={{ width: 168 }}>
                <View style={{ borderRadius: 22, overflow: 'hidden' }}>
                  <Image source={{ uri: c.dataUrl }} style={{ width: 168, height: 210 }} contentFit="cover" transition={200} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, justifyContent: 'flex-end', padding: 12 }}>
                    {c.caption ? (
                      <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600' }}>{c.caption}</Text>
                    ) : null}
                    {c.countryCode ? (
                      <Text style={{ fontSize: 14, marginTop: 2 }}>{flagEmoji(c.countryCode)} <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.9 }}>{c.city ?? countryName(c.countryCode)}</Text></Text>
                    ) : null}
                  </LinearGradient>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Pressable onPress={() => setPhotoOpen(true)} className="items-center justify-center bg-white rounded-3xl" style={{ marginHorizontal: 20, marginTop: 12, paddingVertical: 30, gap: 8 }}>
            <Camera size={26} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>Add your first photo</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>

      {/* Floating add button */}
      <Pressable
        onPress={() => setAddOpen(true)}
        className="absolute items-center justify-center rounded-full"
        style={{ right: 20, bottom: 28, height: 60, width: 60, backgroundColor: COLORS.coral, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}
      >
        <Plus size={28} color="#fff" strokeWidth={2.6} />
      </Pressable>

      <AddPlaceSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <AddPhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} />
    </View>
  );
}
