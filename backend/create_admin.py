import asyncio
from database import init_db
from models import User
from beanie import init_beanie
from uuid import uuid4
from dotenv import load_dotenv
import os

load_dotenv()

async def create_admin():
    # Initialize database
    client = await init_db()
    await init_beanie(database=client.babadairy, document_models=[User])
    
    email = "admin@babadairy.com"
    password = "adminpassword123"
    
    # Check if exists
    existing_user = await User.find_one(User.email == email)
    if existing_user:
        print(f"Admin user already exists: {email}")
        return

    admin_user = User(
        id=str(uuid4()),
        name="Admin User",
        email=email,
        password=password,
        phone="+910000000000",
        role="admin",
        addresses=[],
        joined_at="2025-01-01T00:00:00Z"
    )
    
    await admin_user.insert()
    print(f"Admin user created successfully.\nEmail: {email}\nPassword: {password}")

if __name__ == "__main__":
    asyncio.run(create_admin())
