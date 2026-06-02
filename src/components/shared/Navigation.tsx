'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Utensils, BarChart2, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Restaurants', icon: Store },
  { href: '/tracker', label: 'Live Meal', icon: Utensils },
  { href: '/summary', label: 'My Stats', icon: BarChart2 },
  { href: '/history', label: 'Past Meals', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[52px]',
                active
                  ? 'text-red-600'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-red-600" />
              )}
              <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
