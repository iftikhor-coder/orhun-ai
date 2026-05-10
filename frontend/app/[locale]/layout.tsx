import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { AudioPlayer } from '@/components/player/audio-player';
import { NotificationToast } from '@/components/notification-toast';
import '../globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const locales = ['en', 'uz', 'az', 'tr'];

export const metadata: Metadata = {
  title: 'Orhun AI · Music',
  description: 'Generate music with ancient soul. AI music for every culture.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-midnight-950 text-gold-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <NotificationToast />
          <AudioPlayer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
