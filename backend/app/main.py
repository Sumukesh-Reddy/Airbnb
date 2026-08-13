import asyncio
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models.models import Base
from app.routers import auth, listings, bookings, favorites, reviews, host

# Create tables on startup
Base.metadata.create_all(bind=engine)

async def start_keepalive_heartbeat():
    """Background task to ping self every 4 minutes and keep Render instance awake."""
    await asyncio.sleep(5)
    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            try:
                response = await client.get("https://airbnb-ojom.onrender.com/health")
                print(f"[{response.status_code}] Backend heartbeat check: alive")
            except Exception as err:
                print(f"[Keepalive Warning] Ping failed: {err}")
            await asyncio.sleep(240)  # Ping every 4 minutes (240s)

@asynccontextmanager
async def lifespan(app: FastAPI):
    heartbeat_task = asyncio.create_task(start_keepalive_heartbeat())
    yield
    heartbeat_task.cancel()

app = FastAPI(
    title="Homeway API",
    description="A modern accommodation marketplace API",
    version="1.0.0",
    lifespan=lifespan,
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
    return {"status": "ok", "service": "Homeway API", "version": "1.0.0", "state": "alive"}


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
    return {"message": "Welcome to Homeway API. Visit /docs for documentation.", "state": "alive"}
