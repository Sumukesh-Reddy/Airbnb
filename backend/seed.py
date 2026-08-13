"""
Seed the database with realistic Airbnb-style data for India.
Includes: hosts, guests, listings, images, amenities, bookings, reviews, favorites.
"""
import sys
import os
import random
import string
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal
from app.models.models import (
    Base, User, Listing, ListingImage, Amenity, ListingAmenity,
    Booking, Review, Favorite
)
from app.utils.auth import get_password_hash


def generate_booking_ref() -> str:
    return "HMB" + "".join(random.choices(string.ascii_uppercase + string.digits, k=7))


def seed_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping...")
        db.close()
        return

    print("Seeding database...")

    # ─── Amenities ─────────────────────────────────────────────────────────────
    amenities_data = [
        {"name": "WiFi", "icon": "wifi", "category": "basics"},
        {"name": "Air conditioning", "icon": "wind", "category": "basics"},
        {"name": "Kitchen", "icon": "utensils", "category": "basics"},
        {"name": "Free parking", "icon": "car", "category": "basics"},
        {"name": "Swimming pool", "icon": "waves", "category": "features"},
        {"name": "Hot tub", "icon": "thermometer", "category": "features"},
        {"name": "Beachfront", "icon": "umbrella", "category": "features"},
        {"name": "Mountain view", "icon": "mountain", "category": "features"},
        {"name": "Garden", "icon": "leaf", "category": "outdoor"},
        {"name": "BBQ grill", "icon": "flame", "category": "outdoor"},
        {"name": "Balcony", "icon": "building", "category": "outdoor"},
        {"name": "Washing machine", "icon": "droplets", "category": "basics"},
        {"name": "TV", "icon": "tv", "category": "entertainment"},
        {"name": "Gym", "icon": "dumbbell", "category": "features"},
        {"name": "Breakfast included", "icon": "coffee", "category": "meals"},
        {"name": "Fireplace", "icon": "flame", "category": "features"},
        {"name": "Bathtub", "icon": "bath", "category": "bathroom"},
        {"name": "Pet friendly", "icon": "heart", "category": "policies"},
        {"name": "EV charger", "icon": "zap", "category": "basics"},
        {"name": "Workspace", "icon": "laptop", "category": "basics"},
    ]

    amenity_objs = []
    for a in amenities_data:
        amenity = Amenity(**a)
        db.add(amenity)
        amenity_objs.append(amenity)
    db.flush()

    # ─── Host Users ────────────────────────────────────────────────────────────
    hosts_data = [
        {
            "email": "priya.sharma@example.com",
            "name": "Priya Sharma",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "bio": "Passionate host from Goa. I love sharing beautiful spaces with travelers from around the world.",
            "is_host": True,
        },
        {
            "email": "rahul.mehra@example.com",
            "name": "Rahul Mehra",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "bio": "Adventure enthusiast and property owner in the Himalayas. Your perfect mountain retreat awaits!",
            "is_host": True,
        },
        {
            "email": "ananya.krishna@example.com",
            "name": "Ananya Krishna",
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            "bio": "Heritage home curator in Rajasthan. Experience royal living at its finest.",
            "is_host": True,
        },
        {
            "email": "vikram.patel@example.com",
            "name": "Vikram Patel",
            "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            "bio": "Mumbai-based entrepreneur offering premium city apartments with stunning skyline views.",
            "is_host": True,
        },
        {
            "email": "deepa.nair@example.com",
            "name": "Deepa Nair",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            "bio": "Kerala native offering authentic backwater houseboat experiences and jungle retreats.",
            "is_host": True,
        },
    ]

    host_objs = []
    for h in hosts_data:
        user = User(
            email=h["email"],
            name=h["name"],
            hashed_password=get_password_hash("password123"),
            avatar=h["avatar"],
            is_host=h["is_host"],
            bio=h["bio"],
        )
        db.add(user)
        host_objs.append(user)
    db.flush()

    # ─── Guest Users ───────────────────────────────────────────────────────────
    guests_data = [
        {"email": "arjun.kapoor@example.com", "name": "Arjun Kapoor", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
        {"email": "simran.singh@example.com", "name": "Simran Singh", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"},
        {"email": "rohit.verma@example.com", "name": "Rohit Verma", "avatar": "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150"},
        {"email": "kavya.reddy@example.com", "name": "Kavya Reddy", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"},
        {"email": "amit.joshi@example.com", "name": "Amit Joshi", "avatar": "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=150"},
        {"email": "neha.gupta@example.com", "name": "Neha Gupta", "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150"},
        {"email": "sanjay.kumar@example.com", "name": "Sanjay Kumar", "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"},
        {"email": "pooja.malhotra@example.com", "name": "Pooja Malhotra", "avatar": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150"},
        {"email": "guest@example.com", "name": "Demo Guest", "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"},
        {"email": "host@example.com", "name": "Demo Host", "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150", "is_host": True},
    ]

    guest_objs = []
    for g in guests_data:
        user = User(
            email=g["email"],
            name=g["name"],
            hashed_password=get_password_hash("password123"),
            avatar=g.get("avatar"),
            is_host=g.get("is_host", False),
        )
        db.add(user)
        guest_objs.append(user)
    db.flush()

    # ─── Listings ──────────────────────────────────────────────────────────────
    listings_data = [
        # GOA - Beach
        {
            "title": "Stunning Beachfront Villa in North Goa",
            "description": "Wake up to the sound of waves in this breathtaking beachfront villa. Located directly on Anjuna Beach, this private retreat features a private pool, lush tropical garden, and panoramic ocean views from every room. The villa sleeps 8 guests comfortably with 4 en-suite bedrooms. Experience the perfect blend of luxury and beach living.",
            "location": "Anjuna Beach, North Goa",
            "city": "Goa",
            "latitude": 15.5739,
            "longitude": 73.7404,
            "property_type": "beach_house",
            "price_per_night": 18500,
            "max_guests": 8,
            "bedrooms": 4,
            "beds": 5,
            "bathrooms": 4,
            "host_idx": 0,
            "amenities": [0, 1, 2, 3, 4, 5, 6, 8, 9, 12, 17],
            "images": [
                "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
            ],
            "avg_rating": 4.9,
            "review_count": 47,
        },
        {
            "title": "Cozy Portuguese Cottage in South Goa",
            "description": "A charming heritage cottage nestled in the peaceful village of Benaulim, South Goa. This beautifully restored 200-year-old Portuguese home features original tile floors, high ceilings, and a lush garden courtyard. Just a 5-minute walk to the pristine Benaulim beach.",
            "location": "Benaulim Village, South Goa",
            "city": "Goa",
            "latitude": 15.2661,
            "longitude": 73.9283,
            "property_type": "heritage",
            "price_per_night": 6800,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 3,
            "bathrooms": 2,
            "host_idx": 0,
            "amenities": [0, 1, 2, 8, 12, 16],
            "images": [
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            ],
            "avg_rating": 4.7,
            "review_count": 32,
        },
        # MANALI - Mountain
        {
            "title": "Cedar Wood Cabin with Himalayan Views",
            "description": "Escape to this stunning hand-crafted cedar cabin perched at 2,200m in the Kullu Valley. With floor-to-ceiling windows framing dramatic snow-capped peaks, a wood-burning fireplace, and outdoor hot tub, this is the ultimate mountain sanctuary. Perfect for couples and small families seeking a true Himalayan experience.",
            "location": "Solang Valley, Manali",
            "city": "Manali",
            "latitude": 32.3148,
            "longitude": 77.1855,
            "property_type": "cabin",
            "price_per_night": 9200,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 1.5,
            "host_idx": 1,
            "amenities": [0, 1, 2, 3, 7, 9, 12, 15, 16, 19],
            "images": [
                "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
                "https://images.unsplash.com/photo-1520984032042-162d526883e0?w=800",
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
                "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=800",
            ],
            "avg_rating": 4.95,
            "review_count": 89,
        },
        {
            "title": "Luxury Alpine Chalet in Old Manali",
            "description": "A magnificent 3-bedroom chalet with traditional Himachali architecture and modern luxury. Featuring a private terrace with breathtaking views of the Beas river valley, a fully equipped gourmet kitchen, and authentic local furnishings. Our caretaker is available 24/7 to ensure your perfect stay.",
            "location": "Old Manali Market Road",
            "city": "Manali",
            "latitude": 32.2735,
            "longitude": 77.1755,
            "property_type": "cabin",
            "price_per_night": 12500,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "bathrooms": 2,
            "host_idx": 1,
            "amenities": [0, 1, 2, 3, 7, 8, 11, 12, 15, 19],
            "images": [
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
                "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
                "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=800",
                "https://images.unsplash.com/photo-1594490349279-84cdc002dca9?w=800",
            ],
            "avg_rating": 4.8,
            "review_count": 56,
        },
        # UDAIPUR - Heritage
        {
            "title": "Royal Haveli Suite overlooking Lake Pichola",
            "description": "Experience Rajputana grandeur in this magnificent suite within a 16th-century haveli overlooking the shimmering Lake Pichola and City Palace. Adorned with original frescoes, hand-carved marble, and antique furnishings, this is truly a once-in-a-lifetime stay. Rooftop dining with lake views is available on request.",
            "location": "Lal Ghat, Old City Udaipur",
            "city": "Udaipur",
            "latitude": 24.5770,
            "longitude": 73.6835,
            "property_type": "heritage",
            "price_per_night": 22000,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 2,
            "amenities": [0, 1, 12, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
                "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
                "https://images.unsplash.com/photo-1587213811864-50b37b6cde28?w=800",
            ],
            "avg_rating": 4.9,
            "review_count": 124,
        },
        {
            "title": "Garden Villa with Private Pool near City Palace",
            "description": "A beautifully landscaped garden villa set within walking distance of Udaipur's stunning City Palace. This 2-bedroom retreat features a private heated pool, dedicated butler service, and Rajasthani-themed decor. The rooftop terrace offers unobstructed sunset views over the Aravalli hills.",
            "location": "Fateh Sagar Road, Udaipur",
            "city": "Udaipur",
            "latitude": 24.5993,
            "longitude": 73.6838,
            "property_type": "villa",
            "price_per_night": 15800,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 3,
            "bathrooms": 2,
            "host_idx": 2,
            "amenities": [0, 1, 2, 3, 4, 8, 10, 12, 14, 19],
            "images": [
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            ],
            "avg_rating": 4.85,
            "review_count": 78,
        },
        # MUMBAI - City
        {
            "title": "Luxury Sea-View Apartment in Bandra West",
            "description": "Live like a Bollywood star in this ultra-modern 2-bedroom apartment in the heart of Bandra West. Panoramic Arabian Sea views from every room, top-of-the-line amenities, and steps away from Mumbai's best restaurants, cafés, and nightlife. The apartment features smart home technology and a private concierge service.",
            "location": "Hill Road, Bandra West, Mumbai",
            "city": "Mumbai",
            "latitude": 19.0596,
            "longitude": 72.8295,
            "property_type": "apartment",
            "price_per_night": 14500,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 2,
            "host_idx": 3,
            "amenities": [0, 1, 2, 3, 10, 12, 13, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
                "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
            ],
            "avg_rating": 4.7,
            "review_count": 203,
        },
        {
            "title": "Penthouse Studio in Lower Parel",
            "description": "A sleek, architect-designed studio apartment on the 32nd floor of a premium residential tower in Lower Parel. Perfect for business travelers and solo explorers, featuring a state-of-the-art workspace, floor-to-ceiling windows, and access to a rooftop infinity pool and gym.",
            "location": "Kamala Mills, Lower Parel, Mumbai",
            "city": "Mumbai",
            "latitude": 19.0139,
            "longitude": 72.8293,
            "property_type": "studio",
            "price_per_night": 8500,
            "max_guests": 2,
            "bedrooms": 0,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 3,
            "amenities": [0, 1, 2, 3, 4, 10, 12, 13, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
                "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
                "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
            ],
            "avg_rating": 4.6,
            "review_count": 89,
        },
        # COORG - Forest
        {
            "title": "Coffee Estate Bungalow in Coorg",
            "description": "Immerse yourself in the fragrant coffee and spice estates of Coorg at this beautifully restored colonial bungalow. Set within a 50-acre working coffee plantation, the property offers guided plantation walks, bird watching, and a private waterfall just 10 minutes away on foot. Freshly brewed estate coffee served daily.",
            "location": "Madikeri Coffee Estate, Coorg",
            "city": "Coorg",
            "latitude": 12.4222,
            "longitude": 75.7418,
            "property_type": "house",
            "price_per_night": 11200,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "bathrooms": 2,
            "host_idx": 4,
            "amenities": [0, 2, 3, 8, 9, 12, 14, 17],
            "images": [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
                "https://images.unsplash.com/photo-1518602164578-cd0074062767?w=800",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            ],
            "avg_rating": 4.88,
            "review_count": 167,
        },
        {
            "title": "Treehouse Retreat above Jungle Canopy",
            "description": "Live among the trees in this extraordinary treehouse built 30 feet above the forest floor of a private jungle reserve. Accessible via a rope bridge, the house features a glass-floor bathroom, star-gazing deck, and unrivaled views of the surrounding wildlife. This is true off-grid luxury.",
            "location": "Virajpet Jungle Reserve, Coorg",
            "city": "Coorg",
            "latitude": 12.1994,
            "longitude": 75.8076,
            "property_type": "treehouse",
            "price_per_night": 16000,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 4,
            "amenities": [0, 8, 9, 12, 14, 17],
            "images": [
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
                "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800",
                "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
                "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
            ],
            "avg_rating": 4.93,
            "review_count": 211,
        },
        # JAIPUR - Heritage
        {
            "title": "Heritage Haveli Suite in Pink City",
            "description": "Step back into Rajasthan's royal past in this magnificent suite within a 17th-century haveli in Jaipur's old city. The room features original Rajput architecture with intricate jali work, hand-painted murals, and a courtyard with a centurion fountain. Just 5 minutes walk to Hawa Mahal.",
            "location": "Tripolia Bazaar, Old City Jaipur",
            "city": "Jaipur",
            "latitude": 26.9248,
            "longitude": 75.8236,
            "property_type": "heritage",
            "price_per_night": 8900,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 2,
            "amenities": [0, 1, 12, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800",
                "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
                "https://images.unsplash.com/photo-1587213811864-50b37b6cde28?w=800",
            ],
            "avg_rating": 4.75,
            "review_count": 93,
        },
        {
            "title": "Luxury Fort Hotel Room near Amer Fort",
            "description": "A stunning luxury room carved into the walls of a restored 16th century fort on the outskirts of Jaipur. Featuring a private plunge pool, panoramic views of the Aravalli hills, and direct access to the fort's historic ramparts. Complimentary elephant ride and heritage tour included.",
            "location": "Near Amer Fort, Jaipur",
            "city": "Jaipur",
            "latitude": 26.9855,
            "longitude": 75.8513,
            "property_type": "heritage",
            "price_per_night": 28000,
            "max_guests": 3,
            "bedrooms": 1,
            "beds": 2,
            "bathrooms": 1,
            "host_idx": 2,
            "amenities": [0, 1, 4, 12, 13, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1596395819099-b01a0e55a7ba?w=800",
                "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
                "https://images.unsplash.com/photo-1599940778173-e276d4acb2bb?w=800",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            ],
            "avg_rating": 4.97,
            "review_count": 338,
        },
        # KERALA - Backwaters
        {
            "title": "Luxury Houseboat on Alleppey Backwaters",
            "description": "Float through the serene backwaters of Kerala in this premium 2-bedroom houseboat. Wake up to mist rising over paddy fields, watch fishermen cast their traditional Chinese fishing nets, and feast on authentic Kerala cuisine prepared by your onboard chef. Truly one of India's most magical travel experiences.",
            "location": "Vembanad Lake, Alleppey",
            "city": "Alleppey",
            "latitude": 9.4981,
            "longitude": 76.3388,
            "property_type": "houseboat",
            "price_per_night": 19500,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 2,
            "host_idx": 4,
            "amenities": [0, 1, 2, 12, 14, 16],
            "images": [
                "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800",
                "https://images.unsplash.com/photo-1602002418153-50d5b6d00e28?w=800",
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
                "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800",
            ],
            "avg_rating": 4.92,
            "review_count": 276,
        },
        {
            "title": "Jungle Lodge in Wayanad Tea Gardens",
            "description": "A sustainably built eco-lodge nestled within 200 acres of organically farmed tea and coffee estates in Wayanad. Each villa is set on raised stilts with views of the misty Nilgiri hills. The lodge runs entirely on solar power and offers guided tribal village tours, bamboo rafting, and wildlife safaris.",
            "location": "Kalpetta, Wayanad, Kerala",
            "city": "Wayanad",
            "latitude": 11.6085,
            "longitude": 76.0828,
            "property_type": "farm_stay",
            "price_per_night": 13800,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 2,
            "host_idx": 4,
            "amenities": [0, 8, 12, 14, 17],
            "images": [
                "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
                "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800",
            ],
            "avg_rating": 4.85,
            "review_count": 134,
        },
        # DARJEELING - Tea Garden
        {
            "title": "Heritage Tea Planter's Bungalow",
            "description": "A beautifully preserved colonial-era tea planter's bungalow set within a working Darjeeling tea estate with panoramic Himalayan views. Watch the sunrise over Kanchenjunga while sipping freshly plucked second-flush Darjeeling tea on your private veranda. The bungalow retains its original 1920s furnishings and charm.",
            "location": "Happy Valley Tea Estate, Darjeeling",
            "city": "Darjeeling",
            "latitude": 27.0360,
            "longitude": 88.2627,
            "property_type": "heritage",
            "price_per_night": 10500,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 1.5,
            "host_idx": 1,
            "amenities": [0, 8, 12, 14, 15, 17],
            "images": [
                "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
                "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800",
            ],
            "avg_rating": 4.82,
            "review_count": 98,
        },
        # RISHIKESH - Yoga/Adventure
        {
            "title": "Ganges River Yoga Retreat Cottage",
            "description": "A tranquil riverside cottage nestled between ancient ashrams on the banks of the sacred Ganges in Rishikesh. Wake up to yoga and meditation sessions, participate in Ganga aarti ceremonies, and embark on thrilling whitewater rafting adventures. This is the ultimate mind-body reset.",
            "location": "Tapovan, Rishikesh",
            "city": "Rishikesh",
            "latitude": 30.1278,
            "longitude": 78.3246,
            "property_type": "cabin",
            "price_per_night": 5800,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 1,
            "amenities": [0, 8, 12, 14],
            "images": [
                "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800",
                "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800",
                "https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?w=800",
                "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
            ],
            "avg_rating": 4.78,
            "review_count": 145,
        },
        {
            "title": "Luxury Glamping Tent by the Ganges",
            "description": "Experience the magic of camping without sacrificing comfort in these luxurious Swiss-style glamping tents on the Ganges banks. Each tent features a real bed, private attached bathroom with hot shower, electricity, and a private deck overlooking the river. Adventure activities bookable directly through your host.",
            "location": "Shivpuri, Rishikesh",
            "city": "Rishikesh",
            "latitude": 30.1600,
            "longitude": 78.3833,
            "property_type": "cabin",
            "price_per_night": 7500,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 1,
            "amenities": [0, 2, 8, 9, 12, 14],
            "images": [
                "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800",
                "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800",
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
                "https://images.unsplash.com/photo-1516649185062-243efcfefa2e?w=800",
            ],
            "avg_rating": 4.72,
            "review_count": 87,
        },
        # SHIMLA - Colonial
        {
            "title": "Victorian Colonial Cottage in the Mall",
            "description": "A stunning Victorian-era cottage located directly on Shimla's famous Mall Road. This heritage property features original wood paneling, stained glass windows, cast iron fireplaces, and a private garden with views of the snow-capped Himalayan foothills. Just steps from Shimla's famous Ridge and Christ Church.",
            "location": "The Mall Road, Shimla",
            "city": "Shimla",
            "latitude": 31.1048,
            "longitude": 77.1734,
            "property_type": "heritage",
            "price_per_night": 8200,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 3,
            "bathrooms": 1,
            "host_idx": 1,
            "amenities": [0, 1, 2, 8, 12, 15],
            "images": [
                "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
                "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=800",
            ],
            "avg_rating": 4.68,
            "review_count": 72,
        },
        # MUNNAR - Hill Station
        {
            "title": "Misty Hills Tea Garden Cottage",
            "description": "A romantic hilltop cottage surrounded by emerald tea gardens and rolling mist in Munnar, Kerala's most beautiful hill station. Enjoy spectacular sunrise views over the Western Ghats, guided tea factory tours, and freshly brewed Munnar tea. The cottage sleeps 2 with a cozy loft bedroom and private garden.",
            "location": "Pothamedu View Point, Munnar",
            "city": "Munnar",
            "latitude": 10.0889,
            "longitude": 77.0595,
            "property_type": "cabin",
            "price_per_night": 7200,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 4,
            "amenities": [0, 8, 12, 14, 17],
            "images": [
                "https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a?w=800",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
                "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
            ],
            "avg_rating": 4.88,
            "review_count": 156,
        },
        # OOTY - Nilgiris
        {
            "title": "Blue Mountain Farmhouse in Ooty",
            "description": "A delightful farmhouse nestled in the rolling Nilgiri hills of Ooty, surrounded by strawberry farms, rose gardens, and eucalyptus forests. The property features a private greenhouse, bonfire pit, and breathtaking views of the Blue Mountains. Vegetables and herbs from the garden are incorporated in daily meals.",
            "location": "Fern Hill, Ooty, Tamil Nadu",
            "city": "Ooty",
            "latitude": 11.4102,
            "longitude": 76.6950,
            "property_type": "farm_stay",
            "price_per_night": 6500,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "bathrooms": 2,
            "host_idx": 4,
            "amenities": [0, 8, 9, 12, 14, 17],
            "images": [
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
                "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
                "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800",
                "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800",
            ],
            "avg_rating": 4.79,
            "review_count": 113,
        },
        # Additional GOA listing
        {
            "title": "Minimalist Architect Villa with Infinity Pool",
            "description": "An award-winning architect-designed villa that seamlessly blends minimalist luxury with tropical living. Floor-to-ceiling glass walls, an 18-meter infinity pool merging with the horizon, and cutting-edge sustainable design. Located in a private gated community in Assagao, Goa's most coveted neighborhood.",
            "location": "Assagao, North Goa",
            "city": "Goa",
            "latitude": 15.5987,
            "longitude": 73.7747,
            "property_type": "villa",
            "price_per_night": 35000,
            "max_guests": 10,
            "bedrooms": 5,
            "beds": 6,
            "bathrooms": 5,
            "host_idx": 0,
            "amenities": [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=800",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
                "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
                "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800",
                "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800",
            ],
            "avg_rating": 4.96,
            "review_count": 289,
        },
        # ANDAMAN
        {
            "title": "Beachfront Eco-Bungalow in Havelock Island",
            "description": "Wake up to the sound of crystal-clear turquoise waves at this remote eco-bungalow on Havelock Island's famous Radhanagar Beach, consistently rated Asia's best beach. The bungalow is built with local materials, runs on solar power, and offers world-class snorkeling, scuba diving, and kayaking right at your doorstep.",
            "location": "Radhanagar Beach, Havelock Island, Andaman",
            "city": "Andaman",
            "latitude": 11.9926,
            "longitude": 92.9774,
            "property_type": "beach_house",
            "price_per_night": 14000,
            "max_guests": 3,
            "bedrooms": 1,
            "beds": 2,
            "bathrooms": 1,
            "host_idx": 0,
            "amenities": [0, 6, 8, 12, 17],
            "images": [
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
                "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
            ],
            "avg_rating": 4.94,
            "review_count": 187,
        },
        # KASOL
        {
            "title": "Riverside Wooden Cottage in Kasol",
            "description": "A charming wooden cottage perched directly above the glacial Parvati River in Kasol, Himachal Pradesh's most popular backpacker destination. Perfect for solo travelers and couples seeking a peaceful Himalayan escape with trekking, camping, and the famous Israeli food scene nearby.",
            "location": "Kasol Village, Parvati Valley, Himachal Pradesh",
            "city": "Kasol",
            "latitude": 32.0099,
            "longitude": 77.3140,
            "property_type": "cabin",
            "price_per_night": 3500,
            "max_guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "host_idx": 1,
            "amenities": [0, 8, 12, 17],
            "images": [
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
                "https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=800",
                "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800",
                "https://images.unsplash.com/photo-1472791108553-c9405341e398?w=800",
            ],
            "avg_rating": 4.65,
            "review_count": 67,
        },
        # MYSORE
        {
            "title": "Royal Palace View Apartment in Mysore",
            "description": "A beautifully appointed apartment with stunning direct views of the illuminated Mysore Palace, one of India's most spectacular architectural landmarks. The apartment features art deco interiors, a balcony perfect for watching the Friday night palace illumination, and is walking distance from Devaraja Market.",
            "location": "Near Palace Ground, Mysore",
            "city": "Mysore",
            "latitude": 12.3052,
            "longitude": 76.6551,
            "property_type": "apartment",
            "price_per_night": 5500,
            "max_guests": 3,
            "bedrooms": 1,
            "beds": 2,
            "bathrooms": 1,
            "host_idx": 3,
            "amenities": [0, 1, 2, 12, 19],
            "images": [
                "https://images.unsplash.com/photo-1582266255765-fa5cf1a1d501?w=800",
                "https://images.unsplash.com/photo-1596395819099-b01a0e55a7ba?w=800",
                "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
                "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
            ],
            "avg_rating": 4.72,
            "review_count": 88,
        },
    ]

    listing_objs = []
    for l in listings_data:
        listing = Listing(
            title=l["title"],
            description=l["description"],
            location=l["location"],
            city=l["city"],
            country="India",
            latitude=l.get("latitude"),
            longitude=l.get("longitude"),
            property_type=l["property_type"],
            price_per_night=l["price_per_night"],
            max_guests=l["max_guests"],
            bedrooms=l["bedrooms"],
            beds=l["beds"],
            bathrooms=l["bathrooms"],
            host=host_objs[l["host_idx"]],
            avg_rating=l["avg_rating"],
            review_count=l["review_count"],
        )
        db.add(listing)
        listing_objs.append(listing)
    db.flush()

    # Add images
    for idx, (listing_obj, listing_data) in enumerate(zip(listing_objs, listings_data)):
        for i, url in enumerate(listing_data["images"]):
            img = ListingImage(
                listing_id=listing_obj.id,
                url=url,
                is_primary=(i == 0),
                display_order=i,
            )
            db.add(img)

        # Add amenities
        for amenity_idx in listing_data["amenities"]:
            la = ListingAmenity(
                listing_id=listing_obj.id,
                amenity_id=amenity_objs[amenity_idx].id,
            )
            db.add(la)

    db.flush()

    # ─── Bookings & Reviews ────────────────────────────────────────────────────
    past_bookings = [
        {"guest_idx": 0, "listing_idx": 0, "check_in": datetime.now() - timedelta(days=45), "check_out": datetime.now() - timedelta(days=39), "guests": 4, "rating": 5, "comment": "Absolutely magical! The beachfront villa exceeded all our expectations. Priya was an incredible host - responsive, helpful and made us feel right at home. The pool is spectacular and the views are unreal. We'll definitely be back!"},
        {"guest_idx": 1, "listing_idx": 2, "check_in": datetime.now() - timedelta(days=30), "check_out": datetime.now() - timedelta(days=26), "guests": 2, "rating": 5, "comment": "The cedar cabin is simply breathtaking. Waking up to Himalayan views with a cup of chai by the fireplace is something I'll never forget. Rahul was an amazing host. 10/10 recommend!"},
        {"guest_idx": 2, "listing_idx": 4, "check_in": datetime.now() - timedelta(days=60), "check_out": datetime.now() - timedelta(days=58), "guests": 2, "rating": 5, "comment": "Living in a 16th century haveli overlooking Lake Pichola was surreal. Ananya was incredibly knowledgeable about the local history and helped us find the best restaurants and experiences in Udaipur."},
        {"guest_idx": 3, "listing_idx": 6, "check_in": datetime.now() - timedelta(days=20), "check_out": datetime.now() - timedelta(days=17), "guests": 2, "rating": 4, "comment": "Great location in Bandra, very close to amazing restaurants and cafes. The sea views from the bedroom are stunning, especially at sunset. The host was quick to respond to any queries."},
        {"guest_idx": 4, "listing_idx": 9, "check_in": datetime.now() - timedelta(days=90), "check_out": datetime.now() - timedelta(days=88), "guests": 2, "rating": 5, "comment": "The treehouse experience is absolutely one of a kind! Falling asleep to jungle sounds and waking up above the forest canopy is something magical. Deepa arranged everything perfectly."},
        {"guest_idx": 5, "listing_idx": 12, "check_in": datetime.now() - timedelta(days=15), "check_out": datetime.now() - timedelta(days=11), "guests": 2, "rating": 5, "comment": "The houseboat journey through the Kerala backwaters was the highlight of our entire India trip. The chef prepared amazing Kerala seafood meals and the crew was exceptional."},
        {"guest_idx": 6, "listing_idx": 8, "check_in": datetime.now() - timedelta(days=50), "check_out": datetime.now() - timedelta(days=46), "guests": 4, "rating": 5, "comment": "The coffee estate bungalow in Coorg is paradise. We did the plantation walk every morning, picked our own coffee beans, and then relaxed by the waterfall. Perfectly peaceful."},
        {"guest_idx": 7, "listing_idx": 19, "check_in": datetime.now() - timedelta(days=25), "check_out": datetime.now() - timedelta(days=22), "guests": 2, "rating": 5, "comment": "Watching the Mysore Palace light up at night from our balcony was absolutely gorgeous. The apartment was spotlessly clean and the location is perfect for exploring the city."},
        {"guest_idx": 0, "listing_idx": 3, "check_in": datetime.now() - timedelta(days=70), "check_out": datetime.now() - timedelta(days=66), "guests": 5, "rating": 4, "comment": "The alpine chalet is beautiful and spacious. Great base for exploring Old Manali and the surrounding valleys. The caretaker was very helpful and arranged local experiences."},
        {"guest_idx": 1, "listing_idx": 10, "check_in": datetime.now() - timedelta(days=40), "check_out": datetime.now() - timedelta(days=39), "guests": 2, "rating": 5, "comment": "Staying in a 17th century haveli in the Pink City felt like traveling back in time. Walking to Hawa Mahal took just 5 minutes. Ananya is a wonderful host with great local tips!"},
    ]

    # Future bookings (upcoming)
    future_bookings = [
        {"guest_idx": 8, "listing_idx": 0, "check_in": datetime.now() + timedelta(days=10), "check_out": datetime.now() + timedelta(days=14), "guests": 2},
        {"guest_idx": 8, "listing_idx": 20, "check_in": datetime.now() + timedelta(days=30), "check_out": datetime.now() + timedelta(days=35), "guests": 3},
    ]

    for b_data in past_bookings:
        listing = listing_objs[b_data["listing_idx"]]
        guest = guest_objs[b_data["guest_idx"]]
        nights = (b_data["check_out"] - b_data["check_in"]).days
        nightly = listing.price_per_night
        cleaning = round(nightly * 0.1, 2)
        service = round((nightly * nights + cleaning) * 0.12, 2)
        total = round(nightly * nights + cleaning + service, 2)

        booking = Booking(
            guest=guest,
            listing=listing,
            check_in=b_data["check_in"],
            check_out=b_data["check_out"],
            guests=b_data["guests"],
            nightly_price=nightly,
            cleaning_fee=cleaning,
            service_fee=service,
            total=total,
            status="completed",
            booking_ref=generate_booking_ref(),
        )
        db.add(booking)
        db.flush()

        if "rating" in b_data:
            review = Review(
                booking_id=booking.id,
                listing_id=listing.id,
                reviewer_id=guest.id,
                rating=b_data["rating"],
                comment=b_data.get("comment"),
                cleanliness=min(5, b_data["rating"]),
                accuracy=min(5, b_data["rating"]),
                communication=5,
                location_rating=min(5, b_data["rating"]),
                value=min(5, b_data["rating"] - 0 if b_data["rating"] < 5 else 4),
            )
            db.add(review)

    for b_data in future_bookings:
        listing = listing_objs[b_data["listing_idx"]]
        guest = guest_objs[b_data["guest_idx"]]
        nights = (b_data["check_out"] - b_data["check_in"]).days
        nightly = listing.price_per_night
        cleaning = round(nightly * 0.1, 2)
        service = round((nightly * nights + cleaning) * 0.12, 2)
        total = round(nightly * nights + cleaning + service, 2)

        booking = Booking(
            guest=guest,
            listing=listing,
            check_in=b_data["check_in"],
            check_out=b_data["check_out"],
            guests=b_data["guests"],
            nightly_price=nightly,
            cleaning_fee=cleaning,
            service_fee=service,
            total=total,
            status="confirmed",
            booking_ref=generate_booking_ref(),
        )
        db.add(booking)

    db.flush()

    # ─── Favorites ─────────────────────────────────────────────────────────────
    favorites_data = [
        (8, 0), (8, 2), (8, 4), (8, 9), (8, 12),
        (0, 12), (0, 4), (0, 20),
        (1, 9), (1, 4), (1, 11),
    ]
    for user_idx, listing_idx in favorites_data:
        fav = Favorite(
            user_id=guest_objs[user_idx].id,
            listing_id=listing_objs[listing_idx].id,
        )
        db.add(fav)

    db.commit()
    print(f"✅ Database seeded successfully!")
    print(f"   - {len(amenity_objs)} amenities")
    print(f"   - {len(host_objs)} hosts")
    print(f"   - {len(guest_objs)} guests")
    print(f"   - {len(listing_objs)} listings")
    print(f"   - {len(past_bookings) + len(future_bookings)} bookings")
    print(f"   - {len(past_bookings)} reviews")
    print(f"\n🔑 Demo credentials:")
    print(f"   Guest: guest@example.com / password123")
    print(f"   Host:  host@example.com / password123")
    print(f"   Host2: priya.sharma@example.com / password123")

    db.close()


if __name__ == "__main__":
    seed_database()
