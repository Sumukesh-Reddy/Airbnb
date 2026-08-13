'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import LocationSelector from './LocationSelector';
import DateRangePicker from './DateRangePicker';
import GuestSelector from './GuestSelector';

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
  tab = 'homes',
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

  if (variant === 'navbar') {
    const isService = tab === 'services';
    const isExp = tab === 'experiences';

    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setActivePanel(activePanel ? null : 'location')}
          className="flex items-center gap-2.5 border border-gray-300 rounded-full px-4 py-2 shadow-sm 
            hover:shadow-md transition-all duration-200 bg-white"
        >
          {isService && <span className="text-base leading-none">🛎️</span>}
          {isExp && <span className="text-base leading-none">🎈</span>}

          <span className="text-sm font-semibold text-gray-800 max-w-24 truncate">
            {location || 'Anywhere'}
          </span>
          <span className="h-4 w-px bg-gray-300" />
          <span className="text-sm font-medium text-gray-700">
            {checkIn && checkOut
              ? `${formatDisplayDate(checkIn)} – ${formatDisplayDate(checkOut)}`
              : 'Anytime'}
          </span>
          <span className="h-4 w-px bg-gray-300" />
          <span className="text-sm text-gray-500">
            {isService
              ? 'Add service'
              : isExp
              ? 'Add experience'
              : totalGuests > 1
              ? `${totalGuests} guests`
              : 'Add guests'}
          </span>
          <span className="bg-rose-500 rounded-full p-1.5 ml-1 flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-white" />
          </span>
        </button>

        {/* Expanded Dropdown */}
        {activePanel && (
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl 
            border border-gray-100 p-1 z-50 flex min-w-[700px]">
            {/* Location */}
            <div className={`flex-1 rounded-xl px-4 py-3 cursor-pointer transition-colors
              ${activePanel === 'location' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              onClick={() => setActivePanel('location')}
            >
              <div className="text-xs font-semibold text-gray-700 mb-1">Where</div>
              <LocationSelector
                value={location}
                onChange={(val) => { setLocation(val); if (val) setActivePanel('checkIn'); }}
              />
            </div>

            {/* Check In */}
            <div className={`flex-1 rounded-xl px-4 py-3 cursor-pointer transition-colors
              ${activePanel === 'checkIn' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              onClick={() => setActivePanel('checkIn')}
            >
              <div className="text-xs font-semibold text-gray-700 mb-1">Check in</div>
              <div className="text-sm text-gray-500">
                {formatDisplayDate(checkIn) || 'Add dates'}
              </div>
            </div>

            {/* Check Out */}
            <div className={`flex-1 rounded-xl px-4 py-3 cursor-pointer transition-colors
              ${activePanel === 'checkOut' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              onClick={() => setActivePanel('checkOut')}
            >
              <div className="text-xs font-semibold text-gray-700 mb-1">Check out</div>
              <div className="text-sm text-gray-500">
                {formatDisplayDate(checkOut) || 'Add dates'}
              </div>
            </div>

            {/* Guests + Search */}
            <div className={`flex-1 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors
              ${activePanel === 'guests' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              onClick={() => setActivePanel('guests')}
            >
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-700 mb-1">Who</div>
                <div className="text-sm text-gray-500">
                  {totalGuests > 1 ? `${totalGuests} guests` : 'Add guests'}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-full p-3 transition-all hover:scale-105 flex-shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Date Picker Dropdown */}
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

        {/* Guest Dropdown */}
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

  // Hero variant - large search bar
  return (
    <div ref={containerRef} className="w-full max-w-3xl relative">
      <div className="bg-white rounded-3xl sm:rounded-full border border-gray-200 shadow-xl flex flex-col sm:flex-row sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {/* Location */}
        <div
          className={`w-full sm:flex-1 flex items-center gap-2 px-5 py-3.5 cursor-pointer rounded-t-3xl sm:rounded-l-full transition-colors
            ${activePanel === 'location' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActivePanel('location')}
        >
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700">Where</div>
            <div className={`text-sm truncate ${location ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {location || 'Search destinations'}
            </div>
          </div>
        </div>

        {/* Check In */}
        <div
          className={`w-full sm:w-auto flex items-center gap-2 px-5 py-3.5 cursor-pointer transition-colors
            ${activePanel === 'checkIn' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActivePanel('checkIn')}
        >
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-gray-700">Check in</div>
            <div className={`text-sm ${checkIn ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {formatDisplayDate(checkIn) || 'Add dates'}
            </div>
          </div>
        </div>

        {/* Check Out */}
        <div
          className={`w-full sm:w-auto flex items-center gap-2 px-5 py-3.5 cursor-pointer transition-colors
            ${activePanel === 'checkOut' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActivePanel('checkOut')}
        >
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-gray-700">Check out</div>
            <div className={`text-sm ${checkOut ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {formatDisplayDate(checkOut) || 'Add dates'}
            </div>
          </div>
        </div>

        {/* Guests + Search Button */}
        <div className={`w-full sm:w-auto flex items-center gap-3 pl-5 pr-2 py-2.5 cursor-pointer rounded-b-3xl sm:rounded-r-full transition-colors
          ${activePanel === 'guests' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActivePanel('guests')}
        >
          <div>
            <div className="text-xs font-semibold text-gray-700">Who</div>
            <div className={`text-sm ${totalGuests > 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {totalGuests > 1 ? `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}` : 'Add guests'}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleSearch(); }}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-5 py-3.5 font-medium text-sm
              transition-all hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Dropdowns */}
      {activePanel === 'location' && (
        <div className="absolute top-full mt-3 left-0 w-72 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Popular Destinations
            </div>
            {[
              { city: 'Goa', emoji: '🏖️' },
              { city: 'Manali', emoji: '🏔️' },
              { city: 'Udaipur', emoji: '🏰' },
              { city: 'Mumbai', emoji: '🌆' },
              { city: 'Coorg', emoji: '☕' },
              { city: 'Jaipur', emoji: '🕌' },
              { city: 'Alleppey', emoji: '🛶' },
              { city: 'Rishikesh', emoji: '🧘' },
            ].map((loc) => (
              <button
                key={loc.city}
                onClick={() => { setLocation(loc.city); setActivePanel('checkIn'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {loc.emoji}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-800">{loc.city}</div>
                  <div className="text-xs text-gray-500">India</div>
                </div>
              </button>
            ))}
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
        <div className="absolute top-full mt-3 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72">
          {[
            { key: 'adults' as const, label: 'Adults', sublabel: 'Ages 13 or above', min: 1 },
            { key: 'children' as const, label: 'Children', sublabel: 'Ages 2–12', min: 0 },
            { key: 'infants' as const, label: 'Infants', sublabel: 'Under 2', min: 0 },
          ].map((guestType) => (
            <div key={guestType.key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-800">{guestType.label}</div>
                <div className="text-xs text-gray-500">{guestType.sublabel}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); const newVal = guests[guestType.key] - 1; if (newVal >= guestType.min) setGuests({ ...guests, [guestType.key]: newVal }); }}
                  disabled={guests[guestType.key] <= guestType.min}
                  className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="text-gray-700 font-medium text-lg leading-none">−</span>
                </button>
                <span className="w-6 text-center text-sm font-semibold text-gray-900">
                  {guests[guestType.key]}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); const total = guests.adults + guests.children; if (guestType.key !== 'infants' && total >= 16) return; setGuests({ ...guests, [guestType.key]: guests[guestType.key] + 1 }); }}
                  className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-700 transition-all"
                >
                  <span className="text-gray-700 font-medium text-lg leading-none">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
