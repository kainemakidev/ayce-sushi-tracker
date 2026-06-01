'use client';

import { useState } from 'react';
import { Plus, Minus, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/data/restaurants';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onDecrement: () => void;
  compact?: boolean;
}

function ItemImage({ src, name, size }: { src: string; name: string; size: 'sm' | 'lg' }) {
  const [errored, setErrored] = useState(false);
  const dim = size === 'sm' ? 'h-11 w-11' : 'h-28 w-full';

  if (errored) {
    return (
      <div className={cn(dim, 'rounded-lg bg-gray-100 flex items-center justify-center shrink-0')}>
        <ImageOff className="h-4 w-4 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className={cn(dim, 'object-cover rounded-lg shrink-0')}
    />
  );
}

export function MenuItemCard({ item, quantity, onAdd, onDecrement, compact }: MenuItemCardProps) {
  const categoryColor = CATEGORY_COLORS[item.category] || '#6b7280';
  const hasQuantity = quantity > 0;
  const hasImage = !!item.image;
  const hasDescription = !!item.description;

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2.5 p-3 rounded-lg border transition-all',
        hasQuantity ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200',
      )}>
        {/* Thumbnail */}
        {hasImage && (
          <ItemImage src={item.image!} name={item.name} size="sm" />
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-gray-400 shrink-0">{item.code}</span>
            <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-semibold text-red-600">{formatCurrency(item.price)}</span>
            {hasQuantity && (
              <span className="text-xs text-gray-500">× {quantity} = {formatCurrency(item.price * quantity)}</span>
            )}
          </div>
          {hasDescription && !hasQuantity && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight line-clamp-1">
              {item.description}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {hasQuantity && (
            <button
              onClick={onDecrement}
              className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Minus className="h-3 w-3" />
            </button>
          )}
          {hasQuantity && (
            <span className="min-w-[20px] text-center text-sm font-bold text-red-600">{quantity}</span>
          )}
          <button
            onClick={onAdd}
            className="h-7 w-7 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  // Full card (used in non-compact contexts)
  return (
    <div className={cn(
      'rounded-xl border-2 transition-all overflow-hidden',
      hasQuantity ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white hover:border-gray-200',
    )}>
      {hasImage && (
        <ItemImage src={item.image!} name={item.name} size="lg" />
      )}
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-gray-400">{item.code}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                >
                  {item.category}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.name}</p>
              {hasDescription && (
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.description}</p>
              )}
              <p className="text-sm font-bold text-red-600 mt-1">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {hasQuantity && (
                <>
                  <button
                    onClick={onDecrement}
                    className="h-8 w-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[28px] text-center text-base font-bold text-red-600">{quantity}</span>
                </>
              )}
              <button
                onClick={onAdd}
                className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          {hasQuantity && (
            <div className="mt-2 text-xs text-gray-500">
              Subtotal: <span className="font-semibold text-gray-700">{formatCurrency(item.price * quantity)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
