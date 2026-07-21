import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudOff } from 'lucide-react-native';
import { useData } from '../src/store/data';

/** A quiet, floating reassurance shown to a signed-in member while the live
 *  cloud data hasn't been confirmed by the server yet — i.e. offline or still
 *  connecting. The screen is showing the on-device cache, so this says so
 *  instead of letting a momentary blank read as lost data. It only appears
 *  after a short grace period, so a fast connection never flashes it, and
 *  disappears the instant the server responds. */
export function SyncBanner() {
  const { cloud, synced } = useData();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const [show, setShow] = useState(false);

  // Only surface it once we've been unsynced for a beat (good signal ≈ instant).
  const waiting = cloud && !synced;
  useEffect(() => {
    if (!waiting) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, [waiting]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: show ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [show, opacity]);

  if (!waiting && !show) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 96, alignItems: 'center', opacity }}
    >
      <View
        className="flex-row items-center rounded-full"
        style={{
          paddingHorizontal: 14,
          paddingVertical: 9,
          gap: 8,
          backgroundColor: 'rgba(20,33,61,0.92)',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <CloudOff size={15} color="#fff" />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: '#fff' }}>
          Offline — showing your saved world
        </Text>
      </View>
    </Animated.View>
  );
}
