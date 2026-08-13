'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFavorites, removeFavorite } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/Toast';
import { ListingGridSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Heart, MapPin, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface FavoriteItem {
  id: number;
  listing_id: number;
  user_id: number;
  created_at: string;
  listing?: {
    id: number;
    title: string;
    city: string;
    country: string;
    price_per_night: number;
    avg_rating?: number;
    review_count: number;
    primary_image?: string;
    images: { id: number; url: string; is_primary: boolean; display_order: number }[];
  };
}

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    loadFavorites();
  }, [user, authLoading]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data as FavoriteItem[]);
    } catch {
      toast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId: number) => {
    setRemovingId(listingId);
    try {
      await removeFavorite(listingId);
      setFavorites((prev) => prev.filter((f) => f.listing_id !== listingId));
      toast('Removed from wishlist', 'info');
    } catch {
      toast('Failed to remove', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Log in to see your wishlist</h2>
          <Link href="/" className="text-rose-500 font-medium underline">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wishlist</h1>
        <p className="text-gray-500 mb-8">
          {favorites.length > 0 ? `${favorites.length} saved place${favorites.length !== 1 ? 's' : ''}` : ''}
        </p>

        {loading ? (
          <ListingGridSkeleton count={8} />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No saved places yet"
            description="As you explore, tap the heart icon to save places you love."
            icon="heart"
            action={
              <Link href="/" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                Explore places
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav) => {
              const listing = fav.listing;
              if (!listing) return null;
              const img = listing.images?.find((i) => i.is_primary)?.url || listing.images?.[0]?.url || listing.primary_image;

              return (
                <div key={fav.id} className="group relative">
                  <Link href={`/listings/${listing.id}`}>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                      {img ? (
                        <Image
                          src={img}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">🏠</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{listing.city}, {listing.country}</h3>
                        {listing.avg_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-gray-800 text-gray-800" />
                            <span className="text-xs font-semibold">{listing.avg_rating.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-1">{listing.title}</p>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(listing.price_per_night)}<span className="font-normal text-gray-500"> / night</span></p>
                    </div>
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(listing.id)}
                    disabled={removingId === listing.id}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform z-10"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
