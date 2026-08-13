'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBooking } from '@/lib/api';
import { Booking } from '@/types';
import { formatPrice, formatDate, nightsBetween } from '@/lib/utils';
import { CheckCircle, MapPin, Calendar, Users, Hash, Home, ArrowRight, Loader2 } from 'lucide-react';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = Number(params.id);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    getBooking(bookingId)
      .then(setBooking)
      .catch(() => setError('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
          <Link href="/" className="text-rose-500 font-medium underline">Go home</Link>
        </div>
      </div>
    );
  }

  const nights = nightsBetween(booking.check_in, booking.check_out);
  const listing = booking.listing;
  const primaryImg = listing?.images?.find((i) => i.is_primary)?.url || listing?.images?.[0]?.url || listing?.primary_image;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-modal-in">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking confirmed! 🎉</h1>
          <p className="text-gray-500">
            Get ready for your trip. We&apos;ve sent the details to your email.
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden mb-6">
          {/* Listing Image */}
          {primaryImg && listing && (
            <div className="relative h-52 w-full bg-gray-100">
              <Image
                src={primaryImg}
                alt={listing.title || 'Listing'}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs font-medium uppercase tracking-wide opacity-80">Your stay</p>
                <h2 className="text-xl font-bold line-clamp-1">{listing.title}</h2>
              </div>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Booking Reference */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">Booking reference</span>
              </div>
              <span className="font-mono font-bold text-gray-900 tracking-wider">{booking.booking_ref}</span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Check-in</p>
                <p className="font-semibold text-gray-900">{formatDate(booking.check_in)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Check-out</p>
                <p className="font-semibold text-gray-900">{formatDate(booking.check_out)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Duration</p>
                <p className="font-semibold text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Guests</p>
                <p className="font-semibold text-gray-900">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {listing && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{listing.city}, {listing.country}</span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatPrice(booking.nightly_price)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                <span>{formatPrice(booking.nightly_price * nights)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cleaning fee</span>
                <span>{formatPrice(booking.cleaning_fee)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Service fee</span>
                <span>{formatPrice(booking.service_fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                <span>Total charged</span>
                <span>{formatPrice(booking.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/trips"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            View my trips
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-xl py-3.5 font-semibold hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
