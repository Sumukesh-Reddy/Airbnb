'use client';

import { Award } from 'lucide-react';

interface SuperhostBadgeProps {
  variant?: 'pill' | 'text' | 'card';
}

export default function SuperhostBadge({ variant = 'pill' }: SuperhostBadgeProps) {
  if (variant === 'text') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-900">
        <Award className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>Superhost</span>
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold">
        <Award className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
        <span>Superhost</span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-gray-200">
      <Award className="w-3 h-3 text-rose-500 fill-rose-500" />
      <span>Superhost</span>
    </span>
  );
}
