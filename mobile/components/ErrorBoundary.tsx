import { Component, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { COLORS } from '../src/lib/theme';
import { reportError } from '../src/lib/sentry';

/** Our own error boundary with a branded fallback, so a render crash shows a
 *  recoverable screen instead of white (Sentry's wrap only helps when Sentry is
 *  initialised). "Try again" re-mounts the tree — state and data providers sit
 *  above it, so the user's world is untouched. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    reportError(error, { componentStack: info.componentStack ?? undefined });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 28, color: '#fff', textAlign: 'center' }}>
          Well, that wasn’t on the itinerary
        </Text>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
          Something went wrong on our side. Your travels are safe — let’s try that again.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          onPress={() => this.setState({ failed: false })}
          style={{ marginTop: 28, backgroundColor: COLORS.coral, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 36 }}
        >
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: '#fff' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
