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


@router.get("/public")
async def get_public_settings():
    """Get public settings (for frontend display)"""
    settings = await SiteSettings.find_one(SiteSettings.id == "site_settings")
    if not settings:
        settings = SiteSettings(id="site_settings")
        await settings.insert()
    
    # Return only public-facing settings
    return {
        "storeName": settings.store_name,
        "storeTagline": settings.store_tagline,
        "storeDescription": settings.store_description,
        "storeEmail": settings.store_email,
        "storePhone": settings.store_phone,
        "storeAddress": settings.store_address,
        "storeCity": settings.store_city,
        "storeState": settings.store_state,
        "storePincode": settings.store_pincode,
        
        "heroTitle": settings.hero_title,
        "heroHighlight": settings.hero_highlight,
        "heroSubtitle": settings.hero_subtitle,
        "heroBadge": settings.hero_badge,
        
        "features": settings.features,
        "trustIndicators": settings.trust_indicators,
        
        "aboutTitle": settings.about_title,
        "aboutSubtitle": settings.about_subtitle,
        "aboutDescription": settings.about_description,
        "aboutYearFounded": settings.about_year_founded,
        
        "categories": settings.categories,
        "carouselImages": settings.carousel_images,
        
        "productCategories": settings.product_categories,
        "productSizes": settings.product_sizes,
        "productFlavors": settings.product_flavors,
        "productDietary": settings.product_dietary,
        
        "taxRate": settings.tax_rate,
        "deliveryCharges": settings.delivery_charges,
        "freeDeliveryThreshold": settings.free_delivery_threshold,
        "minOrderAmount": settings.min_order_amount,
        "estimatedDeliveryDays": settings.estimated_delivery_days,
        
        "enableCOD": settings.enable_cod,
        "enableUPI": settings.enable_upi,
        "enableCard": settings.enable_card,
        
        "socialInstagram": settings.social_instagram,
        "socialFacebook": settings.social_facebook,
        "socialTwitter": settings.social_twitter,
        "socialWhatsapp": settings.social_whatsapp,
        
        "footerText": settings.footer_text,
    }

