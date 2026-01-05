from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

# Product Schemas
class ProductBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    price: float
    discount: Optional[float] = 0
    images: Optional[List[str]] = []
    sizes: Optional[List[str]] = []
    stock: Optional[int] = 0
    low_stock_threshold: Optional[int] = 10
    flavors: Optional[List[str]] = []
    dietary: Optional[List[str]] = []
    ingredients: Optional[str] = ""
    nutrition: Optional[Dict[str, Any]] = {}
    status: Optional[str] = "active"
    featured: Optional[bool] = False
    rating: Optional[float] = 0
    review_count: Optional[int] = 0

class ProductCreate(ProductBase):
    id: Optional[str] = None 

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    rating: float
    review_count: int
    created_at: str
    updated_at: str

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    role: Optional[str] = "customer"
    addresses: Optional[List[Dict[str, Any]]] = []

class UserCreate(UserBase):
    password: str
    id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    joined_at: str

# Order Schemas
class OrderBase(BaseModel):
    order_number: str
    user_id: str
    customer: Dict[str, Any]
    items: List[Dict[str, Any]]
    subtotal: float
    tax: float
    delivery_charges: float
    discount: Optional[float] = 0
    total: float
    payment_method: str
    payment_status: Optional[str] = "pending"
    invoice_number: Optional[str] = None
    status: Optional[str] = "pending"
    estimated_delivery: Optional[str] = None

class OrderCreate(OrderBase):
    id: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    total: Optional[float] = None

class Order(OrderBase):
    id: str
    status_history: List[Dict[str, Any]]
    created_at: str
    updated_at: str

# Review Schemas
class ReviewBase(BaseModel):
    product_id: str
    user_id: str
    user_name: str
    rating: int
    title: Optional[str] = ""
    comment: Optional[str] = ""
    images: Optional[List[str]] = []
    verified: Optional[bool] = False

class ReviewCreate(ReviewBase):
    id: Optional[str] = None

class Review(ReviewBase):
    id: str
    created_at: str
