'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getListings } from '@/lib/api';
import { ListingCard as ListingCardType, ListingFilters } from '@/types';
import SearchBar from '@/components/search/SearchBar';
import CategoryBar from '@/components/search/CategoryBar';
import ListingCardComponent from '@/components/listings/ListingCard';
import ListingGrid from '@/components/listings/ListingGrid';
import { ListingGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { SlidersHorizontal, ChevronRight, ChevronLeft, ArrowRight, Tag } from 'lucide-react';
import FilterModal from '@/components/search/FilterModal';
import { MOCK_EXPERIENCES, MOCK_SERVICES } from '@/lib/mockData';
import Image from 'next/image';
import Link from 'next/link';

// Mock data matching reference Screenshots
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

const PALOLEM_HOMES: (Partial<ListingCardType> & { isGuestFavourite?: boolean })[] = [
  {
    id: 107,
    title: 'Home in Varca',
    location: 'Varca, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'house',
    price_per_night: 7199.5,
    avg_rating: 4.91,
    review_count: 42,
    is_favorite: false,
    isGuestFavourite: true,
    images: [{ id: 107, listing_id: 107, url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', is_primary: true, display_order: 1 }],
  },
  {
    id: 108,
    title: 'Flat in Canacona',
    location: 'Canacona, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 6000,
    avg_rating: 5.0,
    review_count: 30,
    is_favorite: false,
    images: [{ id: 108, listing_id: 108, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', is_primary: true, display_order: 1 }],
  },
  {
    id: 109,
    title: 'Apartment in Canacona',
    location: 'Canacona, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 6904.5,
    avg_rating: 4.93,
    review_count: 18,
    is_favorite: false,
    isGuestFavourite: true,
    images: [{ id: 109, listing_id: 109, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', is_primary: true, display_order: 1 }],
  },
  {
    id: 110,
    title: 'Apartment in Canacona',
    location: 'Canacona, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 4907.5,
    avg_rating: 5.0,
    review_count: 24,
    is_favorite: false,
    images: [{ id: 110, listing_id: 110, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', is_primary: true, display_order: 1 }],
  },
  {
    id: 111,
    title: 'Flat in Canacona',
    location: 'Canacona, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 4925,
    avg_rating: 4.93,
    review_count: 36,
    is_favorite: false,
    images: [{ id: 111, listing_id: 111, url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', is_primary: true, display_order: 1 }],
  },
  {
    id: 112,
    title: 'Flat in Chauri',
    location: 'Chauri, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 2599,
    avg_rating: 5.0,
    review_count: 15,
    is_favorite: false,
    isGuestFavourite: true,
    images: [{ id: 112, listing_id: 112, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', is_primary: true, display_order: 1 }],
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
];

function HomeContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'homes';

  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [includeFees, setIncludeFees] = useState(true);

  const southGoaRef = useRef<HTMLDivElement>(null);
  const palolemRef = useRef<HTMLDivElement>(null);
  const northGoaRef = useRef<HTMLDivElement>(null);
  const expOriginalsRef = useRef<HTMLDivElement>(null);
  const expParisRef = useRef<HTMLDivElement>(null);
  const servicesLARef = useRef<HTMLDivElement>(null);
  const servicesLDNRef = useRef<HTMLDivElement>(null);

  const fetchListings = useCallback(async (activeFilters: ListingFilters) => {
    setIsLoading(true);
    try {
      const response = await getListings({ ...activeFilters, per_page: 20 });
      if (response?.items) {
        setListings(response.items);
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
    setFilters(newFilters);
    setSelectedCategory(newFilters.property_type || '');
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
      {/* Reservation Banner (Screenshot 1 Pill) */}
      {currentTab !== 'experiences' && currentTab !== 'services' && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex justify-center">
            <Link
              href="/listings/101"
              className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150"
                  alt="Reservation"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Complete your South Goa home reservation <span className="text-gray-500 font-normal">21–23 Aug · 1 guest</span> →
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Category Bar + Filter Button */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
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

      {/* MAIN SECTIONS BY TAB */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ================= EXPERIENCES TAB (Screenshot 2 & 4 & 5) ================= */}
        {currentTab === 'experiences' && (
          <>
            {/* Section: Airbnb Originals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Airbnb Originals
                  </h2>
                  <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollCarousel(expOriginalsRef, 'left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollCarousel(expOriginalsRef, 'right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-5">Hosted by the world&apos;s most interesting people</p>

              <div ref={expOriginalsRef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth">
                {MOCK_EXPERIENCES.map((exp) => (
                  <div key={exp.id} className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0">
                    <ListingCardComponent listing={exp} nights={1} onFavoriteToggle={handleFavoriteToggle} />
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Popular with travellers from your area / Experiences in Paris */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Popular with travellers from your area</h2>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <h3 className="text-lg font-bold text-gray-700">Experiences in Paris</h3>
                  <ArrowRight className="w-4 h-4 text-gray-700" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollCarousel(expParisRef, 'left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollCarousel(expParisRef, 'right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div ref={expParisRef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth">
                {MOCK_EXPERIENCES.slice(0, 5).map((exp, i) => (
                  <div key={exp.id + i} className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0">
                    <ListingCardComponent listing={{ ...exp, badge_label: 'Trending' }} nights={1} onFavoriteToggle={handleFavoriteToggle} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= SERVICES TAB (Screenshot 3) ================= */}
        {currentTab === 'services' && (
          <>
            {/* Section: Services in Los Angeles */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Services in Los Angeles
                  </h2>
                  <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollCarousel(servicesLARef, 'left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollCarousel(servicesLARef, 'right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div ref={servicesLARef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth">
                {MOCK_SERVICES.slice(0, 7).map((srv) => (
                  <div key={srv.id} className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0">
                    <ListingCardComponent listing={srv} nights={1} onFavoriteToggle={handleFavoriteToggle} />
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Services in London */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Services in London
                  </h2>
                  <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollCarousel(servicesLDNRef, 'left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollCarousel(servicesLDNRef, 'right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div ref={servicesLDNRef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth">
                {MOCK_SERVICES.slice(2, 9).map((srv, i) => (
                  <div key={srv.id + i} className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0">
                    <ListingCardComponent listing={srv} nights={1} onFavoriteToggle={handleFavoriteToggle} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Database / Category Filtered Listings Grid */}
        {selectedCategory ? (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {selectedCategory.replace('_', ' ')} Properties
              </h2>
              <button
                onClick={() => handleCategoryChange('')}
                className="text-sm font-semibold text-rose-600 hover:underline"
              >
                Clear filter & show all
              </button>
            </div>
            {isLoading ? (
              <ListingGridSkeleton count={8} />
            ) : listings.length > 0 ? (
              <ListingGrid listings={listings} onFavoriteToggle={handleFavoriteToggle} />
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-lg font-bold text-gray-800">No properties found in this category</p>
                <button
                  onClick={() => handleCategoryChange('')}
                  className="mt-4 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-all"
                >
                  View all stays
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ================= HOMES / ALL TAB (Screenshot 1 & 2) ================= */}
            {currentTab !== 'experiences' && currentTab !== 'services' && (
              <>
                {/* Carousel 1: Popular homes in South Goa */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        Popular homes in South Goa
                      </h2>
                      <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => scrollCarousel(southGoaRef, 'left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => scrollCarousel(southGoaRef, 'right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div ref={southGoaRef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth">
                    {SOUTH_GOA_HOMES.map((item) => (
                      <div key={item.id} className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0">
                        <ListingCardComponent listing={item as ListingCardType} isGuestFavourite={item.isGuestFavourite} nights={2} onFavoriteToggle={handleFavoriteToggle} />
                      </div>
                    ))}
                    <div className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0 flex items-center justify-center">
                      <Link href="/search?location=South%20Goa" className="w-full h-full min-h-[280px] border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all bg-white text-center group">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <div className="absolute w-14 h-14 rounded-xl bg-gray-200 overflow-hidden shadow-md transform -rotate-12 translate-x-[-10px]">
                            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300" alt="stay" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute w-14 h-14 rounded-xl bg-gray-300 overflow-hidden shadow-lg transform rotate-12 translate-x-[10px] z-10">
                            <img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=300" alt="stay" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 text-sm group-hover:underline">See all</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Carousel 2: Stay near Palolem Beach (Screenshot 1) */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        Stay near Palolem Beach
                      </h2>
                      <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => scrollCarousel(palolemRef, 'left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => scrollCarousel(palolemRef, 'right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div ref={palolemRef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth">
                    {PALOLEM_HOMES.map((item) => (
                      <div key={item.id} className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0">
                        <ListingCardComponent listing={item as ListingCardType} isGuestFavourite={item.isGuestFavourite} nights={2} onFavoriteToggle={handleFavoriteToggle} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel 3: Available next month in North Goa */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        Available next month in North Goa
                      </h2>
                      <ArrowRight className="w-5 h-5 text-gray-900 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => scrollCarousel(northGoaRef, 'left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => scrollCarousel(northGoaRef, 'right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div ref={northGoaRef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-2 px-2 scroll-smooth">
                    {NORTH_GOA_HOMES.map((item) => (
                      <div key={item.id} className="w-[240px] sm:w-[260px] md:w-[270px] flex-shrink-0">
                        <ListingCardComponent listing={item as ListingCardType} isGuestFavourite={item.isGuestFavourite} nights={2} onFavoriteToggle={handleFavoriteToggle} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Floating Bottom Fee Pill */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIncludeFees(!includeFees)}
          className="bg-white border border-gray-200 text-gray-900 text-sm font-semibold
            px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all
            flex items-center gap-2.5 backdrop-blur-md"
        >
          <Tag className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Prices include all fees</span>
        </button>
      </div>

      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleFiltersApply}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
