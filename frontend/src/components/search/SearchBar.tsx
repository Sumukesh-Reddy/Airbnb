'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import LocationSelector from './LocationSelector';
import DateRangePicker from './DateRangePicker';
import GuestSelector from './GuestSelector';

const POPULAR_DESTINATIONS = [
  { city: 'Goa', emoji: '🏖️' },
  { city: 'Manali', emoji: '🏔️' },
  { city: 'Udaipur', emoji: '🏰' },
  { city: 'Mumbai', emoji: '🌆' },
  { city: 'Coorg', emoji: '☕' },
  { city: 'Jaipur', emoji: '🕌' },
  { city: 'Alleppey', emoji: '🛶' },
  { city: 'Rishikesh', emoji: '🧘' },
];

interface SearchBarProps {
  initialLocation?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onSearch?: (params: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => void;
  variant?: 'hero' | 'navbar';
  tab?: string;
}

export default function SearchBar({
  initialLocation = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
  onSearch,
  variant = 'hero',
  tab = 'all',
}: SearchBarProps) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<'location' | 'checkIn' | 'checkOut' | 'guests' | null>(null);
  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState({ adults: initialGuests, children: 0, infants: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const totalGuests = guests.adults + guests.children;
    const params = { location, checkIn, checkOut, guests: totalGuests };

    if (onSearch) {
      onSearch(params);
      setActivePanel(null);
    } else {
      const query = new URLSearchParams();
      if (location) query.set('location', location);
      if (checkIn) query.set('check_in', checkIn);
      if (checkOut) query.set('check_out', checkOut);
      if (totalGuests > 1) query.set('guests', String(totalGuests));
      if (tab) query.set('tab', tab);
      router.push(`/search?${query.toString()}`);
      setActivePanel(null);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch {
      return null;
    }
  };

  const totalGuests = guests.adults + guests.children;

  const getTabIcon = () => {
    if (tab === 'homes') return '🏡';
    if (tab === 'experiences') return '🎈';
    if (tab === 'services') return '🛎️';
    return '🌐';
  };

  // Image 3: Compact Navbar Search Pill
  if (variant === 'navbar') {
    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setActivePanel(activePanel ? null : 'location')}
          className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 shadow-sm 
            hover:shadow-md transition-all duration-200 bg-white group cursor-pointer"
        >
          <span className="text-base leading-none">{getTabIcon()}</span>

          <span className="text-sm font-semibold text-gray-800 max-w-28 truncate">
            {location || 'Anywhere'}
          </span>

          <span className="h-4 w-px bg-gray-300" />

          <span className="text-sm font-semibold text-gray-800">
            {checkIn && checkOut
              ? `${formatDisplayDate(checkIn)} – ${formatDisplayDate(checkOut)}`
              : 'Anytime'}
          </span>

          <span className="h-4 w-px bg-gray-300" />

          <span className="text-sm text-gray-500 font-normal">
            {totalGuests > 1 ? `${totalGuests} guests` : 'Add guests'}
          </span>

          <span className="bg-[#FF385C] rounded-full p-2 ml-1 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Search className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </span>
        </button>

        {/* Dropdown in compact navbar mode */}
        {activePanel && (
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl 
            border border-gray-100 p-2 z-50 flex min-w-[700px]">
            <div className={`flex-1 rounded-2xl px-4 py-3 cursor-pointer transition-colors
              ${activePanel === 'location' ? 'bg-gray-100/70' : 'hover:bg-gray-50'}`}
              onClick={() => setActivePanel('location')}
            >
              <div className="text-xs font-bold text-gray-800 mb-0.5">Where</div>
              <LocationSelector
                value={location}
                onChange={setLocation}
              />
            </div>

            <div className={`flex-1 rounded-2xl px-4 py-3 cursor-pointer transition-colors
              ${activePanel === 'checkIn' ? 'bg-gray-100/70' : 'hover:bg-gray-50'}`}
              onClick={() => setActivePanel('checkIn')}
            >
              <div className="text-xs font-bold text-gray-800 mb-0.5">When</div>
              <div className="text-sm text-gray-500">
                {formatDisplayDate(checkIn) || 'Add dates'}
              </div>
            </div>

            <div className={`flex-1 rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors
              ${activePanel === 'guests' ? 'bg-gray-100/70' : 'hover:bg-gray-50'}`}
              onClick={() => setActivePanel('guests')}
            >
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-800 mb-0.5">Who</div>
                <div className="text-sm text-gray-500">
                  {totalGuests > 1 ? `${totalGuests} guests` : 'Add guests'}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                className="bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-full p-3.5 transition-all hover:scale-105 flex-shrink-0 shadow-md"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {(activePanel === 'checkIn' || activePanel === 'checkOut') && (
          <div className="absolute top-full mt-16 left-1/2 -translate-x-1/2 z-50">
            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onSelect={(ci, co) => {
                setCheckIn(ci);
                setCheckOut(co);
                if (ci && co) setActivePanel('guests');
              }}
              onClose={() => setActivePanel('guests')}
            />
          </div>
        )}

        {activePanel === 'guests' && (
          <div className="absolute top-full mt-16 right-0 z-50">
            <GuestSelector
              value={guests}
              onChange={setGuests}
            />
          </div>
        )}
      </div>
    );
  }

  // Image 2: Large Hero Expanded Search Bar
  return (
    <div ref={containerRef} className="w-full max-w-4xl relative">
      <div className="bg-white rounded-full border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 flex items-center divide-x divide-gray-200">
        {/* Where (Segment 1) */}
        <div
          className={`flex-[1.4] flex items-center gap-3 px-7 py-3.5 cursor-pointer rounded-l-full transition-colors
            ${activePanel === 'location' ? 'bg-gray-100/70 shadow-inner' : 'hover:bg-gray-50'}`}
          onClick={() => setActivePanel('location')}
        >
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-800 tracking-tight mb-0.5">Where</div>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onFocus={() => setActivePanel('location')}
              placeholder="Search destinations"
              aria-label="Search destinations"
              className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* When (Segment 2) */}
        <div
          className={`flex-1 flex items-center gap-3 px-7 py-3.5 cursor-pointer transition-colors
            ${activePanel === 'checkIn' || activePanel === 'checkOut' ? 'bg-gray-100/70 shadow-inner' : 'hover:bg-gray-50'}`}
          onClick={() => setActivePanel('checkIn')}
        >
          <div>
            <div className="text-xs font-bold text-gray-800 tracking-tight mb-0.5">When</div>
            <div className={`text-sm ${checkIn ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {formatDisplayDate(checkIn) || 'Add dates'}
            </div>
          </div>
        </div>

        {/* Who (Segment 3) + Search Button */}
        <div
          className={`flex-1 flex items-center justify-between pl-7 pr-2 py-2 cursor-pointer rounded-r-full transition-colors
            ${activePanel === 'guests' ? 'bg-gray-100/70 shadow-inner' : 'hover:bg-gray-50'}`}
          onClick={() => setActivePanel('guests')}
        >
          <div>
            <div className="text-xs font-bold text-gray-800 tracking-tight mb-0.5">Who</div>
            <div className={`text-sm ${totalGuests > 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {totalGuests > 1 ? `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}` : 'Add guests'}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleSearch(); }}
            className="bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-full w-12 h-12 flex items-center justify-center
              transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-md"
          >
            <Search className="w-5 h-5 text-white stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Dropdowns for Hero Search Bar */}
      {activePanel === 'location' && (
        <div className="absolute top-full mt-3 left-0 w-80 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-3">
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Popular Destinations
            </div>
            {POPULAR_DESTINATIONS.filter((loc) =>
              loc.city.toLowerCase().includes(location.toLowerCase())
            ).map((loc) => (
              <button
                key={loc.city}
                onClick={() => { setLocation(loc.city); setActivePanel('checkIn'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-left"
              >
                <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {loc.emoji}
                </span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{loc.city}</div>
                  <div className="text-xs text-gray-500">India</div>
                </div>
              </button>
            ))}
            {POPULAR_DESTINATIONS.every((loc) =>
              !loc.city.toLowerCase().includes(location.toLowerCase())
            ) && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">Use “{location}” as your destination</div>
            )}
          </div>
        </div>
      )}

      {(activePanel === 'checkIn' || activePanel === 'checkOut') && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onSelect={(ci, co) => {
              setCheckIn(ci);
              setCheckOut(co);
              if (ci && co) setActivePanel('guests');
              else if (ci) setActivePanel('checkOut');
            }}
            onClose={() => setActivePanel('guests')}
          />
        </div>
      )}

      {activePanel === 'guests' && (
        <div className="absolute top-full mt-3 right-0 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 w-80">
          {[
            { key: 'adults' as const, label: 'Adults', sublabel: 'Ages 13 or above', min: 1 },
            { key: 'children' as const, label: 'Children', sublabel: 'Ages 2–12', min: 0 },
            { key: 'infants' as const, label: 'Infants', sublabel: 'Under 2', min: 0 },
          ].map((guestType) => (
            <div key={guestType.key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
              <div>
                <div className="text-sm font-semibold text-gray-900">{guestType.label}</div>
                <div className="text-xs text-gray-500">{guestType.sublabel}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); const newVal = guests[guestType.key] - 1; if (newVal >= guestType.min) setGuests({ ...guests, [guestType.key]: newVal }); }}
                  disabled={guests[guestType.key] <= guestType.min}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="text-gray-700 font-bold text-lg leading-none">−</span>
                </button>
                <span className="w-6 text-center text-sm font-bold text-gray-900">
                  {guests[guestType.key]}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); const total = guests.adults + guests.children; if (guestType.key !== 'infants' && total >= 16) return; setGuests({ ...guests, [guestType.key]: guests[guestType.key] + 1 }); }}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-all"
                >
                  <span className="text-gray-700 font-bold text-lg leading-none">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
