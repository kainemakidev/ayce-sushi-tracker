'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, Users, ListOrdered, Menu as MenuIcon, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchBar } from '@/components/tracker/SearchBar';
import { CategoryFilter } from '@/components/tracker/CategoryFilter';
import { MenuItemCard } from '@/components/tracker/MenuItemCard';
import { LiveStats } from '@/components/tracker/LiveStats';
import { PartyMode } from '@/components/tracker/PartyMode';
import { LiveStatsBar } from '@/components/shared/LiveStatsBar';
import { useMealStore } from '@/store/mealStore';
import { useHistoryStore } from '@/store/historyStore';
import { RESTAURANTS, getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats } from '@/lib/calculations';
import { checkAchievements } from '@/lib/achievements';
import { generateId, formatCurrency } from '@/lib/utils';

export default function TrackerPage() {
  const router = useRouter();
  const {
    selectedRestaurantId,
    selectedAycePrice,
    selectedPricingLabel,
    cashPayment,
    items,
    diners,
    partyModeEnabled,
    selectedDinerId,
    addItem,
    decrementItem,
    togglePartyMode,
  } = useMealStore();
  const { saveMeal } = useHistoryStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('menu');

  const restaurant = RESTAURANTS.find((r) => r.id === selectedRestaurantId);
  const menu = useMemo(
    () => (selectedRestaurantId ? getMenuForRestaurant(selectedRestaurantId) : []),
    [selectedRestaurantId],
  );

  const filteredMenu = useMemo(() => {
    let result = menu;
    if (selectedCategory) result = result.filter((m) => m.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [menu, selectedCategory, search]);

  const getItemQty = useCallback(
    (itemId: string) =>
      items
        .filter((r) => r.itemId === itemId && r.dinerId === (selectedDinerId ?? undefined))
        .reduce((sum, r) => sum + r.quantity, 0),
    [items, selectedDinerId],
  );

  const orderedItems = useMemo(() => {
    return items
      .filter((r) => r.quantity > 0)
      .map((r) => ({
        record: r,
        menuItem: menu.find((m) => m.id === r.itemId),
      }))
      .filter((x) => x.menuItem)
      .sort((a, b) => b.record.quantity - a.record.quantity);
  }, [items, menu]);

  const handleFinishMeal = () => {
    if (!restaurant || !selectedAycePrice || items.length === 0) return;
    const stats = calculateMealStats(items, menu, selectedAycePrice);
    const achievements = checkAchievements(stats, items, menu);

    saveMeal({
      id: generateId(),
      date: new Date().toISOString(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      aycePrice: selectedAycePrice,
      pricingLabel: selectedPricingLabel ?? undefined,
      cashPayment: cashPayment,
      menuValue: stats.totalMenuValue,
      savings: stats.savings,
      valueMultiplier: stats.valueMultiplier,
      itemCount: stats.itemCount,
      uniqueItemCount: stats.uniqueItemCount,
      topCategory: stats.categoryStats[0]?.category || '',
      items,
      diners,
      achievements,
    });

    router.push('/summary');
  };

  if (!restaurant || !selectedAycePrice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No meal in progress</p>
        <Button onClick={() => router.push('/')}>Start a Meal</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{restaurant.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-gray-400 dark:text-gray-500">{selectedPricingLabel}</p>
              {cashPayment && (
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                  <Banknote className="h-2.5 w-2.5" />{formatCurrency(selectedAycePrice)}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleFinishMeal}
            disabled={items.length === 0}
          >
            Finish Meal
          </Button>
        </div>
        <LiveStatsBar />
        <div className="px-4 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger value="menu" className="text-xs">
                <MenuIcon className="h-3.5 w-3.5 mr-1" />Menu
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                <BarChart2 className="h-3.5 w-3.5 mr-1" />Stats
              </TabsTrigger>
              <TabsTrigger value="order" className="text-xs">
                <ListOrdered className="h-3.5 w-3.5 mr-1" />Order
                {orderedItems.length > 0 && (
                  <span className="ml-1 text-[10px] bg-red-500 text-white rounded-full px-1 leading-none py-0.5">
                    {orderedItems.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-4 py-3">
        {activeTab === 'menu' && (
          <div className="space-y-3">
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
            {partyModeEnabled && selectedDinerId && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <div
                  className="h-4 w-4 rounded-full shrink-0"
                  style={{ backgroundColor: diners.find((d) => d.id === selectedDinerId)?.color }}
                />
                Adding to:{' '}
                <span className="font-semibold text-gray-800">
                  {diners.find((d) => d.id === selectedDinerId)?.name}
                </span>
              </div>
            )}
            <div className="space-y-2">
              {filteredMenu.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">No items found</p>
                  <button
                    onClick={() => { setSearch(''); setSelectedCategory(null); }}
                    className="text-xs text-red-500 mt-1 hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredMenu.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={getItemQty(item.id)}
                    onAdd={() => addItem(item.id, selectedDinerId ?? undefined)}
                    onDecrement={() => decrementItem(item.id, selectedDinerId ?? undefined)}
                    compact
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Live Statistics</h2>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={partyModeEnabled}
                  onChange={(e) => togglePartyMode(e.target.checked)}
                  className="h-3.5 w-3.5 accent-red-600"
                />
                <Users className="h-3.5 w-3.5" /> Party Mode
              </label>
            </div>
            <LiveStats />
            {partyModeEnabled && <PartyMode />}
          </div>
        )}

        {activeTab === 'order' && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {orderedItems.length} unique items ordered
            </p>
            {orderedItems.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No items added yet</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-xs text-red-500 mt-1 hover:underline cursor-pointer"
                >
                  Browse menu
                </button>
              </div>
            ) : (
              orderedItems.map(({ record, menuItem }) =>
                menuItem ? (
                  <MenuItemCard
                    key={`${record.itemId}-${record.dinerId}`}
                    item={menuItem}
                    quantity={record.quantity}
                    onAdd={() => addItem(menuItem.id, record.dinerId)}
                    onDecrement={() => decrementItem(menuItem.id, record.dinerId)}
                    compact
                  />
                ) : null,
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
