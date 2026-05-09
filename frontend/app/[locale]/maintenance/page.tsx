'use client';

import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-midnight" />
      <div className="fixed inset-0 orhun-pattern" />

      {/* Orhun characters background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05]">
        <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <text x="80" y="180" fontSize="110" fill="#c9a44c" fontFamily="serif">𐰀</text>
          <text x="620" y="280" fontSize="85" fill="#c9a44c" fontFamily="serif">𐰆</text>
          <text x="180" y="620" fontSize="130" fill="#c9a44c" fontFamily="serif">𐰢</text>
          <text x="520" y="700" fontSize="95" fill="#c9a44c" fontFamily="serif">𐰍</text>
          <text x="350" y="380" fontSize="160" fill="#c9a44c" fontFamily="serif">𐰭</text>
        </svg>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="w-full max-w-xl text-center animate-fade-in-up">
          {/* Title */}
          <h1 className="font-display text-6xl sm:text-7xl font-light text-gold-shine mb-4">
            Coming Soon
          </h1>

          <p className="text-gold-300/60 text-base sm:text-lg italic font-display mb-12">
            Where ancient songs meet new sounds
          </p>

          {/* Card */}
          <div className="surface-glass-bright rounded-2xl p-10 shadow-2xl shadow-black/40 relative">
            {/* Wave animation */}
            <div className="flex justify-center items-center gap-1.5 mb-8 h-12">
              <div className="wave-bar h-10" />
              <div className="wave-bar h-10" />
              <div className="wave-bar h-10" />
              <div className="wave-bar h-10" />
              <div className="wave-bar h-10" />
              <div className="wave-bar h-10" />
              <div className="wave-bar h-10" />
            </div>

            <h2 className="font-display text-2xl text-gold-100 mb-3">
              We're crafting something special
            </h2>

            <p className="text-gold-300/70 text-sm leading-relaxed">
              Orhun AI is currently in development.
              <br />
              Please return soon to discover the music of tomorrow.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16">
            <div className="text-xs tracking-[0.3em] text-gold-700 uppercase mb-2">
              orhun-ai.vercel.app
            </div>
            <div className="text-xs text-gold-700/60">
              © 2026 Orhun AI
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
