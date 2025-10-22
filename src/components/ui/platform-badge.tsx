import { cn } from '@/lib/utils';
import type * as React from 'react';

interface PlatformBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  platform: 'polymarket' | 'kalshi';
}

export function PlatformBadge({ platform, className, ...props }: PlatformBadgeProps) {
  const label = platform === 'polymarket' ? 'PM' : 'KA';

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        'w-10 h-6 rounded-sm',
        'font-mono font-semibold text-[10px] text-white uppercase tracking-wide',
        'shadow-sm',
        platform === 'polymarket' ? 'bg-polymarket' : 'bg-kalshi',
        className
      )}
      {...props}
    >
      {label}
    </div>
  );
}
