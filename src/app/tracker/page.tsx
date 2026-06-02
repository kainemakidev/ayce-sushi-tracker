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
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
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
    setSelectedDiner,
    clearMeal,
  } = useMealStore();
  const { saveMeal } = useHistoryStore();
  const { ayceQtyOverrides } = useMenuOverrideStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

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
    const groupSize = diners.length || 1;
    const stats = calculateMealStats(items, menu, selectedAycePrice * groupSize, ayceQtyOverrides);
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

    clearMeal();
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
            onClick={() => setShowFinishConfirm(true)}
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

        {/* Diner picker — shown when party mode is active */}
        {partyModeEnabled && diners.length > 0 && (
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
            {diners.map((diner) => {
              const isActive = selectedDinerId === diner.id;
              return (
                <button
                  key={diner.id}
                  type="button"
                  onClick={() => setSelectedDiner(isActive ? null : diner.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer"
                  style={
                    isActive
                      ? { backgroundColor: diner.color, color: '#fff' }
                      : { backgroundColor: '#f3f4f6', color: '#4b5563' }
                  }
                >
                  <span className="h-4 w-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold leading-none">
                    {diner.name[0].toUpperCase()}
                  </span>
                  {diner.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        {activeTab === 'menu' && (
          <div className="space-y-3">
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
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
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Statistics</h2>
            <LiveStats />
            {partyModeEnabled && <PartyMode />}
          </div>
        )}

        {activeTab === 'order' && (
          <div className="space-y-4">
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
            ) : partyModeEnabled && diners.length > 1 ? (
              diners.map((diner) => {
                const dinerItems = orderedItems.filter((x) => x.record.dinerId === diner.id);
                if (dinerItems.length === 0) return null;
                return (
                  <div key={diner.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: diner.color }}
                      >
                        {diner.name[0].toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{diner.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        · {dinerItems.length} item{dinerItems.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {dinerItems.map(({ record, menuItem }) =>
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
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {orderedItems.length} unique item{orderedItems.length !== 1 ? 's' : ''} ordered
                </p>
                {orderedItems.map(({ record, menuItem }) =>
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
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Finish Meal confirmation drawer */}
      {showFinishConfirm && restaurant && selectedAycePrice && (() => {
        const groupSize = diners.length || 1;
        const confirmStats = calculateMealStats(items, menu, selectedAycePrice * groupSize, ayceQtyOverrides);
        const isAhead = confirmStats.valueMultiplier >= 1;
        return (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFinishConfirm(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl p-5 shadow-2xl animate-fade-in">
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
              <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                Ready to wrap up?
              </p>
              <div className={`flex items-center justify-center gap-3 p-4 rounded-xl mb-4 ${isAhead ? 'bg-green-50 dark:bg-green-950/40' : 'bg-red-50 dark:bg-red-950/30'}`}>
                <span className="text-3xl">{isAhead ? '🏆' : '🍣'}</span>
                <div>
                  <p className={`text-xl font-bold ${isAhead ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
                    {formatCurrency(confirmStats.totalMenuValue)} value
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {confirmStats.valueMultiplier.toFixed(2)}× multiplier ·{' '}
                    {isAhead
                      ? `+${formatCurrency(confirmStats.savings)} ahead`
                      : `${formatCurrency(Math.abs(confirmStats.savings))} to break even`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFinishConfirm(false)}
                >
                  Keep Going
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => { setShowFinishConfirm(false); handleFinishMeal(); }}
                >
                  Finish & Save
                </Button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
