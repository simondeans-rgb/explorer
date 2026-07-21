import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import type { PressableProps, ViewStyle, StyleProp } from 'react-native';

/** A Pressable that springs down slightly while held — the reusable press
 *  feedback for buttons and cards. Drop-in for Pressable; forwards all props.
 *  `scaleTo` tunes the depth (cards want a subtler dip than buttons). */
export function PressScale({
  children,
  style,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      onPressIn={(e) => { spring(scaleTo); onPressIn?.(e); }}
      onPressOut={(e) => { spring(1); onPressOut?.(e); }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children as never}</Animated.View>
    </Pressable>
  );
}
