'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface GenrePillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function GenrePill({ label, selected, onClick, disabled, className }: GenrePillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all',
        'border',
        selected
          ? 'bg-gradient-gold text-midnight-950 border-transparent font-semibold shadow-lg shadow-gold-900/30'
          : 'bg-midnight-700/40 text-gold-200 border-gold-900/40 hover:border-gold-700/60 hover:bg-midnight-600/40',
        disabled && 'opacity-30 cursor-not-allowed',
        className
      )}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </button>
  );
}
