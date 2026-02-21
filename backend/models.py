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
    price: float  # Base price (for backward compatibility)
    discount: float = 0
    images: List[str] = []
    sizes: List[str] = []
    price_by_size: Optional[Dict[str, float]] = None  # Size-based pricing: {"Small (100ml)": 100.0, "Medium (250ml)": 200.0, ...}
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


class SiteSettings(Document):
    id: str = Field(default="site_settings")
    
    # Store Info
    store_name: str = "Baba Dairy"
    store_tagline: str = "Premium Sweets, Ice Cream & Bakery"
    store_description: str = "Delicious sweets, artisan ice creams, and fresh bakery items crafted with love and tradition."
    store_email: str = "contact@babadairy.com"
    store_phone: str = "+91 98765 43210"
    store_address: str = "123 Sweet Street"
    store_city: str = "Mumbai"
    store_state: str = "Maharashtra"
    store_pincode: str = "400001"
    store_gstin: str = ""
    
    # Hero Section
    hero_title: str = "Taste the"
    hero_highlight: str = "Tradition"
    hero_subtitle: str = "Premium sweets, artisan ice creams, and fresh bakery items crafted with love. Every bite tells a story of tradition and quality."
    hero_badge: str = "Handcrafted with Love"
    
    # Features/USPs
    features: List[Dict[str, Any]] = [
        {"icon": "Leaf", "title": "Fresh Ingredients", "description": "Made with quality ingredients and authentic recipes"},
        {"icon": "Heart", "title": "Made with Love", "description": "Every batch is crafted with passion and care"},
        {"icon": "Truck", "title": "Free Delivery", "description": "Free home delivery on orders above ₹500"},
        {"icon": "Clock", "title": "Fresh Daily", "description": "Prepared fresh every day with finest ingredients"},
    ]
    
    # Trust Indicators
    trust_indicators: List[Dict[str, str]] = [
        {"icon": "★★★★★", "text": "4.9 Rating"},
        {"icon": "🚚", "text": "Free Delivery"},
        {"icon": "✨", "text": "Fresh Daily"},
    ]
    
    # About Section
    about_title: str = "Our Story"
    about_subtitle: str = "A Journey of Passion & Tradition"
    about_description: str = "At Baba Dairy, we believe that every sweet treat is a moment of pure joy – crafted to perfection."
    about_year_founded: str = "2019"
    
    # Categories (only 3 main categories for homepage)
    categories: List[Dict[str, str]] = [
        {"name": "Sweets", "description": "Traditional Indian sweets & mithai", "emoji": "🍬"},
        {"name": "Ice Cream", "description": "Premium handcrafted ice creams", "emoji": "🍨"},
        {"name": "Bakery", "description": "Fresh baked goods & pastries", "emoji": "🥐"},
    ]
    
    # Product Settings (all categories for product management)
    product_categories: List[str] = ["Sweets", "Ice Cream", "Bakery", "Cakes", "Chocolates", "Snacks", "Dry Fruits", "Beverages"]
    product_sizes: List[str] = ["Small", "Medium", "Large", "250g", "500g", "1 Kg", "Family Pack"]
    product_flavors: List[str] = ["Traditional", "Chocolate", "Vanilla", "Strawberry", "Mango", "Butterscotch", "Pista", "Kesar", "Rose", "Cardamom"]
    product_dietary: List[str] = ["Vegetarian", "Eggless", "Sugar-Free", "Gluten-Free", "Vegan", "Organic"]
    
    # Carousel Images (admin-defined via Settings; empty until admin adds URLs)
    carousel_images: List[str] = []
    
    # Business Settings
    tax_rate: float = 5.0
    delivery_charges: float = 40.0
    free_delivery_threshold: float = 500.0
    min_order_amount: float = 100.0
    estimated_delivery_days: int = 3
    low_stock_threshold: int = 10
    
    # Payment Methods
    enable_cod: bool = True
    enable_upi: bool = True
    enable_card: bool = True
    
    # Billing
    order_prefix: str = "ORD"
    invoice_prefix: str = "INV"
    
    # Social Links
    social_instagram: str = ""
    social_facebook: str = ""
    social_twitter: str = ""
    social_whatsapp: str = ""
    
    # Footer
    footer_text: str = "© 2024 Baba Dairy. All rights reserved."
    
    # Notifications
    enable_notifications: bool = True
    
    updated_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())

    class Settings:
        name = "site_settings"
