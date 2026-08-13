from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.models.models import Review, Listing, User, Booking
from app.schemas.schemas import ReviewCreate, ReviewOut, ReviewsResponse
from app.utils.auth import require_auth, get_current_user
from typing import Optional

router = APIRouter(prefix="/api", tags=["reviews"])


@router.get("/listings/{listing_id}/reviews", response_model=ReviewsResponse)
def get_reviews(
    listing_id: int,
    db: Session = Depends(get_db),
):
    reviews = db.query(Review).options(
        joinedload(Review.reviewer)
    ).filter(Review.listing_id == listing_id).order_by(Review.created_at.desc()).all()

    if not reviews:
        return {
            "items": [],
            "total": 0,
            "avg_rating": 0,
            "avg_cleanliness": None,
            "avg_accuracy": None,
            "avg_communication": None,
            "avg_location": None,
            "avg_value": None,
        }

    avg_rating = sum(r.rating for r in reviews) / len(reviews)

    def safe_avg(values):
        vals = [v for v in values if v is not None]
        return round(sum(vals) / len(vals), 2) if vals else None

    items = []
    for r in reviews:
        items.append({
            "id": r.id,
            "listing_id": r.listing_id,
            "reviewer_id": r.reviewer_id,
            "rating": r.rating,
            "comment": r.comment,
            "cleanliness": r.cleanliness,
            "accuracy": r.accuracy,
            "communication": r.communication,
            "location_rating": r.location_rating,
            "value": r.value,
            "created_at": r.created_at,
            "reviewer": {
                "id": r.reviewer.id,
                "email": r.reviewer.email,
                "name": r.reviewer.name,
                "avatar": r.reviewer.avatar,
                "is_host": r.reviewer.is_host,
                "bio": r.reviewer.bio,
                "created_at": r.reviewer.created_at,
            },
        })

    return {
        "items": items,
        "total": len(reviews),
        "avg_rating": round(avg_rating, 2),
        "avg_cleanliness": safe_avg([r.cleanliness for r in reviews]),
        "avg_accuracy": safe_avg([r.accuracy for r in reviews]),
        "avg_communication": safe_avg([r.communication for r in reviews]),
        "avg_location": safe_avg([r.location_rating for r in reviews]),
        "avg_value": safe_avg([r.value for r in reviews]),
    }


@router.post("/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    listing = db.query(Listing).filter(Listing.id == review_data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Check if user has a completed booking for this listing
    has_booking = db.query(Booking).filter(
        Booking.guest_id == current_user.id,
        Booking.listing_id == review_data.listing_id,
        Booking.status == "completed",
    ).first()

    # For the demo, allow reviews without completed bookings too
    review = Review(
        listing_id=review_data.listing_id,
        reviewer_id=current_user.id,
        booking_id=review_data.booking_id,
        rating=review_data.rating,
        comment=review_data.comment,
        cleanliness=review_data.cleanliness,
        accuracy=review_data.accuracy,
        communication=review_data.communication,
        location_rating=review_data.location_rating,
        value=review_data.value,
    )
    db.add(review)

    # Update listing avg_rating
    all_reviews = db.query(Review).filter(Review.listing_id == review_data.listing_id).all()
    ratings = [r.rating for r in all_reviews] + [review_data.rating]
    listing.avg_rating = round(sum(ratings) / len(ratings), 2)
    listing.review_count = len(ratings)

    db.commit()
    db.refresh(review)

    return {
        "id": review.id,
        "listing_id": review.listing_id,
        "reviewer_id": review.reviewer_id,
        "rating": review.rating,
        "comment": review.comment,
        "cleanliness": review.cleanliness,
        "accuracy": review.accuracy,
        "communication": review.communication,
        "location_rating": review.location_rating,
        "value": review.value,
        "created_at": review.created_at,
        "reviewer": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "avatar": current_user.avatar,
            "is_host": current_user.is_host,
            "bio": current_user.bio,
            "created_at": current_user.created_at,
        },
    }
