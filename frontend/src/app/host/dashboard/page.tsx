'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getHostListings, getHostStats, getHostBookings, deleteListing, becomeHost } from '@/lib/api';
import { ListingDetail, Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/Toast';
import { formatPrice, formatDate } from '@/lib/utils';
import { Home, Plus, TrendingUp, Calendar, Star, DollarSign, Pencil, Trash2, Loader2, Users, MapPin } from 'lucide-react';

interface HostStats {
  total_listings: number;
  total_bookings: number;
  total_revenue: number;
  avg_rating: number;
  upcoming_bookings: number;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-gray-50 text-gray-600',
  cancelled: 'bg-red-50 text-red-500',
  pending: 'bg-amber-50 text-amber-700',
};

export default function HostDashboardPage() {
  const { user, isLoading: authLoading, becomeHost: becomeHostFn } = useAuth();
  const [stats, setStats] = useState<HostStats | null>(null);
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [becomingHost, setBecomingHost] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    if (user.is_host) loadData();
    else setLoading(false);
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, listingsData, bookingsData] = await Promise.all([
        getHostStats(),
        getHostListings(),
        getHostBookings(),
      ]);
      setStats(statsData);
      setListings(listingsData);
      setBookings(bookingsData);
    } catch {
      toast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast('Listing deleted', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to delete listing', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBecomeHost = async () => {
    setBecomingHost(true);
    try {
      await becomeHostFn();
      toast('Welcome to hosting! 🏠', 'success');
      loadData();
    } catch {
      toast('Failed to become host', 'error');
    } finally {
      setBecomingHost(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign in to access your dashboard</h2>
          <Link href="/" className="text-rose-500 font-medium underline">Go home</Link>
        </div>
      </div>
    );
  }

  if (!user.is_host) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Become a Host</h2>
          <p className="text-gray-500 mb-8">
            Share your space with travelers and earn money. Join thousands of hosts on Homeway.
          </p>
          <button
            onClick={handleBecomeHost}
            disabled={becomingHost}
            className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-rose-600 transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center gap-2 mx-auto"
          >
            {becomingHost && <Loader2 className="w-5 h-5 animate-spin" />}
            Start hosting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user.name}</p>
          </div>
          <Link
            href="/host/listings/new"
            className="flex items-center gap-2 bg-rose-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-rose-600 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            New listing
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Listings', value: stats.total_listings, icon: Home, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Total Bookings', value: stats.total_bookings, icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Revenue', value: formatPrice(stats.total_revenue), icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50', isStr: true },
              { label: 'Avg Rating', value: stats.avg_rating ? stats.avg_rating.toFixed(2) : '—', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', isStr: true },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.isStr ? stat.value : stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* My Listings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
            <span className="text-sm text-gray-500">{listings.length} listing{listings.length !== 1 ? 's' : ''}</span>
          </div>

          {listings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500 mb-4">No listings yet</p>
              <Link
                href="/host/listings/new"
                className="text-rose-500 font-semibold hover:text-rose-600 underline"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {listings.map((listing) => {
                const img = listing.images?.find((i) => i.is_primary)?.url || listing.images?.[0]?.url || listing.primary_image;
                return (
                  <div key={listing.id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                    {/* Image */}
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {img ? (
                        <Image src={img} alt={listing.title} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">🏠</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.city}</span>
                        <span>{formatPrice(listing.price_per_night)}/night</span>
                        {listing.avg_rating && (
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{listing.avg_rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/host/listings/${listing.id}/edit`}
                        className="flex items-center gap-1 text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id, listing.title)}
                        disabled={deletingId === listing.id}
                        className="flex items-center gap-1 text-xs text-red-500 border border-red-100 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === listing.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Guest Bookings</h2>
            <span className="text-sm text-gray-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.slice(0, 10).map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-5">
                  {/* Guest avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {booking.guest?.name?.[0] || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900">{booking.guest?.name || 'Guest'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_COLORS[booking.status] || ''}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {booking.listing?.title || 'Listing'} · {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-gray-900">{formatPrice(booking.total)}</div>
                    <div className="text-xs text-gray-500">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
