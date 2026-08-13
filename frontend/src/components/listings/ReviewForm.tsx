'use client';

import { useState } from 'react';
import { createReview } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { Star, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  listingId: number;
  onSubmit?: () => void;
}

export default function ReviewForm({ listingId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast('Please select a rating', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({ listing_id: listingId, rating, comment });
      toast('Review submitted! Thanks for sharing. 🌟', 'success');
      setSubmitted(true);
      onSubmit?.();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
        <span className="text-2xl">🌟</span>
        <div>
          <p className="font-semibold text-green-800">Review submitted!</p>
          <p className="text-sm text-green-600">Thanks for sharing your experience.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Overall rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-600">
              {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience — what did you love? What could be better?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm
          hover:bg-gray-800 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit review
      </button>
    </form>
  );
}
