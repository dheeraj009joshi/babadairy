from fastapi import APIRouter, HTTPException
from typing import List
import models, schemas
from uuid import uuid4
import logging
from datetime import datetime

router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.get("/", response_model=List[schemas.Product])
async def read_products(skip: int = 0, limit: int = 100):
    try:
        products = await models.Product.find_all().skip(skip).limit(limit).to_list()
        return products
    except Exception as e:
        logger.error(f"Error fetching products: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@router.get("/{product_id}", response_model=schemas.Product)
async def read_product(product_id: str):
    try:
        product = await models.Product.find_one(models.Product.id == product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch product: {str(e)}")

@router.post("/", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate):
    try:
        if not product.id:
            product.id = str(uuid4())
        
        # Use model_dump() for Pydantic v2, or dict() for v1
        try:
            product_data = product.model_dump() if hasattr(product, 'model_dump') else product.dict()
        except AttributeError:
            product_data = product.dict()
        
        # Beanie handles document creation
        new_product = models.Product(**product_data)
        new_product.created_at = datetime.now().isoformat()
        new_product.updated_at = datetime.now().isoformat()
        await new_product.insert()
        return new_product
    except Exception as e:
        logger.error(f"Error creating product: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

@router.put("/{product_id}", response_model=schemas.Product)
async def update_product(product_id: str, product: schemas.ProductUpdate):
    try:
        db_product = await models.Product.find_one(models.Product.id == product_id)
        if db_product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Use model_dump() for Pydantic v2, or dict() for v1
        try:
            update_data = product.model_dump(exclude_unset=True) if hasattr(product, 'model_dump') else product.dict(exclude_unset=True)
        except AttributeError:
            update_data = product.dict(exclude_unset=True)
        
        # Update fields
        for key, value in update_data.items():
            if hasattr(db_product, key):
                setattr(db_product, key, value)
        
        # Update timestamp
        db_product.updated_at = datetime.now().isoformat()
        
        await db_product.save()
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")

@router.delete("/{product_id}")
async def delete_product(product_id: str):
    try:
        db_product = await models.Product.find_one(models.Product.id == product_id)
        if db_product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        
        await db_product.delete()
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")
