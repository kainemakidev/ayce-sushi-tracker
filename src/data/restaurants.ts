import type { Restaurant, MenuItem, PricingTier } from '@/types';
import rawMenuData from './menu.json';

interface RawMenuItem {
  code: string;
  name: string;
  category: string;
  price: number;
  aLaCarteQty?: number;
  ayceQty?: number;
  image?: string;
  description?: string;
}

const rawMenu = rawMenuData as RawMenuItem[];

const round2 = (n: number) => Math.round(n * 100) / 100;

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'dragon-rolls',
    name: 'Dragon Rolls Japanese + Thai',
    address: '1105 Kingston Road, Pickering, ON L1V 1B5',
    description: 'Japanese & Thai all-you-can-eat',
    pricingTiers: [
      {
        id: 'lunch-weekday',
        label: 'Lunch · Mon–Thu',
        price: 25.99,
        cashPrice: round2(25.99 * 0.9),
      },
      {
        id: 'lunch-weekend',
        label: 'Lunch · Fri–Sun & Holiday',
        price: 27.99,
        cashPrice: round2(27.99 * 0.9),
      },
      {
        id: 'dinner-weekday',
        label: 'Dinner · Mon–Thu',
        price: 35.99,
        cashPrice: round2(35.99 * 0.9),
      },
      {
        id: 'dinner-weekend',
        label: 'Dinner · Fri–Sun & Holiday',
        price: 37.99,
        cashPrice: round2(37.99 * 0.9),
      },
    ],
  },
];

export interface SessionInfo {
  isLunch: boolean;
  isDinner: boolean;
  isOpen: boolean;
  isWeekend: boolean;
  sessionLabel: string;
  dayLabel: string;
  statusLabel: string;
}

export function getSessionInfo(): SessionInfo {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...6=Sat
  const hour = now.getHours();

  // Fri (5), Sat (6), Sun (0) = weekend pricing
  const isWeekend = day === 0 || day === 5 || day === 6;
  // Lunch: 11:00 AM – 3:00 PM
  const isLunch = hour >= 11 && hour < 15;
  // Dinner: 3:00 PM – 10:00 PM
  const isDinner = hour >= 15 && hour < 22;
  const isOpen = isLunch || isDinner;

  const sessionLabel = isLunch ? 'Lunch' : 'Dinner';
  const dayLabel = isWeekend ? 'Fri–Sun & Holiday' : 'Mon–Thu';
  const statusLabel = isOpen
    ? `${sessionLabel} service · ${dayLabel}`
    : hour < 11
    ? 'Opens at 11:00 AM'
    : 'Closed · Opens tomorrow at 11:00 AM';

  return { isLunch, isDinner, isOpen, isWeekend, sessionLabel, dayLabel, statusLabel };
}

export function getDefaultTier(restaurant: Restaurant): PricingTier {
  const { isLunch, isWeekend } = getSessionInfo();
  if (isLunch && !isWeekend) return restaurant.pricingTiers[0];
  if (isLunch && isWeekend) return restaurant.pricingTiers[1];
  if (!isLunch && !isWeekend) return restaurant.pricingTiers[2];
  return restaurant.pricingTiers[3];
}

export function getMenuForRestaurant(restaurantId: string): MenuItem[] {
  return rawMenu.map((item) => ({
    id: `${restaurantId}-${item.code}`,
    restaurantId,
    code: item.code,
    name: item.name,
    category: item.category,
    price: item.price,
    ...(item.aLaCarteQty != null ? { aLaCarteQty: item.aLaCarteQty } : {}),
    ...(item.ayceQty != null ? { ayceQty: item.ayceQty } : {}),
    ...(item.image ? { image: item.image } : {}),
    ...(item.description ? { description: item.description } : {}),
  }));
}

export const CATEGORY_COLORS: Record<string, string> = {
  Appetizer: '#f97316',
  Soup: '#eab308',
  Salad: '#22c55e',
  'Maki Roll': '#ef4444',
  'Torched Sushi': '#f59e0b',
  Sushi: '#3b82f6',
  Sashimi: '#8b5cf6',
  'Sushi Pizza': '#ec4899',
};

export const ALL_CATEGORIES = [
  'Appetizer',
  'Soup',
  'Salad',
  'Maki Roll',
  'Torched Sushi',
  'Sushi',
  'Sashimi',
  'Sushi Pizza',
];
