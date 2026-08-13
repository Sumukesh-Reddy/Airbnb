'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getListing, getReviews, getAvailability } from '@/lib/api';
import { ListingDetail, ReviewsResponse, AvailabilityResponse } from '@/types';
import { formatPrice, formatDate, nightsBetween, calculateTotal, getPropertyTypeLabel } from '@/lib/utils';
import Rating from '@/components/ui/Rating';
import { DetailsPageSkeleton } from '@/components/ui/LoadingSkeleton';
import FavoriteButton from '@/components/listings/FavoriteButton';
import ReviewForm from '@/components/listings/ReviewForm';
import DateRangePicker from '@/components/search/DateRangePicker';
import GuestSelector from '@/components/search/GuestSelector';
import SuperhostBadge from '@/components/ui/SuperhostBadge';
import ListingMap from '@/components/map/ListingMap';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin, Users, Bed, Bath, Home, Star, Calendar,
  Wifi, Wind, Car, Waves, Flame, Leaf, Tv, Coffee, Dumbbell, Zap, Laptop,
  Shield, Award, MessageCircle, Grid, X
} from 'lucide-react';


const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi, wind: Wind, car: Car, waves: Waves, flame: Flame, leaf: Leaf,
  tv: Tv, coffee: Coffee, dumbbell: Dumbbell, zap: Zap, laptop: Laptop,
  users: Users, building: Home, droplets: Waves, bath: Bath,
  thermometer: Flame, umbrella: Shield, mountain: Award, heart: Star,
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params.id);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);


  // Booking state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingData, reviewsData, availData] = await Promise.all([
          getListing(id),
          getReviews(id),
          getAvailability(id),
        ]);
        setListing(listingData);
        setReviews(reviewsData);
        setAvailability(availData);
      } catch {
        toast('Failed to load listing', 'error');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const nights = nightsBetween(checkIn, checkOut);
  const pricing = listing && nights > 0
    ? calculateTotal(listing.price_per_night, nights, availability?.cleaning_fee || listing.price_per_night * 0.1)
    : null;

  const handleReserve = async () => {
    if (!user) {
      toast('Please log in to reserve', 'info');
      return;
    }
    if (!checkIn || !checkOut) {
      toast('Please select check-in and check-out dates', 'info');
      return;
    }
    if (!listing) return;

    const totalGuests = guests.adults + guests.children;
    const query = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      guests: String(totalGuests),
    });
    router.push(`/checkout/${listing.id}?${query.toString()}`);
  };

  if (isLoading) return <DetailsPageSkeleton />;
  if (!listing) return null;

  const images = listing.images.sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {listing.avg_rating && (
                <Rating rating={listing.avg_rating} reviewCount={listing.review_count} />
              )}
              <span className="text-gray-400">·</span>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="font-medium underline cursor-pointer">{listing.city}, {listing.country}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FavoriteButton
                listingId={listing.id}
                isFavorite={listing.is_favorite}
              />
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="relative mb-8">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
            {images.slice(0, 5).map((img, i) => (
              <div
                key={img.id}
                className={`relative overflow-hidden cursor-pointer group
                  ${i === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                onClick={() => setShowAllPhotos(true)}
              >
                <Image
                  src={img.url}
                  alt={`${listing.title} photo ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes={i === 0 ? '50vw' : '25vw'}
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}

            {/* Show all photos button */}
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5
                text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Grid className="w-4 h-4" />
              Show all photos
            </button>
          </div>
        </div>

        {/* Main Content + Booking Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="pb-8 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {getPropertyTypeLabel(listing.property_type)} hosted by {listing.host.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {listing.max_guests} guests
                    </span>
                    {listing.bedrooms > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Home className="w-4 h-4" /> {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4" /> {listing.beds} bed{listing.beds !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4" /> {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {listing.host.avatar ? (
                  <img
                    src={listing.host.avatar}
                    alt={listing.host.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                    {listing.host.name[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            <div className="pb-8 border-b border-gray-100 space-y-5">
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Top-rated host</p>
                  <p className="text-sm text-gray-500">{listing.host.name} has a 4.8+ rating across all their listings</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Free cancellation</p>
                  <p className="text-sm text-gray-500">Cancel before check-in for a full refund</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Homeway cover</p>
                  <p className="text-sm text-gray-500">Every booking includes free protection from listing inaccuracies</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-8 border-b border-gray-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-8 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">What this place offers</h2>
              <div className="grid grid-cols-2 gap-3">
                {(showAllAmenities ? listing.amenities : listing.amenities.slice(0, 10)).map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.icon || ''] || Home;
                  return (
                    <div key={amenity.id} className="flex items-center gap-3 py-1">
                      <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
              {listing.amenities.length > 10 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 border border-gray-800 rounded-xl px-5 py-2.5 text-sm font-semibold
                    text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  {showAllAmenities ? 'Show less' : `Show all ${listing.amenities.length} amenities`}
                </button>
              )}
            </div>

            {/* Date Picker Section */}
            <div className="pb-8 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold text-gray-900">Select dates</h2>
                {checkIn && checkOut && (
                  <span className="text-sm text-gray-500">{nights} night{nights !== 1 ? 's' : ''}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-5">Add your travel dates for exact pricing</p>
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onSelect={(ci, co) => { setCheckIn(ci); setCheckOut(co); }}
                bookedDates={availability?.booked_dates || []}
                compact
              />
              {checkIn && checkOut && (
                <button
                  onClick={() => { setCheckIn(''); setCheckOut(''); }}
                  className="mt-3 text-sm font-medium text-gray-600 underline hover:text-gray-900"
                >
                  Clear dates
                </button>
              )}
            </div>

            {/* Reviews */}
            {reviews && reviews.total > 0 && (
              <div className="pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-5 h-5 fill-gray-900 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {reviews.avg_rating.toFixed(2)} · {reviews.total} review{reviews.total !== 1 ? 's' : ''}
                  </h2>
                </div>

                {/* Rating Breakdown */}
                {reviews.avg_cleanliness && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                      { label: 'Cleanliness', value: reviews.avg_cleanliness },
                      { label: 'Accuracy', value: reviews.avg_accuracy },
                      { label: 'Communication', value: reviews.avg_communication },
                      { label: 'Location', value: reviews.avg_location },
                      { label: 'Value', value: reviews.avg_value },
                    ].filter(r => r.value).map((r) => (
                      <div key={r.label} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-700">{r.label}</span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <div className="flex-1 max-w-24 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-gray-900 h-1 rounded-full"
                              style={{ width: `${((r.value || 0) / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-6 text-right">
                            {r.value?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.items.slice(0, 6).map((review) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        {review.reviewer.avatar ? (
                          <img
                            src={review.reviewer.avatar}
                            alt={review.reviewer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                            {review.reviewer.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{review.reviewer.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'fill-gray-900 text-gray-900' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host Section */}
            <div className="pb-8 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">About your host</h2>
              <div className="flex items-start gap-5">
                {listing.host.avatar ? (
                  <img
                    src={listing.host.avatar}
                    alt={listing.host.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
                    {listing.host.name[0]}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{listing.host.name}</h3>
                    <SuperhostBadge variant="card" />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Host since {formatDate(listing.host.created_at)}
                  </p>
                  {listing.host.bio && (
                    <p className="text-sm text-gray-700 leading-relaxed">{listing.host.bio}</p>
                  )}
                  <div className="mt-4">
                    <button className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Contact host
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Location Section */}
            <div className="pb-8 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Where you&apos;ll be</h2>
              <p className="text-sm text-gray-500 mb-5">{listing.location}, {listing.city}, {listing.country}</p>
              <ListingMap listings={[listing]} selectedId={listing.id} height="360px" />
            </div>

            {/* Leave a Review */}
            {user && (
              <div className="pb-8 border-t border-gray-100 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-5">Leave a review</h2>
                <ReviewForm listingId={listing.id} onSubmit={() => {
                  getReviews(listing.id).then(setReviews).catch(() => {});
                }} />
              </div>
            )}
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-200 rounded-2xl shadow-xl p-6 bg-white">
                {/* Price */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(listing.price_per_night)}</span>
                    <span className="text-gray-500"> / night</span>
                  </div>
                  {listing.avg_rating && (
                    <Rating rating={listing.avg_rating} reviewCount={listing.review_count} size="sm" />
                  )}
                </div>

                {/* Date Selection */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                  <div
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="grid grid-cols-2 divide-x divide-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-3">
                      <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">Check-in</div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {checkIn ? formatDate(checkIn) : 'Add date'}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">Checkout</div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {checkOut ? formatDate(checkOut) : 'Add date'}
                      </div>
                    </div>
                  </div>

                  {/* Guest Input */}
                  <div className="border-t border-gray-200 p-3">
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Guests</div>
                    <GuestSelector
                      value={guests}
                      onChange={setGuests}
                      maxGuests={listing.max_guests}
                      compact
                    />
                  </div>
                </div>

                {/* Inline date picker */}
                {showDatePicker && (
                  <div className="mb-3">
                    <DateRangePicker
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onSelect={(ci, co) => {
                        setCheckIn(ci);
                        setCheckOut(co);
                        if (ci && co) setShowDatePicker(false);
                      }}
                      bookedDates={availability?.booked_dates || []}
                      onClose={() => setShowDatePicker(false)}
                      compact
                    />
                  </div>
                )}

                {/* Reserve Button */}
                <button
                  onClick={handleReserve}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-4 font-semibold text-base
                    transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Reserve
                </button>

                <p className="text-center text-xs text-gray-500 mt-3">You won&apos;t be charged yet</p>

                {/* Price Breakdown */}
                {pricing && nights > 0 && (
                  <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>{formatPrice(listing.price_per_night)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                      <span>{formatPrice(pricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Cleaning fee</span>
                      <span>{formatPrice(pricing.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Homeway service fee</span>
                      <span>{formatPrice(pricing.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-3">
                      <span>Total</span>
                      <span>{formatPrice(pricing.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-gray-900">
              {images.length} photo{images.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
            {images.map((img, i) => (
              <div key={img.id} className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={img.url}
                  alt={`Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
