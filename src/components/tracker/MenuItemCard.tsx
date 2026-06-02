'use client';

import { useState, useRef } from 'react';
import { Plus, Minus, ImageOff, Pencil, Check, X, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/data/restaurants';
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
import { getEffectivePortionInfo } from '@/lib/calculations';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onDecrement: () => void;
  compact?: boolean;
  badge?: string;
}

function ItemImage({ src, name, size }: { src: string; name: string; size: 'sm' | 'lg' }) {
  const [errored, setErrored] = useState(false);
  const dim = size === 'sm' ? 'h-11 w-11' : 'h-28 w-full';

  if (errored) {
    return (
      <div className={cn(dim, 'rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0')}>
        <ImageOff className="h-4 w-4 text-gray-300 dark:text-gray-600" />
      </div>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setErrored(true)} className={cn(dim, 'object-cover rounded-lg shrink-0')} />
  );
}

/** Inline editor that lets the user enter how many pieces they receive per AYCE order. */
function AyceQtyBadge({ item }: { item: MenuItem }) {
  const { ayceQtyOverrides, setAyceQty, clearAyceQty } = useMenuOverrideStore();
  const { effectiveAyceQty, parsedALaCarteQty } = getEffectivePortionInfo(item, ayceQtyOverrides);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isCustom = ayceQtyOverrides[item.id] != null;
  // Only show a badge if something meaningful differs from the default whole-dish assumption
  const showBadge = isCustom || item.ayceQty != null || parsedALaCarteQty != null;

  const startEdit = () => {
    setInput(String(effectiveAyceQty));
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const confirm = () => {
    const n = parseInt(input, 10);
    if (n > 0) {
      setAyceQty(item.id, n);
    }
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') cancel();
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          min="1"
          max="99"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-10 h-5 text-xs text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-red-400"
        />
        <span className="text-[10px] text-gray-400 dark:text-gray-500">pcs</span>
        <button type="button" onClick={confirm} className="text-green-600 hover:text-green-700 cursor-pointer">
          <Check className="h-3 w-3" />
        </button>
        <button type="button" onClick={cancel} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="h-3 w-3" />
        </button>
        {isCustom && (
          <button type="button" onClick={() => { clearAyceQty(item.id); setEditing(false); }} className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer leading-none">
            reset
          </button>
        )}
      </span>
    );
  }

  if (showBadge) {
    return (
      <button
        type="button"
        onClick={startEdit}
        className={cn(
          'inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold cursor-pointer transition-colors',
          isCustom
            ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500',
        )}
        title="Tap to set AYCE pcs per order"
      >
        {effectiveAyceQty} pcs
        <Pencil className="h-2.5 w-2.5" />
      </button>
    );
  }

  // No piece-count context — show a minimal edit trigger
  return (
    <button
      type="button"
      onClick={startEdit}
      className="inline-flex items-center text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-pointer transition-colors"
      title="Set AYCE pcs per order"
    >
      <Pencil className="h-3 w-3" />
    </button>
  );
}

function PricePromptSheet({
  item,
  onConfirm,
  onCancel,
}: {
  item: MenuItem;
  onConfirm: (price: number) => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState('');
  const price = parseFloat(input);

  const handleConfirm = () => {
    if (price > 0) onConfirm(price);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl p-5 shadow-2xl max-w-lg mx-auto animate-fade-in">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Set price for this item</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 ml-6">
          {item.name} — check the physical menu for the à la carte price.
        </p>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus
            className="w-full pl-7 pr-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!(price > 0)}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer transition-opacity"
          >
            Add Item
          </button>
        </div>
      </div>
    </>
  );
}

export function MenuItemCard({ item, quantity, onAdd, onDecrement, compact, badge }: MenuItemCardProps) {
  const { ayceQtyOverrides, priceOverrides, setPriceOverride } = useMenuOverrideStore();
  const [showPricePrompt, setShowPricePrompt] = useState(false);
  const { effectiveAyceQty, portionRatio } = getEffectivePortionInfo(item, ayceQtyOverrides);
  const categoryColor = CATEGORY_COLORS[item.category] || '#6b7280';
  const hasQuantity = quantity > 0;
  const hasImage = !!item.image;
  const hasDescription = !!item.description;
  const customPrice = priceOverrides[item.id];
  const hasPrice = item.price > 0 || customPrice != null;
  const effectivePrice = item.price > 0 ? item.price : (customPrice ?? 0);
  const valuePerOrder = effectivePrice * portionRatio;
  const totalPcs = quantity * effectiveAyceQty;

  const handleAdd = () => {
    if (!hasPrice) {
      setShowPricePrompt(true);
    } else {
      onAdd();
    }
  };

  const handlePriceConfirm = (price: number) => {
    setPriceOverride(item.id, price);
    setShowPricePrompt(false);
    onAdd();
  };

  if (compact) {
    return (
      <>
        {showPricePrompt && (
          <PricePromptSheet
            item={item}
            onConfirm={handlePriceConfirm}
            onCancel={() => setShowPricePrompt(false)}
          />
        )}
        <div className={cn(
          'flex items-center gap-2.5 p-3 rounded-lg border transition-all',
          hasQuantity
            ? 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900'
            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700',
        )}>
          {hasImage && <ItemImage src={item.image!} name={item.name} size="sm" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500 shrink-0">{item.code}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {badge}
                </span>
              )}
              {hasPrice ? (
                <>
                  <span className="text-xs font-semibold text-red-600">{formatCurrency(valuePerOrder)}</span>
                  {customPrice != null && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">custom</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Tap + to set price</span>
              )}
              <AyceQtyBadge item={item} />
              {hasQuantity && hasPrice && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ×{quantity}{effectiveAyceQty > 1 ? ` (${totalPcs} pcs)` : ''} = {formatCurrency(valuePerOrder * quantity)}
                </span>
              )}
            </div>
            {hasDescription && !hasQuantity && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight line-clamp-1">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {hasQuantity && (
              <button
                type="button"
                onClick={onDecrement}
                className="h-7 w-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Minus className="h-3 w-3" />
              </button>
            )}
            {hasQuantity && (
              <span className="min-w-[20px] text-center text-sm font-bold text-red-600">{quantity}</span>
            )}
            <button
              type="button"
              onClick={handleAdd}
              className="h-7 w-7 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showPricePrompt && (
        <PricePromptSheet
          item={item}
          onConfirm={handlePriceConfirm}
          onCancel={() => setShowPricePrompt(false)}
        />
      )}
      <div className={cn(
        'rounded-xl border-2 transition-all overflow-hidden',
        hasQuantity
          ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900'
          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700',
      )}>
        {hasImage && <ItemImage src={item.image!} name={item.name} size="lg" />}
        <div className="flex items-start gap-3 p-4">
          <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: categoryColor }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{item.code}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}>
                    {item.category}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{item.name}</p>
                {hasDescription && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {hasPrice ? (
                    <>
                      <p className="text-sm font-bold text-red-600">{formatCurrency(valuePerOrder)}</p>
                      {customPrice != null && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">custom price</span>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Tap + to set price</p>
                  )}
                  <AyceQtyBadge item={item} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {hasQuantity && (
                  <>
                    <button
                      type="button"
                      onClick={onDecrement}
                      className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[28px] text-center text-base font-bold text-red-600">{quantity}</span>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleAdd}
                  className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            {hasQuantity && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {effectiveAyceQty > 1 && <span className="mr-2">{totalPcs} pcs total ·</span>}
                Subtotal: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(valuePerOrder * quantity)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
