from fastapi import APIRouter, HTTPException
from typing import List, Any
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


def _safe_id(obj: Any, default: str = None) -> str:
    """Get string id from Beanie doc; avoid None/ObjectId serialization errors."""
    default = default or str(uuid4())
    raw = getattr(obj, "id", None)
    if raw is not None:
        return str(raw)
    doc = getattr(obj, "model_dump", lambda: {})()
    return str(doc.get("id") or doc.get("_id", "") or default)


def _product_to_response(p: Any) -> dict:
    """Build response dict for Product schema; safe id and dates."""
    return {
        "id": _safe_id(p),
        "name": getattr(p, "name", "") or "",
        "category": getattr(p, "category", "") or "",
        "description": getattr(p, "description", "") or "",
        "price": float(getattr(p, "price", 0) or 0),
        "discount": float(getattr(p, "discount", 0) or 0),
        "images": getattr(p, "images", []) or [],
        "sizes": getattr(p, "sizes", []) or [],
        "price_by_size": getattr(p, "price_by_size", None),
        "stock": int(getattr(p, "stock", 0) or 0),
        "low_stock_threshold": int(getattr(p, "low_stock_threshold", 10) or 10),
        "flavors": getattr(p, "flavors", []) or [],
        "dietary": getattr(p, "dietary", []) or [],
        "ingredients": getattr(p, "ingredients", "") or "",
        "nutrition": getattr(p, "nutrition", {}) or {},
        "status": getattr(p, "status", "active") or "active",
        "featured": bool(getattr(p, "featured", False)),
        "rating": float(getattr(p, "rating", 0) or 0),
        "review_count": int(getattr(p, "review_count", 0) or 0),
        "created_at": getattr(p, "created_at", "") or "",
        "updated_at": getattr(p, "updated_at", "") or "",
    }


@router.get("/", response_model=List[schemas.Product])
async def read_products(skip: int = 0, limit: int = 1000):
    """
    Get all products with pagination.
    Default limit is 1000 to support large product catalogs.
    Use skip and limit for pagination if needed.
    """
    try:
        safe_limit = min(limit, 10000)
        products = await models.Product.find_all().skip(skip).limit(safe_limit).to_list()
        return [_product_to_response(pr) for pr in products]
    except Exception as e:
        logger.error(f"Error fetching products: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@router.get("/{product_id}", response_model=schemas.Product)
async def read_product(product_id: str):
    try:
        product = await models.Product.find_one(models.Product.id == product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        return _product_to_response(product)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch product: {str(e)}")

@router.post("/", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate):
    try:
        # Use model_dump() for Pydantic v2, or dict() for v1
        try:
            product_data = product.model_dump() if hasattr(product, 'model_dump') else product.dict()
        except AttributeError:
            product_data = product.dict()
        
        # Check if product with this ID already exists
        product_id = product_data.get('id')
        if product_id:
            existing_product = await models.Product.find_one(models.Product.id == product_id)
            if existing_product:
                # Product exists, update it instead
                logger.info(f"Product with ID {product_id} already exists, updating instead of creating")
                for key, value in product_data.items():
                    if key != 'id' and hasattr(existing_product, key):  # Don't update ID
                        setattr(existing_product, key, value)
                existing_product.updated_at = datetime.now().isoformat()
                await existing_product.save()
                return _product_to_response(existing_product)

        # Generate new ID if not provided or if it doesn't exist
        if not product_id:
            product_data['id'] = str(uuid4())
        
        new_product = models.Product(**product_data)
        new_product.created_at = datetime.now().isoformat()
        new_product.updated_at = datetime.now().isoformat()
        await new_product.insert()
        return _product_to_response(new_product)
    except Exception as e:
        logger.error(f"Error creating product: {e}", exc_info=True)
        # Check if it's a duplicate key error
        if "Duplicate key" in str(e) or "11000" in str(e):
            raise HTTPException(status_code=409, detail=f"Product with this ID already exists. Use PUT to update instead.")
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
        
        # Remove 'id' from update_data to prevent changing the ID
        update_data.pop('id', None)
        
        # Update fields
        for key, value in update_data.items():
            if hasattr(db_product, key) and key != 'id':  # Don't allow ID changes
                setattr(db_product, key, value)
        
        # Update timestamp
        db_product.updated_at = datetime.now().isoformat()
        
        await db_product.save()
        return _product_to_response(db_product)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}", exc_info=True)
        # Check if it's a duplicate key error
        if "Duplicate key" in str(e) or "11000" in str(e):
            raise HTTPException(status_code=409, detail=f"Duplicate key error: {str(e)}")
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
