from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Listing, User, Amenity
from app.utils.auth import require_host
from app.routers.listings import listing_to_card

router = APIRouter(prefix="/api/host", tags=["host"])


@router.get("/listings")
def get_host_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    listings = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.host),
        joinedload(Listing.amenities),
    ).filter(
        Listing.host_id == current_user.id,
        Listing.is_active == True,
    ).order_by(Listing.created_at.desc()).all()

    return [listing_to_card(l, current_user) for l in listings]


@router.get("/listings/{listing_id}/bookings")
def get_host_listing_bookings(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    from app.models.models import Booking
    listing = db.query(Listing).filter(
        Listing.id == listing_id,
        Listing.host_id == current_user.id,
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not owned by you")

    bookings = db.query(Booking).options(
        joinedload(Booking.guest),
        joinedload(Booking.listing).joinedload(Listing.images),
    ).filter(Booking.listing_id == listing_id).order_by(Booking.created_at.desc()).all()

    return [
        {
            "id": b.id,
            "booking_ref": b.booking_ref,
            "check_in": b.check_in.isoformat(),
            "check_out": b.check_out.isoformat(),
            "guests": b.guests,
            "total": b.total,
            "status": b.status,
            "guest": {"id": b.guest.id, "name": b.guest.name, "email": b.guest.email} if b.guest else None,
            "created_at": b.created_at.isoformat(),
        }
        for b in bookings
    ]


@router.get("/stats")
def get_host_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    from app.models.models import Booking
    from sqlalchemy import func

    listing_ids = [l.id for l in db.query(Listing.id).filter(
        Listing.host_id == current_user.id, Listing.is_active == True
    ).all()]

    total_listings = len(listing_ids)

    if not listing_ids:
        return {
            "total_listings": 0,
            "total_bookings": 0,
            "total_revenue": 0,
            "avg_rating": 0,
            "upcoming_bookings": 0,
        }

    from datetime import datetime
    bookings = db.query(Booking).filter(
        Booking.listing_id.in_(listing_ids),
        Booking.status.in_(["confirmed", "completed"]),
    ).all()

    total_revenue = sum(b.total for b in bookings)
    upcoming = sum(1 for b in bookings if b.check_in > datetime.now() and b.status == "confirmed")

    avg_ratings = [
        l.avg_rating for l in db.query(Listing).filter(
            Listing.id.in_(listing_ids), Listing.avg_rating != None
        ).all()
    ]
    avg_rating = round(sum(avg_ratings) / len(avg_ratings), 2) if avg_ratings else 0

    return {
        "total_listings": total_listings,
        "total_bookings": len(bookings),
        "total_revenue": round(total_revenue, 2),
        "avg_rating": avg_rating,
        "upcoming_bookings": upcoming,
    }


@router.get("/amenities")
def get_amenities(db: Session = Depends(get_db)):
    amenities = db.query(Amenity).all()
    return [{"id": a.id, "name": a.name, "icon": a.icon, "category": a.category} for a in amenities]
