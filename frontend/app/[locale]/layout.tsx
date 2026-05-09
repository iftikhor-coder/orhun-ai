import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import { AudioPlayer } from '@/components/player/audio-player';

export const dynamic = 'force-dynamic';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Orhun AI — Where ancient songs meet new sounds',
  description: 'Generate music with AI in seconds. Inspired by ancient Turkic sounds.',
  metadataBase: new URL('https://orhun-ai.vercel.app'),
  openGraph: {
    title: 'Orhun AI',
    description: 'AI music generation, inspired by ancient sounds.',
    url: 'https://orhun-ai.vercel.app',
    siteName: 'Orhun AI',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#06091a',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as never)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
          <AudioPlayer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
