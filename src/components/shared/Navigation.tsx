'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Zap, BarChart2, History, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tracker', label: 'Tracker', icon: UtensilsCrossed },
  { href: '/fast-entry', label: 'Fast', icon: Zap },
  { href: '/summary', label: 'Summary', icon: BarChart2 },
  { href: '/history', label: 'History', icon: History },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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

        <button
          type="button"
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[48px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="text-[10px] font-medium">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
    </nav>
  );
}
