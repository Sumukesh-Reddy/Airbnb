'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createListing, getAmenities } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/Toast';
import { ChevronRight, ChevronLeft, Plus, Loader2 } from 'lucide-react';

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

const STEPS = [
  { id: 1, name: 'About your place' },
  { id: 2, name: 'Details & pricing' },
  { id: 3, name: 'Amenities' },
  { id: 4, name: 'Photos' },
];

interface Amenity {
  id: number;
  name: string;
  icon?: string;
  category?: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

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
    image_urls: [''],
    amenity_ids: [] as number[],
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }
    getAmenities().then(setAmenities).catch(console.error);
  }, [user, isLoading, router]);

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

  const handleImageChange = (index: number, value: string) => {
    const newUrls = [...formData.image_urls];
    newUrls[index] = value;
    setFormData({ ...formData, image_urls: newUrls });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        image_urls: formData.image_urls.filter((u) => u.trim() !== ''),
      };
      await createListing(payload);
      toast('Listing published successfully! 🎉', 'success');
      router.push('/host/dashboard');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to create listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;
  if (!user) return null;

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a new listing</h1>
          <p className="text-gray-500">Share your space with travelers from around the world</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-0 mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 transition-all
                    ${step > s.id ? 'bg-gray-900 border-gray-900 text-white'
                    : step === s.id ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'}`}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? 'bg-gray-900' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <span key={s.id} className={`text-xs font-medium ${step === s.id ? 'text-rose-500' : 'text-gray-400'}`}>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Tell us about your place</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Cozy Beach Cottage in Goa"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your space, what makes it special, nearby attractions..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Property type *</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Goa"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full address / location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Anjuna Beach, North Goa"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          )}

          {/* Step 2: Details & Pricing */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Details & pricing</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per night (₹) *</label>
                <input
                  type="number"
                  name="price_per_night"
                  value={formData.price_per_night}
                  onChange={handleNumberChange}
                  min={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max guests</label>
                  <input type="number" name="max_guests" value={formData.max_guests} onChange={handleNumberChange} min={1} max={20}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleNumberChange} min={0}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Beds</label>
                  <input type="number" name="beds" value={formData.beds} onChange={handleNumberChange} min={1}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleNumberChange} min={0.5} step={0.5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900">What amenities do you offer?</h2>
              <p className="text-sm text-gray-500">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all
                      ${formData.amenity_ids.includes(amenity.id)
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenity_ids.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${formData.amenity_ids.includes(amenity.id) ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                      {formData.amenity_ids.includes(amenity.id) && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add photos of your property</h2>
                <p className="text-sm text-gray-500 mt-1">Enter photo URLs or pick from our curated high-resolution sample photos below.</p>
              </div>

              {/* Sample Photo Presets */}
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-rose-900 mb-2 uppercase tracking-wide">Quick preset photos</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '🏖️ Beach House', url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800' },
                    { label: '🏔️ Mountain Cabin', url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800' },
                    { label: '🏛️ Heritage Villa', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
                    { label: '🏢 City Apartment', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (!formData.image_urls.includes(preset.url)) {
                          const urls = formData.image_urls[0] === '' ? [preset.url] : [...formData.image_urls, preset.url];
                          setFormData({ ...formData, image_urls: urls });
                        }
                      }}
                      className="text-left bg-white border border-rose-200 rounded-lg p-2 hover:border-rose-500 transition-colors shadow-xs"
                    >
                      <p className="text-xs font-semibold text-gray-800">{preset.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">+ Add sample</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {formData.image_urls.map((url, i) => (
                  <div key={i} className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">
                        {i === 0 ? 'Cover photo URL (Main) *' : `Photo ${i + 1} URL`}
                      </label>
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = formData.image_urls.filter((_, idx) => idx !== i);
                            setFormData({ ...formData, image_urls: newUrls.length ? newUrls : [''] });
                          }}
                          className="text-xs font-semibold text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageChange(i, e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    {url && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm mt-2">
                        <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_urls: [...formData.image_urls, ''] })}
                  className="flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors pt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add another photo URL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < STEPS.length ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-all disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
