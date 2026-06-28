import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import {
  Footprints, Compass, Globe2, Globe, Waves, Building2, Building, UtensilsCrossed,
  Landmark, Mountain, Plane, Images, Image as ImageIcon, Gem, Coffee, PartyPopper,
  Moon, Star, Award, Map, TrainFront, Ship, Car, Bird, Ticket, Telescope, Umbrella,
  Church, Home, House, Camera, BookOpen, Heart, Lock,
  type LucideIcon,
} from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import type { Badge } from '../src/lib/explorer';

const ICONS: Record<string, LucideIcon> = {
  Footprints, Compass, Globe2, Globe, Waves, Building2, Building, UtensilsCrossed,
  Landmark, Mountain, Plane, Images, Image: ImageIcon, Gem, Coffee, PartyPopper,
  Moon, Star, Award, Map, TrainFront, Ship, Car, Bird, Ticket, Telescope, Umbrella,
  Church, Home, House, Camera, BookOpen, Heart,
};

/** A thin progress ring drawn around a locked tile. */
function Ring({ progress, size }: { progress: number; size: number }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ position: 'absolute', top: -stroke, left: -stroke }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(20,33,61,0.08)" strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={COLORS.coral}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.max(0, Math.min(1, progress)))}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

/** An illustrated achievement tile — a rounded gradient square with a glyph,
 *  full-colour when earned, greyed with a progress ring while locked. */
export function AchievementBadge({ badge, tile = 64 }: { badge: Badge; tile?: number }) {
  const Icon = ICONS[badge.icon] ?? Award;
  const earned = badge.earned;

  return (
    <View style={{ alignItems: 'center', width: tile + 16 }}>
      <View style={{ width: tile, height: tile }}>
        {earned ? (
          <LinearGradient
            colors={badge.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: tile, height: tile, borderRadius: tile * 0.28, alignItems: 'center', justifyContent: 'center', shadowColor: badge.gradient[1], shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
          >
            <Icon size={tile * 0.42} color="#fff" />
          </LinearGradient>
        ) : (
          <>
            <View style={{ width: tile, height: tile, borderRadius: tile * 0.28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF0F6', opacity: badge.progress === 0 ? 0.92 : 1 }}>
              <Icon size={tile * 0.42} color="#C2C7D6" />
              {badge.progress === 0 ? (
                <View style={{ position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.navy, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={10} color="#fff" />
                </View>
              ) : null}
            </View>
            {badge.progress > 0 ? <Ring progress={badge.progress} size={tile} /> : null}
          </>
        )}
      </View>
      <Text numberOfLines={2} style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, lineHeight: 13, fontWeight: '700', color: earned ? COLORS.navy : COLORS.ink3, marginTop: 6, textAlign: 'center', minHeight: 26 }}>
        {badge.title}
      </Text>
      {!earned && badge.target > 1 ? (
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, color: COLORS.ink3, opacity: 0.8 }}>{Math.min(badge.value, badge.target)}/{badge.target}</Text>
      ) : null}
    </View>
  );
}
