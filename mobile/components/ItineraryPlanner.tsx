import { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X, GripVertical, Sparkles } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import {
  ITINERARY_SLOTS,
  DISCOVERY_CATEGORY_META,
  subcategoryLabel,
  type ItineraryItem,
  type ItinerarySlot,
  type DiscoveryCategory,
  type RecommendationVerdict,
} from '../src/types';

export interface Suggestion {
  id: string;
  name: string;
  city?: string;
  category?: DiscoveryCategory;
  subcategory?: string;
  verdict?: RecommendationVerdict;
  /** Set when this came from a friend's discovery. */
  friend?: string;
  note?: string;
  /** Set for a popular landmark suggestion. */
  landmark?: boolean;
}

type Rect = { x: number; y: number; w: number; h: number };
type DropKey = `slot:${ItinerarySlot}` | 'ideas';

const metaLine = (i: { city?: string; category?: DiscoveryCategory; subcategory?: string; fromFriend?: string }) =>
  [i.city, i.category ? (subcategoryLabel(i.category, i.subcategory) ?? DISCOVERY_CATEGORY_META[i.category].label) : null, i.fromFriend ? `from ${i.fromFriend}` : null]
    .filter(Boolean)
    .join(' · ');

/** A draggable card. Long-press to pick up, drag onto a slot or the ideas tray. */
function DragCard({
  width,
  onLift,
  onMove,
  onDrop,
  onPress,
  children,
}: {
  width?: number;
  onLift: () => void;
  onMove: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lifted = useSharedValue(0);

  const pan = Gesture.Pan()
    .activateAfterLongPress(160)
    .onStart(() => {
      lifted.value = withSpring(1, { damping: 18 });
      runOnJS(onLift)();
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
      runOnJS(onMove)(e.absoluteX, e.absoluteY);
    })
    .onEnd((e) => {
      runOnJS(onDrop)(e.absoluteX, e.absoluteY);
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      lifted.value = withSpring(0);
    });
  const tap = Gesture.Tap().onEnd(() => runOnJS(onPress)());

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: 1 + lifted.value * 0.04 }],
    zIndex: lifted.value > 0 ? 1000 : 0,
    shadowColor: '#000',
    shadowOpacity: lifted.value * 0.22,
    shadowRadius: lifted.value * 12,
    shadowOffset: { width: 0, height: lifted.value * 6 },
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View style={[{ width }, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}

export function ItineraryPlanner({
  startDate,
  dayCount,
  itinerary,
  suggestions,
  onReorder,
  onAddSuggestion,
  onRemoveItem,
  onOpenItem,
  onOpenSuggestion,
}: {
  startDate?: string;
  dayCount: number;
  itinerary: ItineraryItem[];
  suggestions: Suggestion[];
  onReorder: (items: ItineraryItem[]) => void;
  onAddSuggestion: (s: Suggestion, day: number | undefined, slot: ItinerarySlot | undefined) => void;
  onRemoveItem: (id: string) => void;
  onOpenItem: (i: ItineraryItem) => void;
  onOpenSuggestion: (s: Suggestion) => void;
}) {
  const [day, setDay] = useState(1);
  const [hover, setHover] = useState<DropKey | null>(null);

  const zoneRefs = useRef<Partial<Record<DropKey, View | null>>>({});
  const rects = useRef<Partial<Record<DropKey, Rect>>>({});
  const cardRefs = useRef<Record<string, View | null>>({});
  const cardRects = useRef<Record<string, Rect>>({});

  const measure = () => {
    (Object.keys(zoneRefs.current) as DropKey[]).forEach((k) => {
      zoneRefs.current[k]?.measureInWindow((x, y, w, h) => { rects.current[k] = { x, y, w, h }; });
    });
    cardRects.current = {};
    Object.keys(cardRefs.current).forEach((id) => {
      cardRefs.current[id]?.measureInWindow((x, y, w, h) => { cardRects.current[id] = { x, y, w, h }; });
    });
  };

  // Move an existing item to a (day, slot) inserting at the drop position so
  // items can be re-ordered within the same time window.
  const moveItem = (item: ItineraryItem, targetDay: number | undefined, targetSlot: ItinerarySlot | undefined, dropY: number) => {
    const without = itinerary.filter((i) => i.id !== item.id);
    const moved: ItineraryItem = { ...item };
    delete moved.day;
    delete moved.slot;
    if (targetDay !== undefined && targetSlot) {
      moved.day = targetDay;
      moved.slot = targetSlot;
      const slotItems = without.filter((i) => i.day === targetDay && (i.slot ?? 'allday') === targetSlot);
      let beforeId: string | undefined;
      for (const si of slotItems) {
        const r = cardRects.current[si.id];
        if (r && dropY < r.y + r.h / 2) { beforeId = si.id; break; }
      }
      let at: number;
      if (beforeId) at = without.findIndex((i) => i.id === beforeId);
      else if (slotItems.length) at = without.findIndex((i) => i.id === slotItems[slotItems.length - 1].id) + 1;
      else at = without.length;
      const next = [...without];
      next.splice(at, 0, moved);
      onReorder(next);
    } else {
      // back to ideas (unscheduled) — drop at the end
      onReorder([...without, moved]);
    }
  };
  const zoneAt = (x: number, y: number): DropKey | null => {
    for (const k of Object.keys(rects.current) as DropKey[]) {
      const r = rects.current[k];
      if (r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return k;
    }
    return null;
  };
  const setHoverIf = (x: number, y: number) => {
    const k = zoneAt(x, y);
    setHover((prev) => (prev === k ? prev : k));
  };

  const dayLabel = (n: number) => {
    if (!startDate) return `Day ${n}`;
    const d = new Date(startDate);
    d.setDate(d.getDate() + (n - 1));
    return `${d.toLocaleDateString(undefined, { weekday: 'short' })} ${d.getDate()}`;
  };

  const ideas = itinerary.filter((i) => !i.day);

  // The card chrome shared by items + suggestions.
  const Chrome = ({ title, meta, onRemove, sugg }: { title: string; meta: string; onRemove?: () => void; sugg?: boolean }) => (
    <View className="bg-white rounded-2xl flex-row items-center" style={{ padding: 11, gap: 8, borderWidth: sugg ? 1 : 0, borderColor: 'rgba(155,124,255,0.3)' }}>
      <GripVertical size={16} color={COLORS.ink3} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '600', color: COLORS.navy }}>{title}</Text>
        {meta ? <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: sugg ? COLORS.lavender : COLORS.ink3, marginTop: 1 }}>{meta}</Text> : null}
      </View>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}><X size={16} color={COLORS.ink3} /></Pressable>
      ) : null}
    </View>
  );

  return (
    <View>
      {/* day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {Array.from({ length: dayCount }, (_, i) => i + 1).map((n) => {
          const active = day === n;
          return (
            <Pressable key={n} onPress={() => setDay(n)} className="rounded-2xl items-center" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navy : '#fff' }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: active ? 'rgba(255,255,255,0.7)' : COLORS.ink3 }}>DAY {n}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: active ? '#fff' : COLORS.navy }}>{dayLabel(n)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* slots for the selected day */}
      <View style={{ gap: 10, marginTop: 12 }}>
        {ITINERARY_SLOTS.map((s) => {
          const key: DropKey = `slot:${s.id}`;
          const items = itinerary.filter((i) => i.day === day && (i.slot ?? 'allday') === s.id);
          const hot = hover === key;
          return (
            <View
              key={s.id}
              ref={(r) => { zoneRefs.current[key] = r; }}
              collapsable={false}
              style={{ backgroundColor: hot ? 'rgba(255,107,154,0.10)' : 'rgba(20,33,61,0.03)', borderRadius: 18, padding: 10, borderWidth: 1.5, borderColor: hot ? COLORS.coral : 'transparent' }}
            >
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginBottom: items.length ? 8 : 0, paddingHorizontal: 2 }}>{s.label.toUpperCase()}</Text>
              <View style={{ gap: 8 }}>
                {items.map((it) => (
                  <View key={it.id} ref={(r) => { cardRefs.current[it.id] = r; }} collapsable={false}>
                    <DragCard
                      onLift={measure}
                      onMove={setHoverIf}
                      onPress={() => onOpenItem(it)}
                      onDrop={(x, y) => {
                        setHover(null);
                        const k = zoneAt(x, y);
                        if (!k) return;
                        if (k === 'ideas') moveItem(it, undefined, undefined, y);
                        else moveItem(it, day, k.slice(5) as ItinerarySlot, y);
                      }}
                    >
                      <Chrome title={it.name} meta={metaLine(it)} onRemove={() => onRemoveItem(it.id)} />
                    </DragCard>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>

      {/* ideas tray */}
      <View
        ref={(r) => { zoneRefs.current['ideas'] = r; }}
        collapsable={false}
        style={{ marginTop: 16, backgroundColor: hover === 'ideas' ? 'rgba(155,124,255,0.10)' : '#fff', borderRadius: 20, padding: 12, borderWidth: 1.5, borderColor: hover === 'ideas' ? COLORS.lavender : 'rgba(20,33,61,0.05)' }}
      >
        <View className="flex-row items-center" style={{ gap: 6, marginBottom: 10 }}>
          <Sparkles size={15} color={COLORS.lavender} />
          <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>Ideas & friends' picks</Text>
        </View>
        {ideas.length === 0 && suggestions.length === 0 ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, lineHeight: 17 }}>Add places with the + above, or your friends' recommendations for this country will appear here. Long-press a card and drag it onto a day.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {ideas.map((it) => (
              <View key={it.id} ref={(r) => { cardRefs.current[it.id] = r; }} collapsable={false}>
                <DragCard
                  onLift={measure}
                  onMove={setHoverIf}
                  onPress={() => onOpenItem(it)}
                  onDrop={(x, y) => {
                    setHover(null);
                    const k = zoneAt(x, y);
                    if (k && k !== 'ideas') moveItem(it, day, k.slice(5) as ItinerarySlot, y);
                  }}
                >
                  <Chrome title={it.name} meta={metaLine(it)} onRemove={() => onRemoveItem(it.id)} />
                </DragCard>
              </View>
            ))}
            {suggestions.map((s) => {
              const meta = s.friend ? `from ${s.friend}` : 'Popular landmark';
              return (
                <DragCard
                  key={s.id}
                  onLift={measure}
                  onMove={setHoverIf}
                  onPress={() => onOpenSuggestion(s)}
                  onDrop={(x, y) => {
                    setHover(null);
                    const k = zoneAt(x, y);
                    if (k && k !== 'ideas') onAddSuggestion(s, day, k.slice(5) as ItinerarySlot);
                  }}
                >
                  <Chrome title={s.name} meta={meta} sugg />
                </DragCard>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
