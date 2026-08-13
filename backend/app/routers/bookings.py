import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.database import get_db
from app.models.models import Booking, Listing, User
from app.schemas.schemas import BookingCreate, BookingOut
from app.utils.auth import require_auth
from app.routers.listings import listing_to_card

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def generate_ref() -> str:
    return "HMB" + "".join(random.choices(string.ascii_uppercase + string.digits, k=7))


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    listing = db.query(Listing).filter(
        Listing.id == booking_data.listing_id, Listing.is_active == True
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.host_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot book your own listing")

    try:
        check_in = datetime.fromisoformat(booking_data.check_in)
        check_out = datetime.fromisoformat(booking_data.check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")

    if check_in >= check_out:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    if check_in < datetime.now():
        raise HTTPException(status_code=400, detail="Check-in cannot be in the past")

    # Check availability (overlap logic)
    conflict = db.query(Booking).filter(
        Booking.listing_id == booking_data.listing_id,
        Booking.status.in_(["confirmed", "pending"]),
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    ).first()

    if conflict:
        raise HTTPException(status_code=409, detail="These dates are not available")

    if booking_data.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {listing.max_guests} guests allowed"
        )

    nights = (check_out - check_in).days
    nightly_price = listing.price_per_night
    cleaning_fee = round(nightly_price * 0.1, 2)
    service_fee = round((nightly_price * nights + cleaning_fee) * 0.12, 2)
    total = round(nightly_price * nights + cleaning_fee + service_fee, 2)

    booking = Booking(
        guest_id=current_user.id,
        listing_id=listing.id,
        check_in=check_in,
        check_out=check_out,
        guests=booking_data.guests,
        nightly_price=nightly_price,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total=total,
        status="confirmed",
        booking_ref=generate_ref(),
        special_requests=booking_data.special_requests,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Load relations
    db.refresh(booking)
    listing_card = listing_to_card(listing)

    result = {
        "id": booking.id,
        "listing_id": booking.listing_id,
        "guest_id": booking.guest_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nightly_price": booking.nightly_price,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "total": booking.total,
        "status": booking.status,
        "booking_ref": booking.booking_ref,
        "special_requests": booking.special_requests,
        "created_at": booking.created_at,
        "listing": listing_card,
    }
    return result


@router.get("/my", response_model=list[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    bookings = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.host),
    ).filter(
        Booking.guest_id == current_user.id
    ).order_by(Booking.check_in.desc()).all()

    results = []
    for b in bookings:
        listing_card = listing_to_card(b.listing)
        results.append({
            "id": b.id,
            "listing_id": b.listing_id,
            "guest_id": b.guest_id,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "guests": b.guests,
            "nightly_price": b.nightly_price,
            "cleaning_fee": b.cleaning_fee,
            "service_fee": b.service_fee,
            "total": b.total,
            "status": b.status,
            "booking_ref": b.booking_ref,
            "special_requests": b.special_requests,
            "created_at": b.created_at,
            "listing": listing_card,
        })
    return results


@router.get("/host", response_model=list[BookingOut])
def get_host_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    if not current_user.is_host:
        raise HTTPException(status_code=403, detail="Host account required")

    bookings = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.host),
        joinedload(Booking.guest),
    ).join(Listing).filter(
        Listing.host_id == current_user.id
    ).order_by(Booking.check_in.desc()).all()

    results = []
    for b in bookings:
        listing_card = listing_to_card(b.listing)
        guest_data = {
            "id": b.guest.id,
            "email": b.guest.email,
            "name": b.guest.name,
            "avatar": b.guest.avatar,
            "is_host": b.guest.is_host,
            "bio": b.guest.bio,
            "created_at": b.guest.created_at,
        }
        results.append({
            "id": b.id,
            "listing_id": b.listing_id,
            "guest_id": b.guest_id,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "guests": b.guests,
            "nightly_price": b.nightly_price,
            "cleaning_fee": b.cleaning_fee,
            "service_fee": b.service_fee,
            "total": b.total,
            "status": b.status,
            "booking_ref": b.booking_ref,
            "special_requests": b.special_requests,
            "created_at": b.created_at,
            "listing": listing_card,
            "guest": guest_data,
        })
    return results


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    booking = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.host),
    ).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Only guest or host of the listing can view
    if booking.guest_id != current_user.id and booking.listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    listing_card = listing_to_card(booking.listing)
    return {
        "id": booking.id,
        "listing_id": booking.listing_id,
        "guest_id": booking.guest_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nightly_price": booking.nightly_price,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "total": booking.total,
        "status": booking.status,
        "booking_ref": booking.booking_ref,
        "special_requests": booking.special_requests,
        "created_at": booking.created_at,
        "listing": listing_card,
    }


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    booking = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.host),
    ).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.guest_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    listing_card = listing_to_card(booking.listing)
    return {
        "id": booking.id,
        "listing_id": booking.listing_id,
        "guest_id": booking.guest_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nightly_price": booking.nightly_price,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "total": booking.total,
        "status": booking.status,
        "booking_ref": booking.booking_ref,
        "special_requests": booking.special_requests,
        "created_at": booking.created_at,
        "listing": listing_card,
    }
