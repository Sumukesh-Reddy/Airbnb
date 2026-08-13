'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMyBookings, cancelBooking } from '@/lib/api';
import { Booking } from '@/types';
import { formatPrice, formatDate, nightsBetween } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { MapPin, Calendar, Users, Hash, Loader2 } from 'lucide-react';
import { parseISO, isAfter, isBefore } from 'date-fns';

type TabType = 'upcoming' | 'past' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700 border-green-100',
  completed: 'bg-gray-50 text-gray-600 border-gray-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function TripsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    loadBookings();
  }, [user, authLoading]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      toast('Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      toast('Booking cancelled', 'success');
      loadBookings();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to cancel', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();

  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && isAfter(parseISO(b.check_out), now)
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && !isAfter(parseISO(b.check_out), now)
  );
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const tabCounts = {
    upcoming: upcomingBookings.length,
    past: pastBookings.length,
    cancelled: cancelledBookings.length,
  };

  const displayedBookings =
    activeTab === 'upcoming' ? upcomingBookings
    : activeTab === 'past' ? pastBookings
    : cancelledBookings;

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Please log in to view your trips</h2>
          <Link href="/" className="text-rose-500 hover:text-rose-600 font-medium underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Trips</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 mb-8">
          {(['upcoming', 'past', 'cancelled'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-all -mb-px
                ${activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
              {tabCounts[tab] > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : displayedBookings.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} trips`}
            description={
              activeTab === 'upcoming'
                ? "Time to book your next adventure!"
                : activeTab === 'past'
                ? "Your past trips will appear here."
                : "No cancelled trips."
            }
            icon="search"
            action={
              activeTab === 'upcoming' ? (
                <Link
                  href="/"
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Explore places
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-5">
            {displayedBookings.map((booking) => {
              const nights = nightsBetween(booking.check_in, booking.check_out);
              const primaryImg = booking.listing?.images?.find((i) => i.is_primary)?.url
                || booking.listing?.images?.[0]?.url
                || booking.listing?.primary_image;

              return (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row gap-5 border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative w-full sm:w-52 h-44 sm:h-auto flex-shrink-0 bg-gray-100">
                    {primaryImg ? (
                      <Image
                        src={primaryImg}
                        alt={booking.listing?.title || 'Listing'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 208px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl">🏠</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                          {booking.listing?.title || 'Listing'}
                        </h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 capitalize ${STATUS_COLORS[booking.status] || ''}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.listing?.city}, {booking.listing?.country}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.check_in)} – {formatDate(booking.check_out)} · {nights} night{nights !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Hash className="w-3 h-3" />
                        <span>Ref: {booking.booking_ref}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div>
                        <span className="text-base font-bold text-gray-900">{formatPrice(booking.total)}</span>
                        <span className="text-xs text-gray-500 ml-1">total</span>
                      </div>

                      <div className="flex gap-2">
                        {booking.listing && (
                          <Link
                            href={`/listings/${booking.listing_id}`}
                            className="text-sm font-medium text-gray-700 underline hover:text-gray-900"
                          >
                            View listing
                          </Link>
                        )}
                        {activeTab === 'upcoming' && booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 ml-3"
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
