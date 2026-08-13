'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { getListing, getAvailability, createBooking } from '@/lib/api';
import { ListingDetail, AvailabilityResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/Toast';
import { formatPrice, formatDate, nightsBetween, calculateTotal } from '@/lib/utils';
import {
  MapPin, Calendar, Users, CreditCard, Lock, Loader2,
  ChevronLeft, Star, Shield
} from 'lucide-react';
import { parseISO } from 'date-fns';

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const listingId = Number(params.id);
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = Number(searchParams.get('guests') || 1);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    if (!checkIn || !checkOut) { router.back(); return; }

    Promise.all([getListing(listingId), getAvailability(listingId, checkIn, checkOut)])
      .then(([l, a]) => { setListing(l); setAvailability(a); })
      .catch(() => toast('Failed to load details', 'error'))
      .finally(() => setLoading(false));
  }, [listingId, checkIn, checkOut, user, router]);

  const nights = nightsBetween(checkIn, checkOut);
  const pricing = listing && nights > 0
    ? calculateTotal(
        listing.price_per_night,
        nights,
        availability?.cleaning_fee || Math.round(listing.price_per_night * 0.1)
      )
    : null;

  const handleConfirmBooking = async () => {
    if (!listing || !pricing) return;
    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      toast('Please fill in all payment details', 'error');
      return;
    }

    setIsBooking(true);
    try {
      const booking = await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      toast('Booking confirmed! 🎉', 'success');
      router.push(`/booking/${booking.id}/confirmation`);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Booking failed. Please try again.', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!listing || !pricing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Unable to load checkout. <Link href="/" className="text-rose-500 underline">Go home</Link></p>
      </div>
    );
  }

  const primaryImg = listing.images?.find((i) => i.is_primary)?.url || listing.images?.[0]?.url || listing.primary_image;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Confirm and pay</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Your trip */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Your trip</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Dates</p>
                    <p className="text-sm text-gray-500">{formatDate(checkIn)} – {formatDate(checkOut)} · {nights} night{nights !== 1 ? 's' : ''}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Guests</p>
                    <p className="text-sm text-gray-500">{guests} guest{guests !== 1 ? 's' : ''}</p>
                  </div>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Mock Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Payment details</h2>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Secured</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Card number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                    />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                    />
                  </div>
                </div>

                {/* Demo hint */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-600 font-medium">
                    💡 This is a demo. Enter any card details to proceed with the mock payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Cancellation policy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Free cancellation before check-in. Cancel within 48 hours of booking to get a full refund, minus service fees.
              </p>
            </div>

            {/* Confirm Button (Mobile) */}
            <div className="lg:hidden">
              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full bg-rose-500 text-white rounded-2xl py-4 font-bold text-lg hover:bg-rose-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                Confirm booking
              </button>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Listing Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {primaryImg ? (
                      <Image src={primaryImg} alt={listing.title} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 capitalize">{listing.property_type.replace('_', ' ')}</p>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mt-0.5">{listing.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{listing.city}, {listing.country}</span>
                    </div>
                    {listing.avg_rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-gray-800 text-gray-800" />
                        <span className="text-xs font-semibold">{listing.avg_rating.toFixed(2)}</span>
                        <span className="text-xs text-gray-400">({listing.review_count})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-4">
                  <h3 className="text-sm font-bold text-gray-900">Price breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(listing.price_per_night)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                      <span>{formatPrice(pricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Cleaning fee</span>
                      <span>{formatPrice(pricing.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Service fee</span>
                      <span>{formatPrice(pricing.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                      <span>Total (INR)</span>
                      <span>{formatPrice(pricing.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Protected by Homeway. Your personal data is secure.</span>
              </div>

              {/* Confirm Button (Desktop) */}
              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="hidden lg:flex w-full items-center justify-center gap-2 bg-rose-500 text-white rounded-2xl py-4 font-bold text-base hover:bg-rose-600 transition-all disabled:opacity-60"
              >
                {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                Confirm booking · {formatPrice(pricing.total)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
