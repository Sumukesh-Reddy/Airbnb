'use client';

import { useState } from 'react';
import { ListingCard } from '@/types';
import { formatPrice } from '@/lib/utils';
import { MapPin, Navigation, ZoomIn, ZoomOut, X, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ListingMapProps {
  listings: ListingCard[];
  selectedId?: number;
  onSelectListing?: (id: number) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export default function ListingMap({
  listings,
  selectedId,
  onSelectListing,
  height = '450px',
}: ListingMapProps) {
  const [activeListing, setActiveListing] = useState<ListingCard | null>(
    listings.find((l) => l.id === selectedId) || null
  );
  const [zoomLevel, setZoomLevel] = useState(12);

  const handlePinClick = (listing: ListingCard) => {
    setActiveListing(listing);
    onSelectListing?.(listing.id);
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-slate-100 flex flex-col justify-between p-4"
      style={{ height }}
    >
      {/* Map Graphic / Grid background */}
      <div className="absolute inset-0 bg-[#e5e3df] opacity-90 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000000" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Stylized river/roads overlay inside SVG */}
          <path
            d="M -50 150 Q 200 80 400 220 T 900 180"
            fill="none"
            stroke="#a2daf2"
            strokeWidth="24"
          />
          <path
            d="M 100 -50 Q 150 200 350 450"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
          />
        </svg>
      </div>

      {/* Map Header / Location Tag */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-gray-200 flex items-center gap-2 text-xs font-semibold text-gray-800">
          <Navigation className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Interactive Map View ({listings.length} stays)</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-gray-200">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 6))}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pins Layer */}
      <div className="relative z-10 my-auto flex flex-wrap items-center justify-center gap-4 py-8 pointer-events-auto">
        {listings.slice(0, 8).map((listing, idx) => {
          const isSelected = activeListing?.id === listing.id;
          return (
            <button
              key={listing.id}
              onClick={() => handlePinClick(listing)}
              className={`transition-all duration-200 transform hover:scale-110 flex items-center gap-1
                ${
                  isSelected
                    ? 'bg-gray-900 text-white z-30 scale-110 shadow-xl ring-4 ring-rose-500/30'
                    : 'bg-white text-gray-900 z-20 shadow-md hover:z-30 hover:bg-gray-900 hover:text-white'
                }
                px-3 py-1.5 rounded-full font-bold text-xs border border-gray-200`}
              style={{
                transform: `translate(${(idx % 4 - 1.5) * 18}px, ${(Math.floor(idx / 4) - 0.5) * 20}px)`,
              }}
            >
              <span>{formatPrice(listing.price_per_night)}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Listing Popup Card */}
      {activeListing && (
        <div className="relative z-20 pointer-events-auto animate-modal-in max-w-sm mx-auto w-full">
          <div className="bg-white rounded-2xl p-3 shadow-2xl border border-gray-200 flex items-center gap-3 relative">
            <button
              onClick={() => setActiveListing(null)}
              className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 shadow-md hover:bg-gray-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <Image
                src={
                  activeListing.primary_image ||
                  activeListing.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
                }
                alt={activeListing.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="truncate">{activeListing.city}, {activeListing.country}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm truncate mt-0.5">
                {activeListing.title}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-sm text-gray-900">
                  {formatPrice(activeListing.price_per_night)} <span className="text-xs font-normal text-gray-500">/ night</span>
                </span>
                {activeListing.avg_rating && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-900">
                    <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
                    <span>{activeListing.avg_rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
              <Link
                href={`/listings/${activeListing.id}`}
                className="text-xs font-bold text-rose-500 hover:underline mt-1 block"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
