import type { ConsumptionRecord, MenuItem, MealCalculation, Achievement } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'break-even', name: 'Break-Even Achieved', description: 'Your meal value exceeded the AYCE cost', emoji: '🎯' },
  { id: 'sushi-rookie', name: 'Sushi Rookie', description: 'Ate 10 or more items', emoji: '🍣' },
  { id: 'roll-collector', name: 'Roll Collector', description: 'Ordered 5 different types of rolls', emoji: '🌀' },
  { id: 'salmon-specialist', name: 'Salmon Specialist', description: 'Ordered salmon items 5+ times', emoji: '🐟' },
  { id: 'sashimi-master', name: 'Sashimi Master', description: 'Ordered 10 or more sashimi items', emoji: '🔪' },
  { id: 'dessert-destroyer', name: 'Dessert Destroyer', description: 'Ordered 3 or more desserts', emoji: '🍮' },
  { id: '100-club', name: '$100 Club', description: 'Reached $100 in à la carte value', emoji: '💯' },
  { id: '150-club', name: '$150 Club', description: 'Reached $150 in à la carte value', emoji: '💫' },
  { id: '200-club', name: '$200 Club', description: 'Reached $200 in à la carte value', emoji: '👑' },
  { id: 'sushi-legend', name: 'Sushi Legend', description: 'Achieved a 3x value multiplier', emoji: '🏆' },
];

export function checkAchievements(
  stats: MealCalculation,
  items: ConsumptionRecord[],
  menu: MenuItem[],
): string[] {
  const earned: string[] = [];
  const menuMap = new Map(menu.map((m) => [m.id, m]));

  // Break-even
  if (stats.totalMenuValue >= stats.aycePrice) earned.push('break-even');

  // Sushi Rookie - 10+ items
  if (stats.itemCount >= 10) earned.push('sushi-rookie');

  // Roll Collector - 5 different roll types
  const rollItems = items.filter((r) => {
    const item = menuMap.get(r.itemId);
    return item?.category === 'Rolls';
  });
  if (rollItems.length >= 5) earned.push('roll-collector');

  // Salmon Specialist - salmon items 5+ times total
  let salmonCount = 0;
  for (const record of items) {
    const item = menuMap.get(record.itemId);
    if (item && item.name.toLowerCase().includes('salmon')) {
      salmonCount += record.quantity;
    }
  }
  if (salmonCount >= 5) earned.push('salmon-specialist');

  // Sashimi Master - 10+ sashimi items
  let sashimiCount = 0;
  for (const record of items) {
    const item = menuMap.get(record.itemId);
    if (item?.category === 'Sashimi') sashimiCount += record.quantity;
  }
  if (sashimiCount >= 10) earned.push('sashimi-master');

  // Dessert Destroyer - 3+ desserts
  let dessertCount = 0;
  for (const record of items) {
    const item = menuMap.get(record.itemId);
    if (item?.category === 'Desserts') dessertCount += record.quantity;
  }
  if (dessertCount >= 3) earned.push('dessert-destroyer');

  // Value clubs
  if (stats.totalMenuValue >= 100) earned.push('100-club');
  if (stats.totalMenuValue >= 150) earned.push('150-club');
  if (stats.totalMenuValue >= 200) earned.push('200-club');

  // Sushi Legend - 3x multiplier
  if (stats.valueMultiplier >= 3) earned.push('sushi-legend');

  return earned;
}
