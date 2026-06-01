'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, ImageOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ALL_CATEGORIES, CATEGORY_COLORS, getMenuForRestaurant } from '@/data/restaurants';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MenuReferenceProps {
  restaurantId: string;
}

function ThumbImage({ src, name }: { src: string; name: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="h-9 w-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
        <ImageOff className="h-3 w-3 text-gray-300" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className="h-9 w-9 object-cover rounded-md shrink-0"
    />
  );
}

export function MenuReference({ restaurantId }: MenuReferenceProps) {
  const [open, setOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const menu = getMenuForRestaurant(restaurantId);

  const byCategory = ALL_CATEGORIES.reduce<Record<string, typeof menu>>((acc, cat) => {
    const items = menu.filter((m) => m.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(!open)}>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            Menu Reference
          </div>
          {open
            ? <ChevronDown className="h-4 w-4 text-gray-400" />
            : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </CardTitle>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-1">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <button
                onClick={() => setExpandedCat(expandedCat === category ? null : category)}
                className="w-full flex items-center justify-between py-1.5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-xs text-gray-400">({items.length})</span>
                </div>
                {expandedCat === category
                  ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
              </button>

              {expandedCat === category && (
                <div className="ml-4 space-y-2 mb-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-2.5 py-1">
                      {item.image && <ThumbImage src={item.image} name={item.name} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-xs text-gray-400 shrink-0">{item.code}</span>
                            <span className="text-sm text-gray-800 font-medium truncate">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-red-600 shrink-0">{formatCurrency(item.price)}</span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
