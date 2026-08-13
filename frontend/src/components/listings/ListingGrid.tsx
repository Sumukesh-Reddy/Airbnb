'use client';

import { ListingCard } from '@/types';
import ListingCardComponent from './ListingCard';
import EmptyState from '@/components/ui/EmptyState';

interface ListingGridProps {
  listings: ListingCard[];
  onFavoriteToggle?: (id: number, newState: boolean) => void;
}

export default function ListingGrid({ listings, onFavoriteToggle }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description="Try adjusting your filters or searching for a different location."
        icon="search"
        action={
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Clear all filters
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
      {listings.map((listing) => (
        <ListingCardComponent
          key={listing.id}
          listing={listing}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
}
