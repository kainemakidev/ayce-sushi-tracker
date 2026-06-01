import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/shared/Navigation';

export const metadata: Metadata = {
  title: 'AYCE Sushi Tracker',
  description: 'Track your all-you-can-eat sushi value in real time',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AYCE Sushi',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#dc2626',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen pb-20 max-w-lg mx-auto">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}
