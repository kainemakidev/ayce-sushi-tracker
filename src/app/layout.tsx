import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/shared/Navigation';
import { ThemeProvider } from '@/components/shared/ThemeProvider';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply dark class before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');const d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen pb-20 max-w-lg mx-auto">
            {children}
          </div>
          <Navigation />
        </ThemeProvider>
      </body>
    </html>
  );
}
