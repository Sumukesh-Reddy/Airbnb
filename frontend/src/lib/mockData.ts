import { ListingDetail, ListingCard, Review, ReviewsResponse, AvailabilityResponse, Booking } from '@/types';

export const MOCK_LISTINGS_FULL: ListingDetail[] = [
  {
    id: 101,
    title: 'Flat in Benaulim',
    description: 'Beautiful modern 2-bedroom flat located just 5 minutes walk from pristine Benaulim Beach in South Goa. Features AC, high-speed WiFi, private balcony, fully equipped kitchen, and access to a shared swimming pool.',
    location: 'Benaulim, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 5000,
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    avg_rating: 5.0,
    review_count: 28,
    is_favorite: false,
    created_at: '2025-01-15T00:00:00Z',
    host: {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Superhost from Goa. Passionate about sharing beautiful spaces and providing top hospitality.',
      created_at: '2023-05-10T00:00:00Z',
    },
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', is_primary: true, display_order: 1 },
      { id: 2, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', is_primary: false, display_order: 2 },
      { id: 3, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', is_primary: false, display_order: 3 },
    ],
    amenities: [
      { id: 1, name: 'WiFi', icon: 'wifi', category: 'basics' },
      { id: 2, name: 'Air conditioning', icon: 'wind', category: 'basics' },
      { id: 3, name: 'Swimming pool', icon: 'waves', category: 'features' },
      { id: 4, name: 'Kitchen', icon: 'utensils', category: 'basics' },
      { id: 5, name: 'Free parking', icon: 'car', category: 'basics' },
    ],
  },
  {
    id: 102,
    title: 'Home in Varca',
    description: 'Charming Portuguese-style family home surrounded by coconut palms in Varca. Spacious patio, lush green garden, and quiet residential neighborhood near Varca Beach.',
    location: 'Varca, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'house',
    price_per_night: 7199,
    max_guests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3,
    avg_rating: 4.91,
    review_count: 42,
    is_favorite: false,
    created_at: '2025-02-01T00:00:00Z',
    host: {
      id: 2,
      name: 'Rahul Mehra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Property host focused on clean, peaceful coastal stays in Goa.',
      created_at: '2023-08-12T00:00:00Z',
    },
    images: [
      { id: 4, url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', is_primary: true, display_order: 1 },
      { id: 5, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', is_primary: false, display_order: 2 },
    ],
    amenities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 2, name: 'Air conditioning', icon: 'wind' },
      { id: 5, name: 'Free parking', icon: 'car' },
    ],
  },
  {
    id: 103,
    title: 'Villa in Dabolim',
    description: 'Luxury modern 4-bedroom villa with private infinity pool and panoramic valley views in Dabolim, Goa. Fully furnished with high-end appliances, garden deck, and 24/7 security.',
    location: 'Dabolim, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 12472,
    max_guests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4,
    avg_rating: 5.0,
    review_count: 19,
    is_favorite: false,
    created_at: '2025-01-20T00:00:00Z',
    host: {
      id: 3,
      name: 'Ananya Krishna',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      bio: 'Curator of luxury retreats and villas across India.',
      created_at: '2022-11-04T00:00:00Z',
    },
    images: [
      { id: 6, url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', is_primary: true, display_order: 1 },
      { id: 7, url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', is_primary: false, display_order: 2 },
    ],
    amenities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 2, name: 'Air conditioning', icon: 'wind' },
      { id: 3, name: 'Swimming pool', icon: 'waves' },
    ],
  },
  {
    id: 104,
    title: 'Flat in Benaulim',
    description: 'Cozy and serene 1-bedroom flat in Benaulim, South Goa. Ideal for couples or solo travelers looking for relaxation near the beach.',
    location: 'Benaulim, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 2850,
    max_guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    avg_rating: 4.87,
    review_count: 35,
    is_favorite: false,
    created_at: '2025-03-01T00:00:00Z',
    host: {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: '2023-05-10T00:00:00Z',
    },
    images: [
      { id: 8, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 105,
    title: 'Apartment in Varca',
    description: 'Sunny pool-facing 2-bedroom apartment in a gated resort complex in Varca, Goa.',
    location: 'Varca, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 3484,
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    avg_rating: 4.88,
    review_count: 22,
    is_favorite: false,
    created_at: '2025-02-14T00:00:00Z',
    host: {
      id: 2,
      name: 'Rahul Mehra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: '2023-08-12T00:00:00Z',
    },
    images: [
      { id: 9, url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 106,
    title: 'Flat in Benaulim',
    description: 'Bright 2-bedroom vacation rental with pool view, high speed fiber internet, and full kitchen.',
    location: 'Benaulim, South Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 4565,
    max_guests: 4,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    avg_rating: 5.0,
    review_count: 50,
    is_favorite: false,
    created_at: '2025-01-10T00:00:00Z',
    host: {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: '2023-05-10T00:00:00Z',
    },
    images: [
      { id: 10, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 201,
    title: 'Flat in Calangute',
    description: 'Modern 2-bedroom beachside flat in Calangute, North Goa. Close to famous restaurants and nightlife.',
    location: 'Calangute, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 7089,
    max_guests: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    avg_rating: 4.84,
    review_count: 31,
    is_favorite: false,
    created_at: '2025-02-18T00:00:00Z',
    host: {
      id: 4,
      name: 'Vikram Patel',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      created_at: '2023-01-15T00:00:00Z',
    },
    images: [
      { id: 11, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 202,
    title: 'Home in Baga',
    description: 'Spacious private home with garden near Baga Beach, North Goa.',
    location: 'Baga, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'house',
    price_per_night: 10710,
    max_guests: 8,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3,
    avg_rating: 4.93,
    review_count: 64,
    is_favorite: false,
    created_at: '2025-01-05T00:00:00Z',
    host: {
      id: 4,
      name: 'Vikram Patel',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      created_at: '2023-01-15T00:00:00Z',
    },
    images: [
      { id: 12, url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 203,
    title: 'Apartment in Vagator',
    description: 'Designer 1-bedroom apartment near Chapora Fort and Ozran Beach in Vagator, Goa.',
    location: 'Vagator, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 7000,
    max_guests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    avg_rating: 4.92,
    review_count: 48,
    is_favorite: false,
    created_at: '2025-02-20T00:00:00Z',
    host: {
      id: 3,
      name: 'Ananya Krishna',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      created_at: '2022-11-04T00:00:00Z',
    },
    images: [
      { id: 13, url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 204,
    title: 'Villa in Assagao',
    description: 'Ultra-luxurious Portuguese villa with private plunge pool set in peaceful Assagao.',
    location: 'Assagao, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 17667,
    max_guests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4,
    avg_rating: 5.0,
    review_count: 15,
    is_favorite: false,
    created_at: '2025-01-28T00:00:00Z',
    host: {
      id: 3,
      name: 'Ananya Krishna',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      created_at: '2022-11-04T00:00:00Z',
    },
    images: [
      { id: 14, url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 205,
    title: 'Villa in Candolim',
    description: 'Charming 3-bedroom villa with private pool near Candolim Beach.',
    location: 'Candolim, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 6676,
    max_guests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    avg_rating: 4.84,
    review_count: 39,
    is_favorite: false,
    created_at: '2025-02-05T00:00:00Z',
    host: {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: '2023-05-10T00:00:00Z',
    },
    images: [
      { id: 15, url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 206,
    title: 'Villa in Anjuna',
    description: 'Contemporary villa with swimming pool near Anjuna flea market.',
    location: 'Anjuna, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'villa',
    price_per_night: 10231,
    max_guests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3,
    avg_rating: 4.97,
    review_count: 57,
    is_favorite: false,
    created_at: '2025-01-12T00:00:00Z',
    host: {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: '2023-05-10T00:00:00Z',
    },
    images: [
      { id: 16, url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 207,
    title: 'Flat in Nerul',
    description: 'Rustic modern loft studio overlooking Mandovi river in Nerul, Goa.',
    location: 'Nerul, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'apartment',
    price_per_night: 12500,
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    avg_rating: 5.0,
    review_count: 20,
    is_favorite: false,
    created_at: '2025-02-25T00:00:00Z',
    host: {
      id: 4,
      name: 'Vikram Patel',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      created_at: '2023-01-15T00:00:00Z',
    },
    images: [
      { id: 17, url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 1,
    title: 'Stunning Beachfront Villa in North Goa',
    description: 'Wake up to the sound of waves in this breathtaking beachfront villa. Located directly on Anjuna Beach, this private retreat features a private pool, lush tropical garden, and panoramic ocean views from every room.',
    location: 'Anjuna Beach, North Goa',
    city: 'Goa',
    country: 'India',
    property_type: 'beach_house',
    price_per_night: 18500,
    max_guests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4,
    avg_rating: 4.9,
    review_count: 47,
    is_favorite: false,
    created_at: '2025-01-01T00:00:00Z',
    host: {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: '2023-05-10T00:00:00Z',
    },
    images: [
      { id: 18, url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', is_primary: true, display_order: 1 },
      { id: 19, url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', is_primary: false, display_order: 2 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
  {
    id: 3,
    title: 'Cedar Wood Cabin with Himalayan Views',
    description: 'Escape to this stunning hand-crafted cedar cabin perched at 2,200m in the Kullu Valley. With floor-to-ceiling windows framing dramatic snow-capped peaks.',
    location: 'Solang Valley, Manali',
    city: 'Manali',
    country: 'India',
    property_type: 'cabin',
    price_per_night: 9200,
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    avg_rating: 4.95,
    review_count: 89,
    is_favorite: false,
    created_at: '2025-01-08T00:00:00Z',
    host: {
      id: 2,
      name: 'Rahul Mehra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: '2023-08-12T00:00:00Z',
    },
    images: [
      { id: 20, url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', is_primary: true, display_order: 1 },
    ],
    amenities: [{ id: 1, name: 'WiFi', icon: 'wifi' }],
  },
];

export function getMockReviews(listingId: number): ReviewsResponse {
  return {
    items: [
      {
        id: 1,
        listing_id: listingId,
        reviewer_id: 10,
        rating: 5,
        comment: 'Absolutely magical stay! The property was spotless, beautiful views, and top-tier hospitality.',
        cleanliness: 5.0,
        accuracy: 5.0,
        communication: 5.0,
        location_rating: 5.0,
        value: 5.0,
        created_at: '2025-03-01T00:00:00Z',
        reviewer: {
          id: 10,
          name: 'Aarav Mehta',
          email: 'aarav@example.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          is_host: false,
          created_at: '2024-01-01T00:00:00Z',
        },
      },
      {
        id: 2,
        listing_id: listingId,
        reviewer_id: 11,
        rating: 5,
        comment: 'Super peaceful environment, close to the beach/attractions. Will definitely visit again!',
        cleanliness: 4.9,
        accuracy: 5.0,
        communication: 5.0,
        location_rating: 4.8,
        value: 4.9,
        created_at: '2025-02-20T00:00:00Z',
        reviewer: {
          id: 11,
          name: 'Neha Kapoor',
          email: 'neha@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          is_host: false,
          created_at: '2024-02-01T00:00:00Z',
        },
      },
    ],
    total: 2,
    avg_rating: 4.95,
    avg_cleanliness: 4.95,
    avg_accuracy: 5.0,
    avg_communication: 5.0,
    avg_location: 4.9,
    avg_value: 4.95,
  };
}

export function getMockAvailability(listingId: number): AvailabilityResponse {
  return {
    is_available: true,
    booked_dates: [
      { check_in: '2026-08-20', check_out: '2026-08-23' },
      { check_in: '2026-09-01', check_out: '2026-09-05' },
    ],
    price_per_night: 5000,
    cleaning_fee: 500,
    service_fee_rate: 0.1,
  };
}

// In-memory / LocalStorage booking store for fallback state
const mockBookingsMap: Map<number, Booking> = new Map();

export function saveMockBooking(booking: Booking): void {
  mockBookingsMap.set(booking.id, booking);
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock_bookings');
      const list: Booking[] = stored ? JSON.parse(stored) : [];
      const updated = [booking, ...list.filter(b => b.id !== booking.id)];
      localStorage.setItem('mock_bookings', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
}

export function getSavedMockBooking(id: number): Booking | undefined {
  if (mockBookingsMap.has(id)) return mockBookingsMap.get(id);
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock_bookings');
      if (stored) {
        const list: Booking[] = JSON.parse(stored);
        const found = list.find(b => b.id === Number(id));
        if (found) return found;
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
  }
  return undefined;
}

export function getSavedMockBookingsList(): Booking[] {
  const inMemory = Array.from(mockBookingsMap.values());
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mock_bookings');
      if (stored) {
        const list: Booking[] = JSON.parse(stored);
        const map = new Map<number, Booking>();
        inMemory.forEach(b => map.set(b.id, b));
        list.forEach(b => map.set(b.id, b));
        return Array.from(map.values());
      }
    } catch (e) {
      console.error('Failed to read bookings list:', e);
    }
  }
  return inMemory;
}
