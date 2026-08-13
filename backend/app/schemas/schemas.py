from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ─── User Schemas ────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: str
    name: str


class UserCreate(UserBase):
    password: str
    is_host: bool = False


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    avatar: Optional[str] = None
    is_host: bool
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Amenity Schemas ─────────────────────────────────────────────────────────

class AmenityOut(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Listing Image Schemas ────────────────────────────────────────────────────

class ListingImageOut(BaseModel):
    id: int
    url: str
    is_primary: bool
    display_order: int

    class Config:
        from_attributes = True


# ─── Host Info Schema ─────────────────────────────────────────────────────────

class HostInfo(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Listing Schemas ─────────────────────────────────────────────────────────

class ListingBase(BaseModel):
    title: str
    description: str
    location: str
    city: str
    country: str = "India"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    property_type: str
    price_per_night: float = Field(gt=0)
    max_guests: int = Field(gt=0, default=2)
    bedrooms: int = Field(ge=0, default=1)
    beds: int = Field(ge=1, default=1)
    bathrooms: float = Field(ge=0.5, default=1.0)


class ListingCreate(ListingBase):
    amenity_ids: List[int] = []
    image_urls: List[str] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    property_type: Optional[str] = None
    price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    amenity_ids: Optional[List[int]] = None
    image_urls: Optional[List[str]] = None


class ListingCardOut(BaseModel):
    id: int
    title: str
    location: str
    city: str
    country: str
    property_type: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    avg_rating: Optional[float] = None
    review_count: int
    primary_image: Optional[str] = None
    images: List[ListingImageOut] = []
    host: HostInfo
    is_favorite: bool = False

    class Config:
        from_attributes = True


class ListingDetailOut(ListingCardOut):
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    amenities: List[AmenityOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ListingsResponse(BaseModel):
    items: List[ListingCardOut]
    total: int
    page: int
    per_page: int
    total_pages: int


# ─── Booking Schemas ──────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    listing_id: int
    check_in: str  # ISO date string
    check_out: str  # ISO date string
    guests: int = Field(ge=1)
    special_requests: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: datetime
    check_out: datetime
    guests: int
    nightly_price: float
    cleaning_fee: float
    service_fee: float
    total: float
    status: str
    booking_ref: str
    special_requests: Optional[str] = None
    created_at: datetime
    listing: Optional[ListingCardOut] = None
    guest: Optional[UserOut] = None

    class Config:
        from_attributes = True


class AvailabilityResponse(BaseModel):
    is_available: bool
    booked_dates: List[dict]
    price_per_night: float
    cleaning_fee: float
    service_fee_rate: float


# ─── Review Schemas ──────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    listing_id: int
    booking_id: Optional[int] = None
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    cleanliness: Optional[int] = Field(None, ge=1, le=5)
    accuracy: Optional[int] = Field(None, ge=1, le=5)
    communication: Optional[int] = Field(None, ge=1, le=5)
    location_rating: Optional[int] = Field(None, ge=1, le=5)
    value: Optional[int] = Field(None, ge=1, le=5)


class ReviewOut(BaseModel):
    id: int
    listing_id: int
    reviewer_id: int
    rating: int
    comment: Optional[str] = None
    cleanliness: Optional[int] = None
    accuracy: Optional[int] = None
    communication: Optional[int] = None
    location_rating: Optional[int] = None
    value: Optional[int] = None
    created_at: datetime
    reviewer: UserOut

    class Config:
        from_attributes = True


class ReviewsResponse(BaseModel):
    items: List[ReviewOut]
    total: int
    avg_rating: float
    avg_cleanliness: Optional[float] = None
    avg_accuracy: Optional[float] = None
    avg_communication: Optional[float] = None
    avg_location: Optional[float] = None
    avg_value: Optional[float] = None


# ─── Favorite Schemas ─────────────────────────────────────────────────────────

class FavoriteOut(BaseModel):
    id: int
    listing_id: int
    user_id: int
    created_at: datetime
    listing: Optional[ListingCardOut] = None

    class Config:
        from_attributes = True


# ─── Filter/Query Schemas ─────────────────────────────────────────────────────

class ListingFilters(BaseModel):
    location: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    property_type: Optional[str] = None
    guests: Optional[int] = None
    amenities: Optional[str] = None  # comma-separated amenity IDs
    min_rating: Optional[float] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    page: int = 1
    per_page: int = 20
    sort: str = "created_at_desc"
