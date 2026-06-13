import { ScrollView } from 'react-native';
import { PageHero } from '../../components/PageHero';
import { COLORS, GRADIENTS } from '../../src/lib/theme';

export default function YouScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <PageHero eyebrow="Alex" title="You" subtitle="Identity, level and achievements." gradient={GRADIENTS.you} />
    </ScrollView>
  );
}
