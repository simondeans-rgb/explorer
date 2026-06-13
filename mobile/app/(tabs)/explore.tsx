import { ScrollView } from 'react-native';
import { PageHero } from '../../components/PageHero';
import { COLORS, GRADIENTS } from '../../src/lib/theme';

export default function ExploreScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <PageHero eyebrow="The world, country by country" title="Explore" subtitle="Find destinations and keep the places worth remembering." gradient={GRADIENTS.explore} />
    </ScrollView>
  );
}
