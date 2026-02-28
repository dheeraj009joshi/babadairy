from fastapi import APIRouter, HTTPException
from typing import List
import models, schemas
from uuid import uuid4

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.User])
async def read_users(skip: int = 0, limit: int = 100):
    users = await models.User.find_all().skip(skip).limit(limit).to_list()
    return [_user_to_response(u) for u in users]

@router.get("/{user_id}", response_model=schemas.User)
async def read_user(user_id: str):
    user = await models.User.find_one(models.User.id == user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_to_response(user)

@router.post("/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate):
    existing_user = await models.User.find_one(models.User.email == user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = user.id or str(uuid4())
    new_user = models.User(id=user_id, name=user.name, email=user.email, phone=user.phone, password=user.password, role=user.role or "customer", addresses=user.addresses or [])
    await new_user.insert()
    return _user_to_response(new_user)

def _user_to_response(user) -> dict:
    """Build response dict for User schema; avoid None id/jointed_at which cause 500."""
    raw_id = getattr(user, "id", None)
    if raw_id is not None:
        user_id = str(raw_id)
    else:
        # Beanie may store id in _id or separate field
        doc = getattr(user, "model_dump", lambda: {})()
        user_id = doc.get("id") or (str(doc.get("_id", "")) if doc.get("_id") else None)
    if not user_id:
        user_id = str(uuid4())
    joined = getattr(user, "joined_at", None) or ""
    if joined is None:
        joined = ""
    return {
        "id": user_id,
        "name": getattr(user, "name", "") or "",
        "email": getattr(user, "email", "") or "",
        "phone": getattr(user, "phone") or None,
        "role": getattr(user, "role", "customer") or "customer",
        "addresses": getattr(user, "addresses", []) or [],
        "joined_at": joined if isinstance(joined, str) else str(joined),
    }


@router.post("/login", response_model=schemas.User)
async def login_user(credentials: schemas.UserLogin):
    user = await models.User.find_one(models.User.email == credentials.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if user.password != credentials.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    return _user_to_response(user)

@router.put("/{user_id}/addresses")
async def update_user_addresses(user_id: str, addresses_data: dict):
    user = await models.User.find_one(models.User.id == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.addresses = addresses_data.get("addresses", [])
    await user.save()
    
    return {"message": "Addresses updated successfully", "addresses": user.addresses}
