'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const POPULAR_LOCATIONS = [
  { city: 'Goa', country: 'India', emoji: '🏖️' },
  { city: 'Manali', country: 'India', emoji: '🏔️' },
  { city: 'Udaipur', country: 'India', emoji: '🏰' },
  { city: 'Mumbai', country: 'India', emoji: '🌆' },
  { city: 'Coorg', country: 'India', emoji: '☕' },
  { city: 'Jaipur', country: 'India', emoji: '🕌' },
  { city: 'Alleppey', country: 'India', emoji: '🛶' },
  { city: 'Rishikesh', country: 'India', emoji: '🧘' },
  { city: 'Shimla', country: 'India', emoji: '❄️' },
  { city: 'Munnar', country: 'India', emoji: '🌿' },
  { city: 'Darjeeling', country: 'India', emoji: '🍵' },
  { city: 'Andaman', country: 'India', emoji: '🐠' },
];

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function LocationSelector({
  value,
  onChange,
  placeholder = 'Where are you going?',
  compact = false,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = POPULAR_LOCATIONS.filter(
    (loc) =>
      !inputValue ||
      loc.city.toLowerCase().includes(inputValue.toLowerCase()) ||
      loc.country.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (city: string) => {
    setInputValue(city);
    onChange(city);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  };

  if (compact) {
    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span className="max-w-24 truncate">{value || 'Anywhere'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 w-56 z-50 overflow-hidden">
            <div className="p-2">
              {POPULAR_LOCATIONS.map((loc) => (
                <button
                  key={loc.city}
                  onClick={() => handleSelect(loc.city)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-lg">{loc.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{loc.city}</div>
                    <div className="text-xs text-gray-500">{loc.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 
            focus:outline-none text-sm font-medium"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl 
          border border-gray-100 z-50 overflow-hidden min-w-[240px]">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Popular Destinations
            </div>
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">No locations found</div>
            ) : (
              filtered.map((loc) => (
                <button
                  key={loc.city}
                  onClick={() => handleSelect(loc.city)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 
                    transition-colors text-left"
                >
                  <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {loc.emoji}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{loc.city}</div>
                    <div className="text-xs text-gray-500">{loc.country}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
