import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
}

export default function Rating({ rating, reviewCount, size = 'md', showEmpty = false }: RatingProps) {
  if (!rating && !showEmpty) return null;

  const starSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div className="flex items-center gap-1">
      <Star className={`${starSize} fill-gray-800 text-gray-800`} />
      <span className={`${textSize} font-semibold text-gray-800`}>
        {rating ? rating.toFixed(2) : 'New'}
      </span>
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className={`${textSize} text-gray-500`}>
          · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
