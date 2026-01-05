from fastapi import APIRouter, HTTPException
from typing import List
import models, schemas
from uuid import uuid4

router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Product])
async def read_products(skip: int = 0, limit: int = 100):
    products = await models.Product.find_all().skip(skip).limit(limit).to_list()
    return products

@router.get("/{product_id}", response_model=schemas.Product)
async def read_product(product_id: str):
    product = await models.Product.find_one(models.Product.id == product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate):
    if not product.id:
        product.id = str(uuid4())
    
    # Beanie handles document creation
    new_product = models.Product(**product.dict())
    await new_product.insert()
    return new_product

@router.put("/{product_id}", response_model=schemas.Product)
async def update_product(product_id: str, product: schemas.ProductUpdate):
    db_product = await models.Product.find_one(models.Product.id == product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.dict(exclude_unset=True)
    
    # Update fields
    # Beanie allows nice updates, but explicit loop is safe for now
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    await db_product.save()
    return db_product

@router.delete("/{product_id}")
async def delete_product(product_id: str):
    db_product = await models.Product.find_one(models.Product.id == product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db_product.delete()
    return {"message": "Product deleted successfully"}
