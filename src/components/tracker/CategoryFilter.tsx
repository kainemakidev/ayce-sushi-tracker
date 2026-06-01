'use client';

import { cn } from '@/lib/utils';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '@/data/restaurants';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
      <div className="flex gap-2 pb-1">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
            selected === null
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          )}
        >
          All
        </button>
        {ALL_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(selected === category ? null : category)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
              selected === category
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
            style={
              selected === category
                ? { backgroundColor: CATEGORY_COLORS[category] || '#ef4444' }
                : {}
            }
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
