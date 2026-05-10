'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, Check, Sparkles, Crown, Zap, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  slug: string;
  duration_months: number;
  price_usd: number;
  price_uzs: number;
  price_azn: number;
  price_try: number;
  features_en: string[];
  features_uz: string[];
  features_az: string[];
  features_tr: string[];
  discount_label_en?: string | null;
  discount_label_uz?: string | null;
  discount_label_az?: string | null;
  discount_label_tr?: string | null;
  is_popular: boolean;
  sort_order: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const CURRENCY_MAP: Record<string, { field: keyof Plan; symbol: string; format: (n: number) => string }> = {
  en: { field: 'price_usd', symbol: '$', format: (n) => n.toFixed(2) },
  uz: { field: 'price_uzs', symbol: 'so\'m', format: (n) => Math.round(n).toLocaleString('uz') },
  az: { field: 'price_azn', symbol: '₼', format: (n) => n.toFixed(2) },
  tr: { field: 'price_try', symbol: '₺', format: (n) => Math.round(n).toLocaleString('tr') },
};

const ICONS = [Zap, Crown, Sparkles];

export function SubscriptionPanel({ open, onClose }: Props) {
  const t = useTranslations('Subscription');
  const locale = useLocale();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (data) setPlans(data as Plan[]);
      } catch (e) {
        console.error('Failed to load plans:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  if (!open) return null;

  const currency = CURRENCY_MAP[locale] || CURRENCY_MAP.en;

  const getFeatures = (p: Plan): string[] => {
    const key = `features_${locale}` as keyof Plan;
    return (p[key] as string[]) || p.features_en || [];
  };

  const getDiscountLabel = (p: Plan): string | null => {
    const key = `discount_label_${locale}` as keyof Plan;
    return (p[key] as string | null) || p.discount_label_en || null;
  };

  const getPrice = (p: Plan): number => {
    return Number(p[currency.field] || 0);
  };

  const getPricePerMonth = (p: Plan): string => {
    const price = getPrice(p);
    const perMonth = price / p.duration_months;
    return currency.format(perMonth);
  };

  return (
    <>
      <style>{`
        @keyframes orhun-slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: orhun-slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 z-[61]',
          'w-full sm:max-w-2xl',
          'surface-glass-bright',
          'shadow-2xl shadow-black/80 border-l border-gold-900/30',
          'overflow-y-auto',
          'animate-slide-in-right'
        )}
      >
        {/* Sparkle pattern bg */}
        <div className="absolute inset-0 orhun-pattern opacity-30 pointer-events-none" />

        {/* Header */}
        <div className="sticky top-0 z-10 surface-glass border-b border-gold-900/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold-400" />
            <h2 className="text-xl font-display text-gold-100">{t('title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gold-300/70 hover:text-gold-100 hover:bg-midnight-700/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative px-6 py-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-display text-gold-100 mb-2">
              {t('headline')}
            </h3>
            <p className="text-gold-700 text-sm max-w-md mx-auto">
              {t('subheadline')}
            </p>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-gold-400 animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="py-12 text-center text-gold-700">
              {t('noPlans')}
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan, i) => {
                const Icon = ICONS[i] || Sparkles;
                const isSelected = selectedId === plan.id;
                const features = getFeatures(plan);
                const discount = getDiscountLabel(plan);
                const price = getPrice(plan);
                const perMonth = getPricePerMonth(plan);

                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedId(plan.id)}
                    className={cn(
                      'relative text-left p-5 rounded-2xl transition-all',
                      'border-2',
                      isSelected
                        ? 'border-gold-500 bg-gradient-gold-soft scale-[1.02] glow-gold'
                        : 'border-gold-900/30 bg-midnight-800/40 hover:border-gold-700/60 hover:bg-midnight-800/60'
                    )}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-gradient-gold text-midnight-950 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-gold-500/30">
                        ⭐ {t('mostPopular')}
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center',
                            isSelected
                              ? 'bg-gold-500/20'
                              : 'bg-midnight-700/60'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              isSelected ? 'text-gold-300' : 'text-gold-500'
                            )}
                          />
                        </div>
                        <div>
                          <div className="text-base font-medium text-gold-100">
                            {t(`plans.${plan.slug}.name`)}
                          </div>
                          <div className="text-xs text-gold-700 mt-0.5">
                            {plan.duration_months === 1
                              ? t('perMonth')
                              : plan.duration_months === 12
                              ? t('perYear')
                              : t('perPeriod', { months: plan.duration_months })}
                          </div>
                        </div>
                      </div>

                      {discount && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-700/40 text-emerald-300 text-[10px] font-medium">
                          {discount}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        {locale === 'uz' || locale === 'tr' ? (
                          <>
                            <span className="text-3xl font-bold text-gold-100">
                              {currency.format(price)}
                            </span>
                            <span className="text-sm text-gold-700">{currency.symbol}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gold-700">{currency.symbol}</span>
                            <span className="text-3xl font-bold text-gold-100">
                              {currency.format(price)}
                            </span>
                          </>
                        )}
                      </div>
                      {plan.duration_months > 1 && (
                        <div className="text-xs text-gold-700 mt-0.5">
                          ≈ {currency.symbol}{perMonth} / {t('shortMonth')}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-1.5">
                      {features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gold-200/80"
                        >
                          <Check className="h-3.5 w-3.5 mt-0.5 text-gold-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          )}

          {/* CTA */}
          {plans.length > 0 && (
            <div className="mt-6 sticky bottom-0 pb-2">
              <button
                disabled={!selectedId}
                onClick={() => {
                  alert(t('comingSoon'));
                }}
                className={cn(
                  'w-full py-3.5 rounded-xl font-semibold text-base',
                  'transition-all flex items-center justify-center gap-2',
                  selectedId
                    ? 'bg-gradient-gold text-midnight-950 hover:scale-[1.02] active:scale-[0.98] glow-gold'
                    : 'bg-midnight-700/60 text-gold-700 cursor-not-allowed'
                )}
              >
                {selectedId ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t('subscribe')}
                  </>
                ) : (
                  t('selectPlan')
                )}
              </button>
              <p className="text-center text-[11px] text-gold-700/60 mt-2">
                {t('disclaimer')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
