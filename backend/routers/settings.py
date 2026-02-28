from fastapi import APIRouter, HTTPException
from models import SiteSettings
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import datetime

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    # Store Info
    store_name: Optional[str] = None
    store_tagline: Optional[str] = None
    store_description: Optional[str] = None
    store_email: Optional[str] = None
    store_phone: Optional[str] = None
    store_address: Optional[str] = None
    store_city: Optional[str] = None
    store_state: Optional[str] = None
    store_pincode: Optional[str] = None
    store_gstin: Optional[str] = None
    
    # Hero Section
    hero_title: Optional[str] = None
    hero_highlight: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_badge: Optional[str] = None
    
    # Features
    features: Optional[List[Dict[str, Any]]] = None
    
    # Trust Indicators
    trust_indicators: Optional[List[Dict[str, str]]] = None
    
    # About Section
    about_title: Optional[str] = None
    about_subtitle: Optional[str] = None
    about_description: Optional[str] = None
    about_year_founded: Optional[str] = None
    
    # Categories
    categories: Optional[List[Dict[str, str]]] = None
    
    # Product Settings
    product_categories: Optional[List[str]] = None
    product_sizes: Optional[List[str]] = None
    product_flavors: Optional[List[str]] = None
    product_dietary: Optional[List[str]] = None
    
    # Carousel Images
    carousel_images: Optional[List[str]] = None
    
    # Business Settings
    tax_rate: Optional[float] = None
    delivery_charges: Optional[float] = None
    free_delivery_threshold: Optional[float] = None
    min_order_amount: Optional[float] = None
    estimated_delivery_days: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    
    # Payment Methods
    enable_cod: Optional[bool] = None
    enable_upi: Optional[bool] = None
    enable_card: Optional[bool] = None
    
    # Billing
    order_prefix: Optional[str] = None
    invoice_prefix: Optional[str] = None
    
    # Social Links
    social_instagram: Optional[str] = None
    social_facebook: Optional[str] = None
    social_twitter: Optional[str] = None
    social_whatsapp: Optional[str] = None
    
    # Footer
    footer_text: Optional[str] = None
    
    # Notifications
    enable_notifications: Optional[bool] = None


@router.get("/")
async def get_settings():
    """Get site settings (creates default if not exists)"""
    settings = await SiteSettings.find_one(SiteSettings.id == "site_settings")
    if not settings:
        # Create default settings
        settings = SiteSettings(id="site_settings")
        await settings.insert()
    return settings.model_dump()


@router.put("/")
async def update_settings(update_data: SettingsUpdate):
    """Update site settings (admin only)"""
    try:
        settings = await SiteSettings.find_one(SiteSettings.id == "site_settings")
        if not settings:
            settings = SiteSettings(id="site_settings")
            await settings.insert()
        
        # Get all fields from the update request (including None values)
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Log what we're trying to update
        print(f"[Settings] Updating fields: {list(update_dict.keys())}")
        
        # Update only provided fields (skip None values)
        update_fields = {}
        for key, value in update_dict.items():
            if value is not None:  # Only update non-None values
                if hasattr(settings, key):
                    update_fields[key] = value
                    setattr(settings, key, value)
                    print(f"[Settings] Updated {key} = {value}")
                else:
                    print(f"[Settings] Warning: Field {key} does not exist in SiteSettings model")
        
        # Always update the timestamp
        settings.updated_at = datetime.datetime.now().isoformat()
        update_fields["updated_at"] = settings.updated_at
        
        # Save to database using save() method
        try:
            await settings.save()
            print(f"[Settings] Successfully saved settings to database using save()")
        except Exception as save_error:
            print(f"[Settings] save() failed: {save_error}, trying replace()")
            # If save() fails, try replace()
            await settings.replace()
            print(f"[Settings] Successfully saved settings to database using replace()")
        
        # Verify the save by fetching again
        saved_settings = await SiteSettings.find_one(SiteSettings.id == "site_settings")
        if saved_settings:
            print(f"[Settings] Verification: store_name = {saved_settings.store_name}")
        
        return settings.model_dump()
    except Exception as e:
        print(f"[Settings] Error updating settings: {str(e)}")
        print(f"[Settings] Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")


def _safe_get(settings, attr, default=None):
    """Get attribute from settings document without raising."""
    try:
        val = getattr(settings, attr, default)
        return val if val is not None else default
    except Exception:
        return default


@router.get("/public")
async def get_public_settings():
    """Get public settings (for frontend display)"""
    try:
        settings = await SiteSettings.find_one(SiteSettings.id == "site_settings")
        if not settings:
            settings = SiteSettings(id="site_settings")
            try:
                await settings.insert()
            except Exception as insert_err:
                # Document might already exist (e.g. race), fetch again
                print(f"[Settings] insert said: {insert_err}")
                settings = await SiteSettings.find_one(SiteSettings.id == "site_settings")
                if not settings:
                    raise
        # Build response with safe defaults so missing/null DB fields don't crash
        return {
            "storeName": _safe_get(settings, "store_name", "Baba Dairy"),
            "storeTagline": _safe_get(settings, "store_tagline", "Premium Sweets, Ice Cream & Bakery"),
            "storeDescription": _safe_get(settings, "store_description", ""),
            "storeEmail": _safe_get(settings, "store_email", ""),
            "storePhone": _safe_get(settings, "store_phone", ""),
            "storeAddress": _safe_get(settings, "store_address", ""),
            "storeCity": _safe_get(settings, "store_city", ""),
            "storeState": _safe_get(settings, "store_state", ""),
            "storePincode": _safe_get(settings, "store_pincode", ""),
            "heroTitle": _safe_get(settings, "hero_title", "Taste the"),
            "heroHighlight": _safe_get(settings, "hero_highlight", "Tradition"),
            "heroSubtitle": _safe_get(settings, "hero_subtitle", ""),
            "heroBadge": _safe_get(settings, "hero_badge", ""),
            "features": _safe_get(settings, "features", []),
            "trustIndicators": _safe_get(settings, "trust_indicators", []),
            "aboutTitle": _safe_get(settings, "about_title", "Our Story"),
            "aboutSubtitle": _safe_get(settings, "about_subtitle", ""),
            "aboutDescription": _safe_get(settings, "about_description", ""),
            "aboutYearFounded": _safe_get(settings, "about_year_founded", "2019"),
            "categories": _safe_get(settings, "categories", []),
            "carouselImages": _safe_get(settings, "carousel_images", []),
            "productCategories": _safe_get(settings, "product_categories", []),
            "productSizes": _safe_get(settings, "product_sizes", []),
            "productFlavors": _safe_get(settings, "product_flavors", []),
            "productDietary": _safe_get(settings, "product_dietary", []),
            "taxRate": _safe_get(settings, "tax_rate", 5.0),
            "deliveryCharges": _safe_get(settings, "delivery_charges", 40.0),
            "freeDeliveryThreshold": _safe_get(settings, "free_delivery_threshold", 500.0),
            "minOrderAmount": _safe_get(settings, "min_order_amount", 100.0),
            "estimatedDeliveryDays": _safe_get(settings, "estimated_delivery_days", 3),
            "enableCOD": _safe_get(settings, "enable_cod", True),
            "enableUPI": _safe_get(settings, "enable_upi", True),
            "enableCard": _safe_get(settings, "enable_card", True),
            "socialInstagram": _safe_get(settings, "social_instagram", ""),
            "socialFacebook": _safe_get(settings, "social_facebook", ""),
            "socialTwitter": _safe_get(settings, "social_twitter", ""),
            "socialWhatsapp": _safe_get(settings, "social_whatsapp", ""),
            "footerText": _safe_get(settings, "footer_text", "© 2024 Baba Dairy. All rights reserved."),
        }
    except Exception as e:
        print(f"[Settings] get_public_settings error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load settings: {str(e)}")

