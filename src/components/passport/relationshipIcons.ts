import {
  Anchor,
  Briefcase,
  Compass,
  GraduationCap,
  Home,
  type LucideIcon,
  Plane,
  Sparkles,
} from 'lucide-react';
import type { Relationship } from '../../types';

export const RELATIONSHIP_ICON: Record<Relationship, LucideIcon> = {
  visited: Plane,
  lived: Home,
  worked: Briefcase,
  studied: GraduationCap,
  based: Anchor,
  born: Sparkles,
  aspiring: Compass,
};
