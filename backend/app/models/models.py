from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, Index
)
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
import enum


class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    guest = "guest"
    host = "host"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class PropertyType(str, enum.Enum):
    apartment = "apartment"
    house = "house"
    villa = "villa"
    cabin = "cabin"
    beach_house = "beach_house"
    treehouse = "treehouse"
    houseboat = "houseboat"
    farm_stay = "farm_stay"
    heritage = "heritage"
    studio = "studio"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar = Column(String(500), nullable=True)
    is_host = Column(Boolean, default=False, nullable=False)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", foreign_keys="Booking.guest_id")
    reviews = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(500), nullable=False)
    city = Column(String(255), nullable=False, index=True)
    country = Column(String(255), nullable=False, default="India")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    property_type = Column(String(50), nullable=False, index=True)
    price_per_night = Column(Float, nullable=False)
    max_guests = Column(Integer, nullable=False, default=2)
    bedrooms = Column(Integer, nullable=False, default=1)
    beds = Column(Integer, nullable=False, default=1)
    bathrooms = Column(Float, nullable=False, default=1.0)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    avg_rating = Column(Float, nullable=True, default=0.0)
    review_count = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    amenities = relationship("Amenity", secondary="listing_amenities", back_populates="listings")
    bookings = relationship("Booking", back_populates="listing")
    reviews = relationship("Review", back_populates="listing")
    favorited_by = relationship("Favorite", back_populates="listing", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_listings_city_type", "city", "property_type"),
        Index("ix_listings_price", "price_per_night"),
    )


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(1000), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    # Relationships
    listing = relationship("Listing", back_populates="images")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    icon = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)

    # Relationships
    listings = relationship("Listing", secondary="listing_amenities", back_populates="amenities")


class ListingAmenity(Base):
    __tablename__ = "listing_amenities"

    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False, index=True)
    check_in = Column(DateTime(timezone=True), nullable=False)
    check_out = Column(DateTime(timezone=True), nullable=False)
    guests = Column(Integer, nullable=False, default=1)
    nightly_price = Column(Float, nullable=False)
    cleaning_fee = Column(Float, nullable=False, default=0.0)
    service_fee = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="confirmed")
    booking_ref = Column(String(20), nullable=False, unique=True, index=True)
    special_requests = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    guest = relationship("User", back_populates="bookings", foreign_keys=[guest_id])
    listing = relationship("Listing", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)

    __table_args__ = (
        Index("ix_bookings_dates", "listing_id", "check_in", "check_out"),
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, unique=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    cleanliness = Column(Integer, nullable=True)
    accuracy = Column(Integer, nullable=True)
    communication = Column(Integer, nullable=True)
    location_rating = Column(Integer, nullable=True)
    value = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    booking = relationship("Booking", back_populates="review")
    listing = relationship("Listing", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews", foreign_keys=[reviewer_id])


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorites")
    listing = relationship("Listing", back_populates="favorited_by")

    __table_args__ = (
        Index("ix_favorites_user_listing", "user_id", "listing_id", unique=True),
    )
