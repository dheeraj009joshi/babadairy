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


class SiteSettings(Document):
    id: str = Field(default="site_settings")
    
    # Store Info
    store_name: str = "Jas&Mey Ice Cream"
    store_tagline: str = "Premium Ice Creams"
    store_description: str = "Premium artisan ice creams crafted with the finest ingredients."
    store_email: str = "contact@jasmey.com"
    store_phone: str = "+91 98765 43210"
    store_address: str = "123 Ice Cream Lane"
    store_city: str = "Mumbai"
    store_state: str = "Maharashtra"
    store_pincode: str = "400001"
    store_gstin: str = ""
    
    # Hero Section
    hero_title: str = "Scoop into"
    hero_highlight: str = "Happiness"
    hero_subtitle: str = "Premium artisan ice creams crafted with the finest ingredients. Every scoop tells a story of passion and perfection."
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
        {"icon": "❄️", "text": "Fresh Daily"},
    ]
    
    # About Section
    about_title: str = "Our Story"
    about_subtitle: str = "A Journey of Passion & Flavour"
    about_description: str = "At Jas&Mey, we believe that ice cream isn't just a dessert – it's a moment of pure joy."
    about_year_founded: str = "2019"
    
    # Categories
    categories: List[Dict[str, str]] = [
        {"name": "Cups", "description": "Perfect single servings in delicious flavours", "emoji": "🥤"},
        {"name": "Cones", "description": "Classic cones with crispy wafers", "emoji": "🍦"},
        {"name": "Tubs", "description": "Share with family or enjoy yourself", "emoji": "🍨"},
        {"name": "Family Packs", "description": "Perfect for gatherings & celebrations", "emoji": "👨‍👩‍👧‍👦"},
        {"name": "Premium", "description": "Luxury flavours with premium ingredients", "emoji": "✨"},
        {"name": "Specials", "description": "Limited editions & seasonal favourites", "emoji": "🌟"},
    ]
    
    # Product Settings
    product_categories: List[str] = ["Cups", "Cones", "Tubs", "Family Packs", "Premium", "Specials"]
    product_sizes: List[str] = ["Small (100ml)", "Medium (250ml)", "Large (500ml)", "Family (1L)", "Party (2L)"]
    product_flavors: List[str] = ["Vanilla", "Chocolate", "Strawberry", "Mango", "Butterscotch", "Pista", "Kesar", "Black Currant", "Coffee", "Cookies & Cream"]
    product_dietary: List[str] = ["Vegetarian", "Eggless", "Low Fat", "Gluten-Free", "Vegan", "Keto-Friendly", "Organic"]
    
    # Carousel Images
    carousel_images: List[str] = [
        "/img-crausal/8.png",
        "/img-crausal/10.png",
        "/img-crausal/13.png",
        "/img-crausal/14.png",
        "/img-crausal/15.png",
        "/img-crausal/17.png",
        "/img-crausal/21.png",
        "/img-crausal/23.png",
        "/img-crausal/25.png",
        "/img-crausal/26.png",
        "/img-crausal/73.png",
    ]
    
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
    footer_text: str = "© 2024 Jas&Mey. All rights reserved."
    
    # Notifications
    enable_notifications: bool = True
    
    updated_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())

    class Settings:
        name = "site_settings"
