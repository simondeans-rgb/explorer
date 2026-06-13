import { ScrollView } from 'react-native';
import { PageHero } from '../../components/PageHero';
import { COLORS, GRADIENTS } from '../../src/lib/theme';

export default function AtlasScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <PageHero eyebrow="Your collection" title="Atlas" subtitle="Every place you've been — map, country, journey." gradient={GRADIENTS.atlas} />
    </ScrollView>
  );
}
