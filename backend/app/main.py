from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models.models import Base
from app.routers import auth, listings, bookings, favorites, reviews, host

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Homeway API",
    description="A modern accommodation marketplace API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(favorites.router)
app.include_router(reviews.router)
app.include_router(host.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Homeway API", "version": "1.0.0"}


@app.get("/api/amenities")
def get_all_amenities():
    from app.database import SessionLocal
    from app.models.models import Amenity
    db = SessionLocal()
    try:
        amenities = db.query(Amenity).all()
        return [{"id": a.id, "name": a.name, "icon": a.icon, "category": a.category} for a in amenities]
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Welcome to Homeway API. Visit /docs for documentation."}
