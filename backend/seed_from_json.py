"""
Script to seed MongoDB from public/data JSON files
"""
import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import Product, User, Order, Review
from database import MONGODB_URL

async def seed_database():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    await init_beanie(database=client.babadairy, document_models=[Product, User, Order, Review])
    
    # Get the path to public/data
    base_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
    
    # Seed Users
    print("Seeding Users...")
    users_path = os.path.join(base_path, 'users.json')
    with open(users_path, 'r') as f:
        users_data = json.load(f)
    
    for user_data in users_data:
        # Check if user exists
        existing = await User.find_one(User.email == user_data['email'])
        if existing:
            print(f"  User {user_data['email']} already exists, updating...")
            existing.name = user_data['name']
            existing.password = user_data['password']
            existing.role = user_data.get('role', 'customer')
            existing.phone = user_data.get('phone')
            existing.addresses = user_data.get('addresses', [])
            await existing.save()
        else:
            new_user = User(
                id=user_data['id'],
                name=user_data['name'],
                email=user_data['email'],
                password=user_data['password'],
                role=user_data.get('role', 'customer'),
                phone=user_data.get('phone'),
                addresses=user_data.get('addresses', []),
                joined_at=user_data.get('joinedAt', '2024-01-01')
            )
            await new_user.insert()
            print(f"  Created user: {user_data['email']}")
    
    # Seed Products
    print("\nSeeding Products...")
    products_path = os.path.join(base_path, 'products.json')
    with open(products_path, 'r') as f:
        products_data = json.load(f)
    
    for prod_data in products_data:
        # Check if product exists
        existing = await Product.find_one(Product.id == prod_data['id'])
        if existing:
            print(f"  Product {prod_data['name']} already exists, skipping...")
            continue
        
        new_product = Product(
            id=prod_data['id'],
            name=prod_data['name'],
            category=prod_data['category'],
            description=prod_data.get('description', ''),
            price=prod_data['price'],
            discount=prod_data.get('discount', 0),
            images=prod_data.get('images', []),
            sizes=prod_data.get('sizes', ['Single']),
            stock=prod_data.get('stock', 50),
            low_stock_threshold=prod_data.get('lowStockThreshold', 10),
            flavors=prod_data.get('flavors', []),
            dietary=prod_data.get('dietary', []),
            rating=prod_data.get('rating', 4.0),
            review_count=prod_data.get('reviewCount', 0),
            ingredients=prod_data.get('ingredients', ''),
            nutrition=prod_data.get('nutrition', {}),
            status=prod_data.get('status', 'active'),
            featured=prod_data.get('featured', False),
            created_at=prod_data.get('createdAt', '2024-01-01')
        )
        await new_product.insert()
        print(f"  Created product: {prod_data['name']}")
    
    print("\n✅ Seeding complete!")
    print(f"  Total Users: {await User.count()}")
    print(f"  Total Products: {await Product.count()}")

if __name__ == "__main__":
    asyncio.run(seed_database())

