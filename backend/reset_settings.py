"""
Script to reset site settings to Baba Dairy defaults (3 categories only)
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import SiteSettings
import os
from dotenv import load_dotenv

load_dotenv()

async def reset_settings():
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.babadairy
    
    await init_beanie(database=db, document_models=[SiteSettings])
    
    existing = await SiteSettings.find_one(SiteSettings.id == "site_settings")
    if existing:
        await existing.delete()
        print("Deleted existing settings")
    
    new_settings = SiteSettings(id="site_settings")
    await new_settings.insert()
    print("Created new settings with Baba Dairy defaults")
    
    settings = await SiteSettings.find_one(SiteSettings.id == "site_settings")
    print(f"Store Name: {settings.store_name}")
    print(f"Categories: {[c['name'] for c in settings.categories]}")
    print("Settings reset complete!")

if __name__ == "__main__":
    asyncio.run(reset_settings())
