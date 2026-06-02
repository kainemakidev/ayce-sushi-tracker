'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, BarChart2, History, Settings, Sun, Moon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tracker', label: 'Tracker', icon: UtensilsCrossed },
  { href: '/summary', label: 'Summary', icon: BarChart2 },
  { href: '/history', label: 'History', icon: History },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[48px]',
                active
                  ? 'text-red-600'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Options menu */}
        <div ref={menuRef} className="relative">
          {/* Popover */}
          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Appearance</p>
              </div>
              <button
                type="button"
                onClick={() => { if (theme !== 'light') toggleTheme(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="flex-1 text-left">Light Mode</span>
                {theme === 'light' && <Check className="h-3.5 w-3.5 text-red-500 shrink-0" />}
              </button>
              <button
                type="button"
                onClick={() => { if (theme !== 'dark') toggleTheme(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <Moon className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="flex-1 text-left">Dark Mode</span>
                {theme === 'dark' && <Check className="h-3.5 w-3.5 text-red-500 shrink-0" />}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[48px] cursor-pointer',
              menuOpen
                ? 'text-red-600'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
            )}
            aria-label="Options"
          >
            <Settings className={cn('h-5 w-5 transition-transform', menuOpen && 'scale-110')} />
            <span className={cn('text-[10px] font-medium', menuOpen && 'font-semibold')}>Options</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
