'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getListings } from '@/lib/api';
import { ListingCard, ListingFilters } from '@/types';
import ListingGrid from '@/components/listings/ListingGrid';
import { ListingGridSkeleton } from '@/components/ui/LoadingSkeleton';
import SearchBar from '@/components/search/SearchBar';
import CategoryBar from '@/components/search/CategoryBar';
import FilterModal from '@/components/search/FilterModal';
import ListingMap from '@/components/map/ListingMap';
import { SlidersHorizontal, Map as MapIcon, Grid as GridIcon } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<ListingCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('property_type') || '');

  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = searchParams.get('guests') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const minRating = searchParams.get('min_rating') || '';
  const propertyType = searchParams.get('property_type') || '';

  useEffect(() => {
    fetchListings();
  }, [searchParams, selectedCategory, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page,
        per_page: 20,
      };
      if (location) params.location = location;
      if (checkIn) params.check_in = checkIn;
      if (checkOut) params.check_out = checkOut;
      if (guests) params.guests = Number(guests);
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);
      if (minRating) params.min_rating = Number(minRating);
      if (selectedCategory || propertyType) params.property_type = selectedCategory || propertyType;

      const response = await getListings(params);
      setListings(response.items);
      setTotal(response.total);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params: { location: string; checkIn: string; checkOut: string; guests: number }) => {
    const query = new URLSearchParams(searchParams.toString());
    if (params.location) query.set('location', params.location);
    else query.delete('location');
    if (params.checkIn) query.set('check_in', params.checkIn);
    else query.delete('check_in');
    if (params.checkOut) query.set('check_out', params.checkOut);
    else query.delete('check_out');
    if (params.guests > 1) query.set('guests', String(params.guests));
    else query.delete('guests');
    setPage(1);
    router.push(`/search?${query.toString()}`);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const query = new URLSearchParams(searchParams.toString());
    if (cat) query.set('property_type', cat);
    else query.delete('property_type');
    setPage(1);
    router.push(`/search?${query.toString()}`);
  };

  const handleFiltersApply = (filters: ListingFilters) => {
    const query = new URLSearchParams(searchParams.toString());
    if (filters.min_price !== undefined) query.set('min_price', String(filters.min_price));
    else query.delete('min_price');
    if (filters.max_price !== undefined) query.set('max_price', String(filters.max_price));
    else query.delete('max_price');
    if (filters.min_rating !== undefined) query.set('min_rating', String(filters.min_rating));
    else query.delete('min_rating');
    if (filters.guests !== undefined) query.set('guests', String(filters.guests));
    else query.delete('guests');
    if (filters.property_type) {
      query.set('property_type', filters.property_type);
      setSelectedCategory(filters.property_type);
    } else {
      query.delete('property_type');
      setSelectedCategory('');
    }
    setPage(1);
    router.push(`/search?${query.toString()}`);
    setShowFilters(false);
  };

  const handleFavoriteToggle = (id: number, newState: boolean) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_favorite: newState } : l));
  };

  const currentFilters: ListingFilters = {
    location: location || undefined,
    check_in: checkIn || undefined,
    check_out: checkOut || undefined,
    min_price: minPrice ? Number(minPrice) : undefined,
    max_price: maxPrice ? Number(maxPrice) : undefined,
    min_rating: minRating ? Number(minRating) : undefined,
    guests: guests ? Number(guests) : undefined,
    property_type: selectedCategory || propertyType || undefined,
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Search bar */}
      <div className="border-b border-gray-100 py-4 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <SearchBar
            initialLocation={location}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests ? Number(guests) : 1}
            onSearch={handleSearch}
            variant="hero"
          />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category + Filter bar */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 min-w-0">
            <CategoryBar selected={selectedCategory} onChange={handleCategoryChange} />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="flex-shrink-0 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Results header */}
        <div className="py-4">
          {location ? (
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {loading ? 'Searching...' : `${total.toLocaleString()} place${total !== 1 ? 's' : ''} in ${location}`}
            </h1>
          ) : (
            <p className="text-sm text-gray-500">{loading ? 'Searching...' : `${total.toLocaleString()} place${total !== 1 ? 's' : ''} found`}</p>
          )}
        </div>

        {/* Map View Toggle Section */}
        {showMap ? (
          <div className="mb-8 space-y-6 animate-modal-in">
            <ListingMap listings={listings} height="500px" />
            <ListingGrid listings={listings} onFavoriteToggle={handleFavoriteToggle} />
          </div>
        ) : loading ? (
          <ListingGridSkeleton count={12} />
        ) : (
          <>
            <ListingGrid listings={listings} onFavoriteToggle={handleFavoriteToggle} />

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center gap-3 py-10">
                {page > 1 && (
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                {page * 20 < total && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Next page
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Show Map Floating Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-gray-900 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-2xl hover:bg-black hover:scale-105 transition-all flex items-center gap-2"
        >
          {showMap ? (
            <>
              <span>Show list</span>
              <GridIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show map</span>
              <MapIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={currentFilters}
        onApply={handleFiltersApply}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
