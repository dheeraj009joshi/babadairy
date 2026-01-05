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
    return users

@router.get("/{user_id}", response_model=schemas.User)
async def read_user(user_id: str):
    user = await models.User.find_one(models.User.id == user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate):
    existing_user = await models.User.find_one(models.User.email == user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    if not user.id:
        user.id = str(uuid4())
        
    new_user = models.User(**user.dict())
    await new_user.insert()
    return new_user

@router.post("/login", response_model=schemas.User)
async def login_user(credentials: schemas.UserLogin):
    user = await models.User.find_one(models.User.email == credentials.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Check password (plain text for now as per seed, normally hash check)
    if user.password != credentials.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    return user

@router.put("/{user_id}/addresses")
async def update_user_addresses(user_id: str, addresses_data: dict):
    user = await models.User.find_one(models.User.id == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.addresses = addresses_data.get("addresses", [])
    await user.save()
    
    return {"message": "Addresses updated successfully", "addresses": user.addresses}
