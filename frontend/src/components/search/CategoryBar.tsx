'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CATEGORIES = [
  { id: '', label: 'All', icon: '🏠' },
  { id: 'beach_house', label: 'Beachfront', icon: '🏖️' },
  { id: 'cabin', label: 'Cabins', icon: '🏔️' },
  { id: 'villa', label: 'Villas', icon: '🏛️' },
  { id: 'treehouse', label: 'Treehouses', icon: '🌳' },
  { id: 'houseboat', label: 'Houseboats', icon: '⛵' },
  { id: 'heritage', label: 'Heritage', icon: '🕌' },
  { id: 'farm_stay', label: 'Farm Stays', icon: '🌾' },
  { id: 'apartment', label: 'Apartments', icon: '🏢' },
  { id: 'house', label: 'Houses', icon: '🏡' },
  { id: 'studio', label: 'Studios', icon: '🛏️' },
];

interface CategoryBarProps {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryBar({ selected, onChange }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="relative flex items-center border-b border-gray-100">
      {/* Left Arrow */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 
            rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
      )}

      {/* Categories Scroll */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-8 overflow-x-auto scrollbar-none py-4 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex flex-col items-center gap-1.5 min-w-fit group transition-all duration-200
              ${selected === cat.id
                ? 'border-b-2 border-gray-900 opacity-100 -mb-px pb-px'
                : 'opacity-60 hover:opacity-100 border-b-2 border-transparent -mb-px pb-px'
              }`}
          >
            <span className="text-2xl leading-none">{cat.icon}</span>
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 
            rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>
      )}
    </div>
  );
}
