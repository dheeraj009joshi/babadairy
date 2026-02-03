from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os

# MongoDB Configuration from environment variables
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/babadairy")
DATABASE_NAME = os.getenv("DATABASE_NAME", "babadairy")

async def init_db():
    client = AsyncIOMotorClient(MONGODB_URL)
    print(f"Connected to MongoDB: {client}")
    # Beanie initialization will happen in main.py startup event
    # passing the document models list
    return client
