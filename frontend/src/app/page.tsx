'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getListings } from '@/lib/api';
import { ListingCard as ListingCardType, ListingFilters } from '@/types';
import SearchBar from '@/components/search/SearchBar';
import CategoryBar from '@/components/search/CategoryBar';
import ListingCardComponent from '@/components/listings/ListingCard';
import ListingGrid from '@/components/listings/ListingGrid';
import { ListingGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { SlidersHorizontal, ChevronRight, ChevronLeft, ArrowRight, Tag } from 'lucide-react';
import FilterModal from '@/components/search/FilterModal';
import Image from 'next/image';
import Link from 'next/link';

// Mock data matching Image 2 exactly
const SOUTH_GOA_HOMES: (Partial<ListingCardType> & { isGuestFavourite?: boolean })[] = [
  {
    id: 101,
    title: 'Flat in Benaulim',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 5000,
    avg_rating: 5.0,
    review_count: 28,
    is_favorite: false,
    isGuestFavourite: true,
    images: [
      { id: 1, listing_id: 101, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', is_primary: true, display_order: 1 },
      { id: 2, listing_id: 101, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', is_primary: false, display_order: 2 },
    ],
  },
  {
    id: 102,
    title: 'Home in Varca',
    city: 'Goa',
    country: 'India',
    property_type: 'house',
    price_per_night: 7199.5,
    avg_rating: 4.91,
    review_count: 42,
    is_favorite: false,
    isGuestFavourite: true,
    images: [
      { id: 3, listing_id: 102, url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', is_primary: true, display_order: 1 },
      { id: 4, listing_id: 102, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', is_primary: false, display_order: 2 },
    ],
  },
  {
    id: 103,
    title: 'Villa in Dabolim',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 12472,
    avg_rating: 5.0,
    review_count: 19,
    is_favorite: false,
    isGuestFavourite: false,
    images: [
      { id: 5, listing_id: 103, url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', is_primary: true, display_order: 1 },
      { id: 6, listing_id: 103, url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', is_primary: false, display_order: 2 },
    ],
  },
  {
    id: 104,
    title: 'Flat in Benaulim',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 2850,
    avg_rating: 4.87,
    review_count: 35,
    is_favorite: false,
    isGuestFavourite: true,
    images: [
      { id: 7, listing_id: 104, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 105,
    title: 'Apartment in Varca',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 3484.5,
    avg_rating: 4.88,
    review_count: 22,
    is_favorite: false,
    isGuestFavourite: false,
    images: [
      { id: 8, listing_id: 105, url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 106,
    title: 'Flat in Benaulim',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 4565,
    avg_rating: 5.0,
    review_count: 50,
    is_favorite: false,
    isGuestFavourite: true,
    images: [
      { id: 9, listing_id: 106, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', is_primary: true, display_order: 1 },
    ],
  },
];

const NORTH_GOA_HOMES: (Partial<ListingCardType> & { isGuestFavourite?: boolean })[] = [
  {
    id: 201,
    title: 'Flat in Calangute',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 7089,
    avg_rating: 4.84,
    review_count: 31,
    is_favorite: false,
    isGuestFavourite: false,
    images: [
      { id: 10, listing_id: 201, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 202,
    title: 'Home in Baga',
    city: 'Goa',
    country: 'India',
    property_type: 'house',
    price_per_night: 10710,
    avg_rating: 4.93,
    review_count: 64,
    is_favorite: false,
    isGuestFavourite: false,
    images: [
      { id: 11, listing_id: 202, url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 203,
    title: 'Apartment in Vagator',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 7000,
    avg_rating: 4.92,
    review_count: 48,
    is_favorite: false,
    isGuestFavourite: true,
    images: [
      { id: 12, listing_id: 203, url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 204,
    title: 'Villa in Assagao',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 17667,
    avg_rating: 5.0,
    review_count: 15,
    is_favorite: false,
    isGuestFavourite: false,
    images: [
      { id: 13, listing_id: 204, url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 205,
    title: 'Villa in Candolim',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 6676,
    avg_rating: 4.84,
    review_count: 39,
    is_favorite: false,
    isGuestFavourite: false,
    images: [
      { id: 14, listing_id: 205, url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 206,
    title: 'Villa in Anjuna',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 10231,
    avg_rating: 4.97,
    review_count: 57,
    is_favorite: false,
    isGuestFavourite: true,
    images: [
      { id: 15, listing_id: 206, url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', is_primary: true, display_order: 1 },
    ],
  },
  {
    id: 207,
    title: 'Flat in Nerul',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 12500,
    avg_rating: 5.0,
    review_count: 20,
    is_favorite: false,
    isGuestFavourite: false,
    images: [
      { id: 16, listing_id: 207, url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800', is_primary: true, display_order: 1 },
    ],
  },
];

export default function HomePage() {
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [includeFees, setIncludeFees] = useState(true);

  const southGoaRef = useRef<HTMLDivElement>(null);
  const northGoaRef = useRef<HTMLDivElement>(null);

  const fetchListings = useCallback(async (activeFilters: ListingFilters) => {
    setIsLoading(true);
    try {
      const response = await getListings({ ...activeFilters, per_page: 20 });
      if (response && response.items && response.items.length > 0) {
        setListings(response.items);
        setTotalResults(response.total);
      }
    } catch (error) {
      console.error('API call skipped/failed, fallback used:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters((prev) => ({ ...prev, property_type: category || undefined }));
  };

  const handleSearch = (params: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    setFilters({
      location: params.location || undefined,
      check_in: params.checkIn || undefined,
      check_out: params.checkOut || undefined,
      guests: params.guests > 1 ? params.guests : undefined,
      property_type: selectedCategory || undefined,
    });
  };

  const handleFavoriteToggle = (id: number, newState: boolean) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_favorite: newState } : l))
    );
  };

  const handleFiltersApply = (newFilters: ListingFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setShowFilters(false);
  };

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Header & Search Section (Image 1 Style) */}
      <div className="bg-gradient-to-b from-rose-50/60 to-white pt-8 pb-10 px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Find your perfect stay
          </h1>
          <p className="text-gray-500 text-lg">
            Discover unique homes across India – from beachfront villas to Himalayan cabins
          </p>
        </div>

        <div className="flex justify-center px-4">
          <SearchBar
            onSearch={handleSearch}
            variant="hero"
          />
        </div>
      </div>

      {/* Category Bar + Filter Button */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <CategoryBar
              selected={selectedCategory}
              onChange={handleCategoryChange}
            />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="flex-shrink-0 flex items-center gap-2 border border-gray-300 rounded-xl 
              px-4 py-2.5 text-sm font-semibold text-gray-800 hover:border-gray-900 hover:bg-gray-50
              transition-all duration-200 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content Sections (Image 2 Style) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Section 1: Popular homes in South Goa */}
        <div>
          {/* Section Title & Controls */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 group cursor-pointer">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Popular homes in South Goa
              </h2>
              <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(southGoaRef, 'left')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                  hover:border-gray-900 hover:scale-105 transition-all text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel(southGoaRef, 'right')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                  hover:border-gray-900 hover:scale-105 transition-all text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listing Cards Carousel Row */}
          <div
            ref={southGoaRef}
            className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SOUTH_GOA_HOMES.map((item) => (
              <div key={item.id} className="min-w-[240px] sm:min-w-[260px] md:min-w-[270px] flex-shrink-0">
                <ListingCardComponent
                  listing={item as ListingCardType}
                  isGuestFavourite={item.isGuestFavourite}
                  nights={2}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}

            {/* "See all" Card (Exact Image 2 representation) */}
            <div className="min-w-[240px] sm:min-w-[260px] md:min-w-[270px] flex-shrink-0 flex items-center justify-center">
              <Link
                href="/search?location=South%20Goa"
                className="w-full h-full min-h-[300px] border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all duration-300 bg-white text-center group"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Stacked photos graphics */}
                  <div className="absolute w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shadow-md transform -rotate-12 translate-x-[-12px] group-hover:-rotate-16 transition-transform">
                    <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300" alt="stay" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute w-16 h-16 rounded-xl bg-gray-300 overflow-hidden shadow-lg transform rotate-12 translate-x-[12px] group-hover:rotate-16 transition-transform z-10">
                    <img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=300" alt="stay" className="w-full h-full object-cover" />
                  </div>
                </div>

                <span className="font-bold text-gray-900 text-sm group-hover:underline">
                  See all
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 2: Available next month in North Goa */}
        <div>
          {/* Section Title & Controls */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 group cursor-pointer">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Available next month in North Goa
              </h2>
              <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(northGoaRef, 'left')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                  hover:border-gray-900 hover:scale-105 transition-all text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel(northGoaRef, 'right')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                  hover:border-gray-900 hover:scale-105 transition-all text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listing Cards Carousel Row */}
          <div
            ref={northGoaRef}
            className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NORTH_GOA_HOMES.map((item) => (
              <div key={item.id} className="min-w-[240px] sm:min-w-[260px] md:min-w-[270px] flex-shrink-0">
                <ListingCardComponent
                  listing={item as ListingCardType}
                  isGuestFavourite={item.isGuestFavourite}
                  nights={2}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Database / Live listings fallback grid if category selected */}
        {selectedCategory && (
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              All {selectedCategory.replace('_', ' ')} Listings
            </h3>
            {isLoading ? (
              <ListingGridSkeleton count={8} />
            ) : (
              <ListingGrid
                listings={listings}
                onFavoriteToggle={handleFavoriteToggle}
              />
            )}
          </div>
        )}

      </div>

      {/* Floating Bottom Pill - Image 2 Style */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIncludeFees(!includeFees)}
          className="bg-white border border-gray-200 text-gray-900 text-sm font-semibold
            px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200
            flex items-center gap-2.5 backdrop-blur-md"
        >
          <Tag className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Prices include all fees</span>
        </button>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleFiltersApply}
      />
    </div>
  );
}
