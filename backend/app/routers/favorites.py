from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models.models import Favorite, Listing, User
from app.schemas.schemas import FavoriteOut
from app.utils.auth import require_auth
from app.routers.listings import listing_to_card

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteOut])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    favorites = db.query(Favorite).options(
        joinedload(Favorite.listing).joinedload(Listing.images),
        joinedload(Favorite.listing).joinedload(Listing.host),
    ).filter(Favorite.user_id == current_user.id).all()

    results = []
    for fav in favorites:
        listing_card = listing_to_card(fav.listing, current_user)
        results.append({
            "id": fav.id,
            "listing_id": fav.listing_id,
            "user_id": fav.user_id,
            "created_at": fav.created_at,
            "listing": listing_card,
        })
    return results


@router.post("/{listing_id}", status_code=201)
def add_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.listing_id == listing_id,
    ).first()

    if existing:
        return {"message": "Already favorited", "is_favorite": True}

    fav = Favorite(user_id=current_user.id, listing_id=listing_id)
    db.add(fav)
    db.commit()
    return {"message": "Added to favorites", "is_favorite": True}


@router.delete("/{listing_id}", status_code=200)
def remove_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.listing_id == listing_id,
    ).first()

    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites", "is_favorite": False}
