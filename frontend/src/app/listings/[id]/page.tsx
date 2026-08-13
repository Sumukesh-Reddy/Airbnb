'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getListing, getReviews, getAvailability } from '@/lib/api';
import { ListingDetail, ReviewsResponse, AvailabilityResponse } from '@/types';
import { formatPrice, formatDate, nightsBetween, calculateTotal, getPropertyTypeLabel } from '@/lib/utils';
import Rating from '@/components/ui/Rating';
import FavoriteButton from '@/components/listings/FavoriteButton';
import ReviewForm from '@/components/listings/ReviewForm';
import DateRangePicker from '@/components/search/DateRangePicker';
import GuestSelector from '@/components/search/GuestSelector';
import SuperhostBadge from '@/components/ui/SuperhostBadge';
import ListingMap from '@/components/map/ListingMap';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Bed,
  Bath,
  Home,
  MapPin,
  Calendar,
  Shield,
  Award,
  Grid,
  X,
  Share2,
  Globe,
  MessageCircle,
  Clock,
  Wifi,
  Tv,
  Car,
  Utensils,
  Wind,
  Waves,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  tv: Tv,
  car: Car,
  utensils: Utensils,
  wind: Wind,
  waves: Waves,
};

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(resolvedParams.id);

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
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceGuestCount, setServiceGuestCount] = useState(1);

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
    if (listing?.property_type === 'service' || listing?.property_type === 'experience') {
      const query = new URLSearchParams({
        check_in: checkIn || '2026-08-20',
        check_out: checkOut || '2026-08-21',
        guests: String(serviceGuestCount || 1),
      });
      router.push(`/checkout/${listing.id}?${query.toString()}`);
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

  const images = listing.images && listing.images.length > 0
    ? listing.images.sort((a, b) => a.display_order - b.display_order)
    : [{ id: 1, url: listing.primary_image || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', is_primary: true, display_order: 1 }];

  const coverUrl = images[0]?.url || listing.primary_image || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';

  // ================= SERVICE DETAIL PAGE LAYOUT (Screenshots 3 & 4) =================
  if (listing.property_type === 'service') {
    const servicePackages = [
      {
        id: 'p1',
        title: 'Mini portrait shoot',
        desc: 'Capture updated profile photos or headshots with this express session at any desired LA location. Get 75 edited digital photos, ideal for social media or professional use.',
        price: '12,395',
        type: 'guest',
        duration: '30 mins',
        img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        slots: ['8:30 am', '9:00 am', '9:30 am', '10:00 am', '11:00 am', '11:30 am'],
      },
      {
        id: 'p2',
        title: 'Iconic LA rental session',
        desc: "Enjoy a solo or family portrait shoot at some of the city's most renowned destinations. Pose at scenic beaches in Santa Monica or urban landmarks.",
        price: '16,685',
        type: 'group',
        duration: '1 hr',
        img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        slots: ['8:30 am', '9:00 am', '9:30 am', '11:00 am', '11:30 am', '12:00 pm', '12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm'],
      },
      {
        id: 'p3',
        title: 'Golden Hour Engagement Beach',
        desc: 'A one hour engagement shoot for couples at Malibu, Santa Monica or Venice Beach during sunset.',
        price: '16,685',
        type: 'group',
        duration: '1 hr',
        img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
        slots: ['4:30 pm', '5:00 pm', '5:30 pm', '6:00 pm', '6:30 pm'],
      },
      {
        id: 'p4',
        title: '2-look photo shoot',
        desc: 'Document adventures at multiple LA locations with 1 outfit change for portfolio variety. Opt to pose in the early-morning light or at golden hour.',
        price: '23,835',
        type: 'group',
        duration: '1 hr 30 mins',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        slots: ['9:00 am', '11:00 am', '2:00 pm', '4:00 pm'],
      },
    ];

    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Cover photo + Host Profile & Information (Screenshot 3) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Cover Photo Container with Host Avatar overlay */}
              <div className="relative">
                <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-md bg-gray-100">
                  <Image
                    src={coverUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Host Circular Avatar Inset */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden relative bg-gray-200">
                    <Image
                      src={listing.host.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                      alt={listing.host.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 text-center space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {listing.title}
                </h1>
                <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                  {listing.description || "As a portrait photographer, I've captured images of Helen Mirren and Jessica Chastain."}
                </p>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Automatically translated</span>
                </div>

                <div className="text-sm font-medium text-gray-800 space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>★ 4.96</span>
                    <span>·</span>
                    <span>92 reviews</span>
                    <span>·</span>
                    <span>Photographer in {listing.city}</span>
                  </div>
                  <p className="text-xs text-gray-500">Provided at your home</p>
                </div>

                {/* Share & Heart */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <FavoriteButton listingId={listing.id} isFavorite={listing.is_favorite} />
                </div>
              </div>
            </div>

            {/* Right Column: Service Packages Cards (Screenshot 3) */}
            <div className="lg:col-span-6 space-y-4">
              {servicePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setShowServiceModal(true)}
                  className="bg-white border border-gray-200 rounded-3xl p-5 hover:border-gray-900 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 group"
                >
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image src={pkg.img} alt={pkg.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="120px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{pkg.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{pkg.desc}</p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                      <span>₹{pkg.price} / {pkg.type}</span>
                      <span>·</span>
                      <span className="text-gray-500 font-normal">{pkg.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Sticky Fee Bar (Screenshot 3) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-40 flex items-center justify-between max-w-6xl mx-auto shadow-2xl">
          <div>
            <span className="text-xl font-bold text-gray-900">From {formatPrice(listing.price_per_night)}</span>
            <span className="text-xs text-gray-500"> / guest</span>
            <p className="text-[11px] font-semibold text-rose-600">Free cancellation · Up to 1 day before start time</p>
          </div>
          <button
            onClick={() => setShowServiceModal(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 py-3.5 text-base font-bold shadow-md hover:scale-105 transition-all"
          >
            Show dates
          </button>
        </div>

        {/* "Schedule your photo shoot" Modal (Screenshot 4) */}
        {showServiceModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-modal-in max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowServiceModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule your photo shoot</h2>

              {/* Guests Count Input */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100 mb-4">
                <span className="text-sm font-semibold text-gray-900">{serviceGuestCount} guest</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setServiceGuestCount(Math.max(1, serviceGuestCount - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 font-bold hover:border-gray-900"
                  >
                    -
                  </button>
                  <span className="font-bold text-gray-900 text-sm">{serviceGuestCount}</span>
                  <button
                    onClick={() => setServiceGuestCount(serviceGuestCount + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 font-bold hover:border-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Month Header & Calendar Row */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-gray-900">August 2026</span>
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {[9, 10, 11, 12, 13, 14, 15].map((d) => (
                    <button
                      key={d}
                      className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-colors
                        ${d === 14 ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Packages with Interactive Time Slot Grids (Screenshot 4) */}
              <div className="space-y-6">
                {servicePackages.map((pkg) => (
                  <div key={pkg.id} className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={pkg.img} alt={pkg.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{pkg.title}</h4>
                        <p className="text-xs text-gray-500">₹{pkg.price} / {pkg.type} · {pkg.duration}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {pkg.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={handleReserve}
                          className="border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white rounded-xl py-2 px-1 text-xs font-semibold text-gray-700 transition-all text-center"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= HOMES & EXPERIENCES DETAIL PAGE LAYOUT =================
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

        {/* Photo Grid with Error Fallback */}
        <div className="relative mb-8">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
            {images.slice(0, 5).map((img, i) => (
              <div
                key={img.id}
                className={`relative overflow-hidden cursor-pointer group bg-gray-100
                  ${i === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                onClick={() => setShowAllPhotos(true)}
              >
                <img
                  src={img.url}
                  alt={`${listing.title} photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';
                  }}
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
                  className="mt-5 border border-gray-900 rounded-xl px-5 py-3 text-sm font-semibold
                    hover:bg-gray-50 transition-colors"
                >
                  {showAllAmenities ? 'Show fewer amenities' : `Show all ${listing.amenities.length} amenities`}
                </button>
              )}
            </div>

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

            {/* Reviews */}
            <div className="pb-8 border-t border-gray-100 pt-8">
              {reviews && reviews.total > 0 ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      ★ {reviews.avg_rating.toFixed(2)} · {reviews.total} review{reviews.total !== 1 ? 's' : ''}
                    </h2>
                  </div>

                  {/* Rating Category Breakdown */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8">
                    {[
                      { label: 'Cleanliness', score: reviews.avg_cleanliness || 4.9 },
                      { label: 'Accuracy', score: reviews.avg_accuracy || 5.0 },
                      { label: 'Communication', score: reviews.avg_communication || 5.0 },
                      { label: 'Location', score: reviews.avg_location || 4.9 },
                      { label: 'Value', score: reviews.avg_value || 4.9 },
                    ].map((cat) => (
                      <div key={cat.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{cat.label}</span>
                        <div className="flex items-center gap-3 w-36">
                          <div className="flex-1 bg-gray-200 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-gray-900 h-full rounded-full"
                              style={{ width: `${(cat.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold text-xs text-gray-900 min-w-6 text-right">
                            {cat.score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Review Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.items.map((rev) => (
                      <div key={rev.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          {rev.reviewer.avatar ? (
                            <img
                              src={rev.reviewer.avatar}
                              alt={rev.reviewer.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                              {rev.reviewer.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{rev.reviewer.name}</p>
                            <p className="text-xs text-gray-400">{formatDate(rev.created_at)}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No reviews yet</div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget (Homes & Experiences) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="border border-gray-200 rounded-3xl p-6 shadow-xl bg-white space-y-4">
                {/* Price */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(listing.price_per_night)}</span>
                    <span className="text-gray-500"> / night</span>
                  </div>
                  {listing.avg_rating && (
                    <Rating rating={listing.avg_rating} reviewCount={listing.review_count} size="sm" />
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
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

                <button
                  onClick={handleReserve}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-4 font-semibold text-base
                    transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Reserve
                </button>

                <p className="text-center text-xs text-gray-500">You won&apos;t be charged yet</p>

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
                      <span>Service fee</span>
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
              <div key={img.id} className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={img.url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
      <div className="h-4 bg-gray-200 rounded-xl w-1/3" />
      <div className="h-96 bg-gray-200 rounded-2xl w-full" />
    </div>
  );
}
