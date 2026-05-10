'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentButtonProps {
  count?: number;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function CommentButton({ count = 0, onClick, size = 'sm', className }: CommentButtonProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={cn(
        'flex items-center gap-1.5 transition-colors text-gold-300/60 hover:text-gold-200',
        className
      )}
      aria-label="Comments"
    >
      <MessageCircle className={iconSize} />
      {count > 0 && <span className="text-xs tabular-nums">{count}</span>}
    </button>
  );
}
