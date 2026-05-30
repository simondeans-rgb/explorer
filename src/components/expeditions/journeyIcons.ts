import {
  Anchor,
  Car,
  type LucideIcon,
  Plane,
  Ship,
  TrainFront,
} from 'lucide-react';
import type { JourneyMode } from '../../types';

export const JOURNEY_ICON: Record<JourneyMode, LucideIcon> = {
  flight: Plane,
  rail: TrainFront,
  cruise: Ship,
  road: Car,
  ferry: Anchor,
};
