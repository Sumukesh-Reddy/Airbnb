from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from typing import Optional, List
from datetime import datetime, date

from app.database import get_db
from app.models.models import Listing, ListingImage, Booking, Favorite, User, Amenity
from app.schemas.schemas import (
    ListingCardOut, ListingDetailOut, ListingsResponse,
    ListingCreate, ListingUpdate, AvailabilityResponse, HostInfo, ListingImageOut, AmenityOut
)
from app.utils.auth import get_current_user, require_auth, require_host

router = APIRouter(prefix="/api/listings", tags=["listings"])


def listing_to_card(listing: Listing, current_user: Optional[User] = None) -> dict:
    images = sorted(listing.images, key=lambda i: i.display_order)
    primary_image = next((img.url for img in images if img.is_primary), images[0].url if images else None)

    is_favorite = False
    if current_user:
        is_favorite = any(fav.listing_id == listing.id for fav in current_user.favorites)

    return {
        "id": listing.id,
        "title": listing.title,
        "location": listing.location,
        "city": listing.city,
        "country": listing.country,
        "property_type": listing.property_type,
        "price_per_night": listing.price_per_night,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "avg_rating": listing.avg_rating,
        "review_count": listing.review_count,
        "primary_image": primary_image,
        "images": [{"id": i.id, "url": i.url, "is_primary": i.is_primary, "display_order": i.display_order} for i in images],
        "host": {
            "id": listing.host.id,
            "name": listing.host.name,
            "avatar": listing.host.avatar,
            "bio": listing.host.bio,
            "created_at": listing.host.created_at,
        },
        "is_favorite": is_favorite,
    }


@router.get("", response_model=ListingsResponse)
def get_listings(
    location: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    property_type: Optional[str] = Query(None),
    guests: Optional[int] = Query(None),
    amenities: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    check_in: Optional[str] = Query(None),
    check_out: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    sort: str = Query("created_at_desc"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    query = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.host),
        joinedload(Listing.amenities),
    ).filter(Listing.is_active == True)

    # Location filter
    if location:
        loc_filter = location.lower()
        query = query.filter(
            or_(
                func.lower(Listing.city).contains(loc_filter),
                func.lower(Listing.location).contains(loc_filter),
                func.lower(Listing.country).contains(loc_filter),
            )
        )

    # Price filters
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # Property type filter
    if property_type:
        query = query.filter(Listing.property_type == property_type)

    # Guests filter
    if guests:
        query = query.filter(Listing.max_guests >= guests)

    # Rating filter
    if min_rating is not None:
        query = query.filter(Listing.avg_rating >= min_rating)

    # Availability filter (prevent overlapping bookings)
    if check_in and check_out:
        try:
            ci = datetime.fromisoformat(check_in)
            co = datetime.fromisoformat(check_out)
            booked_listing_ids = db.query(Booking.listing_id).filter(
                Booking.status.in_(["confirmed", "pending"]),
                Booking.check_in < co,
                Booking.check_out > ci,
            ).subquery()
            query = query.filter(~Listing.id.in_(booked_listing_ids))
        except ValueError:
            pass

    # Amenities filter
    if amenities:
        amenity_ids = [int(a) for a in amenities.split(",") if a.strip().isdigit()]
        if amenity_ids:
            from app.models.models import ListingAmenity
            for amenity_id in amenity_ids:
                sub = db.query(ListingAmenity.listing_id).filter(
                    ListingAmenity.amenity_id == amenity_id
                ).subquery()
                query = query.filter(Listing.id.in_(sub))

    # Sorting
    sort_map = {
        "price_asc": Listing.price_per_night.asc(),
        "price_desc": Listing.price_per_night.desc(),
        "rating_desc": Listing.avg_rating.desc(),
        "rating_asc": Listing.avg_rating.asc(),
        "created_at_desc": Listing.created_at.desc(),
        "created_at_asc": Listing.created_at.asc(),
        "review_count_desc": Listing.review_count.desc(),
    }
    query = query.order_by(sort_map.get(sort, Listing.created_at.desc()))

    total = query.count()
    offset = (page - 1) * per_page
    listings = query.offset(offset).limit(per_page).all()

    # Load favorites for current user
    if current_user:
        current_user.favorites  # trigger load

    items = [listing_to_card(l, current_user) for l in listings]

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


@router.get("/{listing_id}", response_model=ListingDetailOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    listing = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.host),
        joinedload(Listing.amenities),
    ).filter(Listing.id == listing_id, Listing.is_active == True).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    data = listing_to_card(listing, current_user)
    data["description"] = listing.description
    data["latitude"] = listing.latitude
    data["longitude"] = listing.longitude
    data["amenities"] = [
        {"id": a.id, "name": a.name, "icon": a.icon, "category": a.category}
        for a in listing.amenities
    ]
    data["created_at"] = listing.created_at
    return data


@router.get("/{listing_id}/availability", response_model=AvailabilityResponse)
def get_availability(
    listing_id: int,
    check_in: Optional[str] = Query(None),
    check_out: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Get all upcoming bookings for this listing
    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status.in_(["confirmed", "pending"]),
        Booking.check_out >= datetime.now(),
    ).all()

    booked_dates = [
        {
            "check_in": b.check_in.isoformat(),
            "check_out": b.check_out.isoformat(),
        }
        for b in bookings
    ]

    is_available = True
    if check_in and check_out:
        try:
            ci = datetime.fromisoformat(check_in)
            co = datetime.fromisoformat(check_out)
            for b in bookings:
                if ci < b.check_out and co > b.check_in:
                    is_available = False
                    break
        except ValueError:
            pass

    cleaning_fee = round(listing.price_per_night * 0.1, 2)

    return {
        "is_available": is_available,
        "booked_dates": booked_dates,
        "price_per_night": listing.price_per_night,
        "cleaning_fee": cleaning_fee,
        "service_fee_rate": 0.12,
    }


@router.post("", response_model=ListingDetailOut, status_code=201)
def create_listing(
    listing_data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    listing = Listing(
        title=listing_data.title,
        description=listing_data.description,
        location=listing_data.location,
        city=listing_data.city,
        country=listing_data.country,
        latitude=listing_data.latitude,
        longitude=listing_data.longitude,
        property_type=listing_data.property_type,
        price_per_night=listing_data.price_per_night,
        max_guests=listing_data.max_guests,
        bedrooms=listing_data.bedrooms,
        beds=listing_data.beds,
        bathrooms=listing_data.bathrooms,
        host_id=current_user.id,
    )
    db.add(listing)
    db.flush()

    for i, url in enumerate(listing_data.image_urls):
        img = ListingImage(listing_id=listing.id, url=url, is_primary=(i == 0), display_order=i)
        db.add(img)

    if listing_data.amenity_ids:
        from app.models.models import ListingAmenity
        for amenity_id in listing_data.amenity_ids:
            amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()
            if amenity:
                db.add(ListingAmenity(listing_id=listing.id, amenity_id=amenity_id))

    db.commit()
    db.refresh(listing)

    data = listing_to_card(listing, current_user)
    data["description"] = listing.description
    data["latitude"] = listing.latitude
    data["longitude"] = listing.longitude
    data["amenities"] = [{"id": a.id, "name": a.name, "icon": a.icon, "category": a.category} for a in listing.amenities]
    data["created_at"] = listing.created_at
    return data


@router.put("/{listing_id}", response_model=ListingDetailOut)
def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    listing = db.query(Listing).filter(
        Listing.id == listing_id, Listing.host_id == current_user.id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not owned by you")

    update_data = listing_data.model_dump(exclude_unset=True)
    amenity_ids = update_data.pop("amenity_ids", None)
    image_urls = update_data.pop("image_urls", None)

    for field, value in update_data.items():
        setattr(listing, field, value)

    if amenity_ids is not None:
        from app.models.models import ListingAmenity
        db.query(ListingAmenity).filter(ListingAmenity.listing_id == listing_id).delete()
        for amenity_id in amenity_ids:
            db.add(ListingAmenity(listing_id=listing_id, amenity_id=amenity_id))

    if image_urls is not None:
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
        for i, url in enumerate(image_urls):
            db.add(ListingImage(listing_id=listing_id, url=url, is_primary=(i == 0), display_order=i))

    db.commit()
    db.refresh(listing)

    data = listing_to_card(listing, current_user)
    data["description"] = listing.description
    data["latitude"] = listing.latitude
    data["longitude"] = listing.longitude
    data["amenities"] = [{"id": a.id, "name": a.name, "icon": a.icon, "category": a.category} for a in listing.amenities]
    data["created_at"] = listing.created_at
    return data


@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_host),
):
    listing = db.query(Listing).filter(
        Listing.id == listing_id, Listing.host_id == current_user.id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not owned by you")

    listing.is_active = False
    db.commit()
