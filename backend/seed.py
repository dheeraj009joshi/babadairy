import requests
import json
import random
import time

API_URL = "http://localhost:8000"

products = [
    {
        "name": "Classic Vanilla",
        "category": "Ice Cream",
        "description": "Rich and creamy vanilla ice cream made with real vanilla beans.",
        "price": 250,
        "discount": 0,
        "images": ["https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        "stock": 50,
        "flavors": ["Vanilla"],
        "dietary": ["Vegetarian"],
        "rating": 4.5,
        "review_count": 12,
        "featured": True
    },
    {
        "name": "Chocolate Fudge",
        "category": "Ice Cream",
        "description": "Decadent chocolate ice cream with fudge swirls.",
        "price": 280,
        "discount": 10,
        "images": ["https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        "stock": 30,
        "flavors": ["Chocolate"],
        "dietary": ["Vegetarian"],
        "rating": 4.8,
        "review_count": 25,
        "featured": True
    },
    {
        "name": "Strawberry Delight",
        "category": "Ice Cream",
        "description": "Fresh strawberry ice cream with real fruit chunks.",
        "price": 260,
        "discount": 0,
        "images": ["https://images.unsplash.com/photo-1560008581-09826d1de69e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        "stock": 40,
        "flavors": ["Strawberry"],
        "dietary": ["Vegetarian"],
        "rating": 4.6,
        "review_count": 18,
        "featured": False
    },
    {
         "name": "Mango Sorbet",
         "category": "Sorbet",
         "description": "Refreshing mango sorbet made with Alphonso mangoes.",
         "price": 220,
         "discount": 5,
         "images": ["https://images.unsplash.com/photo-1505394033641-40c6ad1178d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
         "stock": 25,
         "flavors": ["Mango"],
         "dietary": ["Vegan", "Gluten-Free"],
         "rating": 4.9,
         "review_count": 40,
         "featured": True
    },
    {
        "name": "Mint Chocolate Chip",
        "category": "Ice Cream",
        "description": "Cool mint ice cream with crunchy chocolate chips.",
        "price": 270,
        "discount": 0,
        "images": ["https://images.unsplash.com/photo-1501443762994-82bd5dace89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        "stock": 35,
        "flavors": ["Mint", "Chocolate"],
        "dietary": ["Vegetarian"],
        "rating": 4.4,
        "review_count": 8,
        "featured": False
    }
]

users = [
    {
        "name": "Rahul Sharma",
        "email": "rahul.sharma@example.com",
        "password": "password123",
        "phone": "+919876543210",
        "role": "customer",
        "addresses": [
            {"street": "123 MG Road", "city": "Mumbai", "state": "Maharashtra", "zip": "400001"}
        ]
    },
    {
        "name": "Priya Singh",
        "email": "priya.singh@example.com",
        "password": "securepass",
        "phone": "+919812345678",
        "role": "customer",
        "addresses": [
            {"street": "456 Park Avenue", "city": "Delhi", "state": "Delhi", "zip": "110001"}
        ]
    }
]

def seed_data():
    print("Seeding Users...")
    created_users = []
    for u in users:
        try:
            # Check if user exists
            # Ideally we'd have an endpoint to check, but let's just try create and catch error
            response = requests.post(f"{API_URL}/users/", json=u)
            if response.status_code == 200:
                print(f"Created User: {u['name']}")
                created_users.append(response.json())
            elif response.status_code == 400: # Usually exists
                print(f"User {u['name']} likely exists.")
                # We can't easily get the ID if we don't have login, but for seeding let's assuming fresh or skip
            else:
                print(f"Failed to create User {u['name']}: {response.text}")
        except Exception as e:
            print(f"Error creating User {u['name']}: {e}")

    print("\nSeeding Products...")
    created_products = []
    for p in products:
        try:
            response = requests.post(f"{API_URL}/products/", json=p)
            if response.status_code == 200:
                print(f"Created Product: {p['name']}")
                created_products.append(response.json())
            else:
                print(f"Failed to create Product {p['name']}: {response.text}")
        except Exception as e:
            print(f"Error creating Product {p['name']}: {e}")

    # Seed Orders if we have products and users (simulated)
    # Since we can't easily get the User IDs if they already existed without login,
    # we will use the created_users list. If empty, we skip orders.
    # Actually, let's fetch products to make sure we have IDs.
    
    try:
        response = requests.get(f"{API_URL}/products/")
        if response.status_code == 200:
            current_products = response.json()
        else:
            current_products = []
            
        if created_users and current_products:
            print("\nSeeding Orders...")
            user = created_users[0]
            product = convert_product_for_order(current_products[0])
            
            order_data = {
                "order_number": f"ORD-{int(time.time())}",
                "user_id": user['id'],
                "customer": {
                    "name": user['name'],
                    "email": user['email'],
                    "phone": user['phone'],
                    "address": user['addresses'][0]
                },
                "items": [
                    {
                        "product_id": product['id'],
                        "name": product['name'],
                        "price": product['price'],
                        "quantity": 2,
                        "total": product['price'] * 2
                    }
                ],
                "subtotal": product['price'] * 2,
                "tax": (product['price'] * 2) * 0.05,
                "delivery_charges": 50,
                "discount": 0,
                "total": (product['price'] * 2) * 1.05 + 50,
                "payment_method": "upi",
                "status": "pending"
            }
            
            resp = requests.post(f"{API_URL}/orders/", json=order_data)
            if resp.status_code == 200:
                print(f"Created Order: {order_data['order_number']}")
            else:
                print(f"Failed to create Order: {resp.text}")
                
    except Exception as e:
        print(f"Error seeding orders: {e}")

def convert_product_for_order(p):
    # Helper to clean up product dict if needed
    return p

if __name__ == "__main__":
    seed_data()
