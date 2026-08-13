'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getListing, updateListing, getAmenities } from '@/lib/api';
import { ListingDetail } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/Toast';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'beach_house', label: 'Beach House' },
  { value: 'treehouse', label: 'Treehouse' },
  { value: 'houseboat', label: 'Houseboat' },
  { value: 'farm_stay', label: 'Farm Stay' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'studio', label: 'Studio' },
];

interface Amenity {
  id: number;
  name: string;
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const listingId = Number(params.id);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    location: '',
    city: '',
    country: 'India',
    price_per_night: 5000,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    max_guests: 2,
    amenity_ids: [] as number[],
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/'); return; }
    if (!user.is_host) { router.push('/host/dashboard'); return; }

    Promise.all([getListing(listingId), getAmenities()])
      .then(([listingData, amenitiesData]) => {
        setListing(listingData);
        setAmenities(amenitiesData);
        setFormData({
          title: listingData.title,
          description: listingData.description,
          property_type: listingData.property_type,
          location: listingData.location,
          city: listingData.city,
          country: listingData.country,
          price_per_night: listingData.price_per_night,
          bedrooms: listingData.bedrooms,
          beds: listingData.beds,
          bathrooms: listingData.bathrooms,
          max_guests: listingData.max_guests,
          amenity_ids: listingData.amenities.map((a) => a.id),
        });
      })
      .catch(() => toast('Failed to load listing', 'error'))
      .finally(() => setLoading(false));
  }, [listingId, user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateListing(listingId, formData);
      toast('Listing updated! ✨', 'success');
      router.push('/host/dashboard');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const toggleAmenity = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(id)
        ? prev.amenity_ids.filter((a) => a !== id)
        : [...prev.amenity_ids, id],
    }));
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!listing) return null;

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/host/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit listing</h1>
            <p className="text-sm text-gray-500 line-clamp-1">{listing.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Basic information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} required className={`${inputCls} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Property type</label>
                <select name="property_type" value={formData.property_type} onChange={handleChange} className={`${inputCls} bg-white`}>
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location / Address</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          {/* Details & Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Details & pricing</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per night (₹)</label>
              <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleNumberChange} min={500} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max guests</label>
                <input type="number" name="max_guests" value={formData.max_guests} onChange={handleNumberChange} min={1} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleNumberChange} min={0} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Beds</label>
                <input type="number" name="beds" value={formData.beds} onChange={handleNumberChange} min={1} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bathrooms</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleNumberChange} min={0.5} step={0.5} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all
                      ${formData.amenity_ids.includes(amenity.id) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${formData.amenity_ids.includes(amenity.id) ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                      {formData.amenity_ids.includes(amenity.id) && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </div>
                    <input type="checkbox" checked={formData.amenity_ids.includes(amenity.id)} onChange={() => toggleAmenity(amenity.id)} className="sr-only" />
                    <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3">
            <Link
              href="/host/dashboard"
              className="flex-1 text-center border border-gray-200 text-gray-700 rounded-xl py-3.5 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white rounded-xl py-3.5 font-semibold hover:bg-rose-600 transition-all disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
