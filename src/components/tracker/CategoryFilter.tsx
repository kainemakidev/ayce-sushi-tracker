'use client';

import { cn } from '@/lib/utils';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '@/data/restaurants';

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
            'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
            selected === null
              ? 'text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
          )}
          style={selected === null ? { backgroundColor: '#C0392B' } : {}}
        >
          All
        </button>
        {ALL_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(selected === category ? null : category)}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap',
              selected === category
                ? 'text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
            )}
            style={selected === category ? { backgroundColor: CATEGORY_COLORS[category] || '#C0392B' } : {}}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
