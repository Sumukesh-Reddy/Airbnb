'use client';

import { useState, useRef, useEffect } from 'react';
import { Users, Minus, Plus } from 'lucide-react';

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

interface GuestSelectorProps {
  value: GuestCounts;
  onChange: (guests: GuestCounts) => void;
  maxGuests?: number;
  compact?: boolean;
}

const GUEST_TYPES = [
  { key: 'adults' as const, label: 'Adults', sublabel: 'Ages 13 or above', min: 1 },
  { key: 'children' as const, label: 'Children', sublabel: 'Ages 2–12', min: 0 },
  { key: 'infants' as const, label: 'Infants', sublabel: 'Under 2', min: 0 },
];

export default function GuestSelector({
  value,
  onChange,
  maxGuests = 16,
  compact = false,
}: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = value.adults + value.children;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (type: keyof GuestCounts, delta: number) => {
    const guestType = GUEST_TYPES.find((g) => g.key === type)!;
    const newValue = value[type] + delta;
    if (newValue < guestType.min) return;
    if (type !== 'infants' && total + delta > maxGuests) return;
    onChange({ ...value, [type]: newValue });
  };

  const guestLabel = () => {
    if (total === 0) return 'Add guests';
    let label = `${total} guest${total !== 1 ? 's' : ''}`;
    if (value.infants > 0) label += `, ${value.infants} infant${value.infants !== 1 ? 's' : ''}`;
    return label;
  };

  if (compact) {
    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>{total > 0 ? `${total} guest${total !== 1 ? 's' : ''}` : 'Guests'}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 p-5 z-50">
            {GUEST_TYPES.map((guestType) => (
              <div key={guestType.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{guestType.label}</div>
                  <div className="text-xs text-gray-500">{guestType.sublabel}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleChange(guestType.key, -1)}
                    disabled={value[guestType.key] <= guestType.min}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center
                      hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-gray-800">
                    {value[guestType.key]}
                  </span>
                  <button
                    onClick={() => handleChange(guestType.key, 1)}
                    disabled={guestType.key !== 'infants' && total >= maxGuests}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center
                      hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className={`text-sm font-medium truncate ${total === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
              {guestLabel()}
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 p-5 z-50">
          {GUEST_TYPES.map((guestType) => (
            <div key={guestType.key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-800">{guestType.label}</div>
                <div className="text-xs text-gray-500">{guestType.sublabel}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleChange(guestType.key, -1)}
                  disabled={value[guestType.key] <= guestType.min}
                  className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center
                    hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-3.5 h-3.5 text-gray-700" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-gray-900">
                  {value[guestType.key]}
                </span>
                <button
                  onClick={() => handleChange(guestType.key, 1)}
                  disabled={guestType.key !== 'infants' && total >= maxGuests}
                  className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center
                    hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-700" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full text-right text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
