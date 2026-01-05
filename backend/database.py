from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os

# MongoDB Configuration
MONGODB_URL = "mongodb+srv://study:Dheeraj2006@studies.global.mongocluster.cosmos.azure.com/babadairy?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"

async def init_db():
    client = AsyncIOMotorClient(MONGODB_URL)
    # Beanie initialization will happen in main.py startup event
    # passing the document models list
    return client
