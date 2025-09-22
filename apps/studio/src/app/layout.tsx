import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'InfoOS CRM - Smart CRM for Info Products',
  description: 'AI-powered CRM for coaches, creators, and info product sellers',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'InfoOS CRM - Smart CRM for Info Products',
    description: 'AI-powered CRM for coaches, creators, and info product sellers',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#f8fafc' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}