export interface PricingTier {
  id: string;
  label: string;
  price: number;
  cashPrice: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  description?: string;
  pricingTiers: PricingTier[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  code: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
}

export interface ConsumptionRecord {
  itemId: string;
  quantity: number;
  dinerId?: string;
}

export interface Diner {
  id: string;
  name: string;
  color: string;
}

export interface CompletedMeal {
  id: string;
  date: string;
  restaurantId: string;
  restaurantName: string;
  aycePrice: number;
  pricingLabel?: string;
  cashPayment?: boolean;
  menuValue: number;
  savings: number;
  valueMultiplier: number;
  itemCount: number;
  uniqueItemCount: number;
  topCategory: string;
  items: ConsumptionRecord[];
  diners?: Diner[];
  achievements?: string[];
}

export interface CategoryStat {
  category: string;
  value: number;
  quantity: number;
  color: string;
  percentage: number;
}

export interface TopItem {
  item: MenuItem;
  quantity: number;
  value: number;
}

export interface MealCalculation {
  aycePrice: number;
  totalMenuValue: number;
  savings: number;
  valueMultiplier: number;
  itemCount: number;
  uniqueItemCount: number;
  mostExpensiveItem: MenuItem | null;
  mostConsumedItem: MenuItem | null;
  breakEvenProgress: number;
  categoryStats: CategoryStat[];
  topItems: TopItem[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}
