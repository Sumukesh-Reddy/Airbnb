'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { ListingFilters } from '@/types';
import { SlidersHorizontal } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
}

const PROPERTY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'beach_house', label: '🏖️ Beach House' },
  { value: 'cabin', label: '🏔️ Cabin' },
  { value: 'villa', label: '🏛️ Villa' },
  { value: 'treehouse', label: '🌳 Treehouse' },
  { value: 'houseboat', label: '⛵ Houseboat' },
  { value: 'heritage', label: '🕌 Heritage' },
  { value: 'farm_stay', label: '🌾 Farm Stay' },
  { value: 'apartment', label: '🏢 Apartment' },
  { value: 'house', label: '🏡 House' },
  { value: 'studio', label: '🛏️ Studio' },
];

export default function FilterModal({ isOpen, onClose, filters, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<ListingFilters>(filters);

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters" size="md">
      <div className="p-6 space-y-6">
        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Price range (per night)</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Min (₹)</label>
              <input
                type="number"
                value={localFilters.min_price || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="text-gray-400 mt-5">—</div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Max (₹)</label>
              <input
                type="number"
                value={localFilters.max_price || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Any"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Property type</h3>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setLocalFilters({ ...localFilters, property_type: type.value || undefined })}
                className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all
                  ${localFilters.property_type === type.value || (!localFilters.property_type && type.value === '')
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum rating</h3>
          <div className="flex items-center gap-2">
            {[4, 4.5, 4.8].map((rating) => (
              <button
                key={rating}
                onClick={() => setLocalFilters({ ...localFilters, min_rating: localFilters.min_rating === rating ? undefined : rating })}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all
                  ${localFilters.min_rating === rating
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
              >
                ★ {rating}+
              </button>
            ))}
          </div>
        </div>

        {/* Guests */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum guests capacity</h3>
          <div className="flex items-center gap-2">
            {[2, 4, 6, 8, 10].map((g) => (
              <button
                key={g}
                onClick={() => setLocalFilters({ ...localFilters, guests: localFilters.guests === g ? undefined : g })}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all
                  ${localFilters.guests === g
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
              >
                {g}+
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="text-sm font-semibold text-gray-700 underline hover:text-gray-900 transition-colors"
        >
          Clear all
        </button>
        <button
          onClick={handleApply}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold
            hover:bg-gray-800 transition-all hover:scale-[1.02]"
        >
          Show results
        </button>
      </div>
    </Modal>
  );
}
