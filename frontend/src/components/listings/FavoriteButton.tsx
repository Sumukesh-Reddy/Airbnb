'use client';

import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { addFavorite, removeFavorite } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/Toast';

interface FavoriteButtonProps {
  listingId: number;
  isFavorite: boolean;
  onToggle?: (newState: boolean) => void;
}

export default function FavoriteButton({
  listingId,
  isFavorite,
  onToggle,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(isFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast('Please log in to save listings', 'info');
        return;
      }

      if (isLoading) return;
      setIsLoading(true);

      try {
        if (favorited) {
          await removeFavorite(listingId);
          setFavorited(false);
          onToggle?.(false);
          toast('Removed from wishlist', 'info');
        } else {
          await addFavorite(listingId);
          setFavorited(true);
          onToggle?.(true);
          toast('Saved to wishlist', 'success');
        }
      } catch {
        toast('Something went wrong', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [favorited, isLoading, listingId, user, onToggle]
  );

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="group relative p-2 rounded-full transition-transform hover:scale-110 active:scale-95"
      aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`w-6 h-6 transition-all duration-200 drop-shadow-sm
          ${favorited
            ? 'fill-rose-500 text-rose-500'
            : 'fill-black/20 text-white group-hover:fill-black/30'
          }
        `}
      />
    </button>
  );
}
