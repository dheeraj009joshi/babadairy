from beanie import Document
from typing import List, Optional, Any, Dict
from pydantic import Field
import datetime
from uuid import uuid4

class Product(Document):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    category: str
    description: str = ""
    price: float
    discount: float = 0
    images: List[str] = []
    sizes: List[str] = []
    stock: int = 0
    low_stock_threshold: int = 10
    flavors: List[str] = []
    dietary: List[str] = []
    rating: float = 0
    review_count: int = 0
    ingredients: str = ""
    nutrition: Dict[str, Any] = {}
    status: str = "active"
    featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())

    class Settings:
        name = "products"

class User(Document):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    password: str # Hashed
    role: str = "customer"
    addresses: List[Dict[str, Any]] = []
    joined_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())

    class Settings:
        name = "users"

class Order(Document):
    id: str = Field(default_factory=lambda: str(uuid4()))
    order_number: str
    user_id: str
    customer: Dict[str, Any] # Stores snapshot of customer details
    items: List[Dict[str, Any]] # Stores snapshot of items
    subtotal: float
    tax: float
    delivery_charges: float
    discount: float = 0
    total: float
    payment_method: str
    payment_status: str = "pending"
    invoice_number: Optional[str] = None
    status: str = "pending"
    status_history: List[Dict[str, Any]] = []
    estimated_delivery: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())

    class Settings:
        name = "orders"

class Review(Document):
    id: str = Field(default_factory=lambda: str(uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int
    title: str = ""
    comment: str = ""
    images: List[str] = []
    verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())

    class Settings:
        name = "reviews"
