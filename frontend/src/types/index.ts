export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  is_host: boolean;
  bio?: string;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
  category?: string;
}

export interface ListingImage {
  id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
  listing_id?: number;
}

export interface HostInfo {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  created_at: string;
}

export interface ListingCard {
  id: number;
  title: string;
  location: string;
  city: string;
  country: string;
  property_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  avg_rating?: number;
  review_count: number;
  primary_image?: string;
  images: ListingImage[];
  host: HostInfo;
  is_favorite: boolean;
  badge_label?: string;
  item_type?: 'home' | 'experience' | 'service';
  pricing_type?: 'night' | 'guest' | 'group';
}

export interface ListingDetail extends ListingCard {
  description: string;
  latitude?: number;
  longitude?: number;
  amenities: Amenity[];
  created_at: string;
}

export interface ListingsResponse {
  items: ListingCard[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_price: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_ref: string;
  special_requests?: string;
  created_at: string;
  listing?: ListingCard;
  guest?: User;
}

export interface Review {
  id: number;
  listing_id: number;
  reviewer_id: number;
  rating: number;
  comment?: string;
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location_rating?: number;
  value?: number;
  created_at: string;
  reviewer: User;
}

export interface ReviewsResponse {
  items: Review[];
  total: number;
  avg_rating: number;
  avg_cleanliness?: number;
  avg_accuracy?: number;
  avg_communication?: number;
  avg_location?: number;
  avg_value?: number;
}

export interface AvailabilityResponse {
  is_available: boolean;
  booked_dates: { check_in: string; check_out: string }[];
  price_per_night: number;
  cleaning_fee: number;
  service_fee_rate: number;
}

export interface ListingFilters {
  location?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  guests?: number;
  amenities?: string;
  min_rating?: number;
  check_in?: string;
  check_out?: string;
  page?: number;
  per_page?: number;
  sort?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'cabin'
  | 'beach_house'
  | 'treehouse'
  | 'houseboat'
  | 'farm_stay'
  | 'heritage'
  | 'studio';
