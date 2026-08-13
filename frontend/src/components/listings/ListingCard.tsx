'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ListingCard } from '@/types';
import { formatPrice, getPropertyTypeLabel } from '@/lib/utils';
import Rating from '@/components/ui/Rating';
import FavoriteButton from './FavoriteButton';

interface ListingCardProps {
  listing: ListingCard;
  badgeText?: string;
  isGuestFavourite?: boolean;
  onFavoriteToggle?: (id: number, newState: boolean) => void;
  nights?: number;
}

export default function ListingCardComponent({
  listing,
  badgeText,
  isGuestFavourite,
  onFavoriteToggle,
  nights = 2,
}: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite);
  const touchStartX = useRef(0);

  const images = listing.images && listing.images.length > 0
    ? listing.images.sort((a, b) => a.display_order - b.display_order).map(img => img.url)
    : listing.primary_image
      ? [listing.primary_image]
      : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'];

  const goToPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) {
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
    }
  };

  const handleFavoriteToggle = (newState: boolean) => {
    setIsFavorite(newState);
    onFavoriteToggle?.(listing.id, newState);
  };

  const badgeToDisplay = listing.badge_label
    ? listing.badge_label
    : isGuestFavourite
    ? 'Guest favourite'
    : badgeText || getPropertyTypeLabel(listing.property_type);

  const totalPrice = formatPrice(listing.price_per_night * nights);
  const singlePrice = formatPrice(listing.price_per_night);

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="relative min-w-full h-full flex-shrink-0">
              <Image
                src={src}
                alt={`${listing.title} - image ${i + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Nav Arrows */}
        {images.length > 1 && isHovered && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={goToPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm
                  rounded-full p-1.5 shadow-md hover:bg-white transition-all hover:scale-110 z-10"
              >
                <ChevronLeft className="w-4 h-4 text-gray-800" />
              </button>
            )}
            {currentImageIndex < images.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm
                  rounded-full p-1.5 shadow-md hover:bg-white transition-all hover:scale-110 z-10"
              >
                <ChevronRight className="w-4 h-4 text-gray-800" />
              </button>
            )}
          </>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(i);
                }}
                className={`rounded-full transition-all ${
                  i === currentImageIndex
                    ? 'bg-white w-2 h-2'
                    : 'bg-white/60 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton
            listingId={listing.id}
            isFavorite={isFavorite}
            onToggle={handleFavoriteToggle}
          />
        </div>

        {/* Property Type or Badge */}
        {badgeToDisplay && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold
              px-3 py-1 rounded-full shadow-sm border border-gray-100 flex items-center gap-1">
              {listing.badge_label === 'Original' && <span>✏️</span>}
              <span>{badgeToDisplay}</span>
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
          {listing.title}
        </h3>

        {listing.location && (
          <p className="text-xs text-gray-500 line-clamp-1">{listing.location}</p>
        )}

        <div className="text-gray-600 text-sm flex items-center gap-1.5">
          {listing.pricing_type === 'guest' ? (
            <span>From {singlePrice} / guest</span>
          ) : listing.pricing_type === 'group' ? (
            <span>From {singlePrice} / group</span>
          ) : (
            <span>{totalPrice} for {nights} nights</span>
          )}

          {listing.avg_rating ? (
            <span className="flex items-center gap-0.5 text-gray-900 font-medium">
              <span>·</span>
              <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900 ml-0.5" />
              <span>{listing.avg_rating.toFixed(listing.avg_rating % 1 === 0 ? 1 : 2)}</span>
            </span>
          ) : (
            <span className="text-xs text-gray-500 font-medium">· New</span>
          )}
        </div>
      </div>
    </Link>
  );
}
