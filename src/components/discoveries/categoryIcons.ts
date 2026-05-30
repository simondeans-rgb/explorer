import {
  BedDouble,
  Landmark,
  type LucideIcon,
  Mountain,
  Ticket,
  UtensilsCrossed,
} from 'lucide-react';
import type { DiscoveryCategory } from '../../types';

export const CATEGORY_ICON: Record<DiscoveryCategory, LucideIcon> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};
