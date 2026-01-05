import json
import base64
import os
import asyncio
from io import BytesIO
from azure.storage.blob.aio import BlobServiceClient
from dotenv import load_dotenv
import requests
from typing import List, Dict, Tuple
import uuid

load_dotenv()

# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME", "products")

# Backend API URL
API_URL = os.getenv("API_URL", "http://localhost:8000")

async def upload_image_to_azure(image_data: bytes, filename: str) -> str:
    """Upload image bytes to Azure Blob Storage and return the URL."""
    if not AZURE_STORAGE_CONNECTION_STRING or not AZURE_CONTAINER_NAME:
        raise ValueError("Azure Storage credentials not configured. Please set AZURE_STORAGE_CONNECTION_STRING and AZURE_CONTAINER_NAME environment variables.")
    
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    
    try:
        async with blob_service_client:
            # Create a unique name for the blob
            extension = filename.split(".")[-1] if "." in filename else "jpg"
            blob_name = f"products/{uuid.uuid4()}.{extension}"
            
            # Get blob client
            blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=blob_name)
            
            # Upload the image
            await blob_client.upload_blob(image_data, overwrite=True)
            
            return blob_client.url
    except Exception as e:
        print(f"Error uploading {filename} to Azure: {e}")
        raise e

def decode_base64_image(base64_string: str) -> Tuple[bytes, str]:
    """Decode base64 image string and return image data and extension."""
    try:
        # Handle data URL format: data:image/jpeg;base64,...
        if ',' in base64_string:
            header, data = base64_string.split(',', 1)
            # Extract extension from header
            if 'image/jpeg' in header or 'image/jpg' in header:
                ext = 'jpg'
            elif 'image/png' in header:
                ext = 'png'
            elif 'image/gif' in header:
                ext = 'gif'
            elif 'image/webp' in header:
                ext = 'webp'
            else:
                ext = 'jpg'  # default
        else:
            data = base64_string
            ext = 'jpg'  # default
        
        image_data = base64.b64decode(data)
        return image_data, ext
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        raise e

async def process_product_images(product: Dict, product_index: int) -> List[str]:
    """Process all images for a product: decode base64 and upload to Azure."""
    azure_urls = []
    
    if not product.get('images'):
        return azure_urls
    
    images = product['images']
    print(f"Processing {len(images)} image(s) for product {product_index + 1}: {product.get('name', 'Unknown')}")
    
    for img_index, image in enumerate(images):
        try:
            # Skip if already a URL
            if isinstance(image, str) and (image.startswith('http://') or image.startswith('https://')):
                print(f"  Image {img_index + 1} is already a URL, skipping...")
                azure_urls.append(image)
                continue
            
            # Decode base64 image
            image_data, ext = decode_base64_image(image)
            filename = f"product_{product_index}_{img_index}.{ext}"
            
            # Upload to Azure
            print(f"  Uploading image {img_index + 1}...")
            azure_url = await upload_image_to_azure(image_data, filename)
            azure_urls.append(azure_url)
            print(f"  ✓ Uploaded: {azure_url}")
            
        except Exception as e:
            print(f"  ✗ Failed to process image {img_index + 1}: {e}")
            # Continue with other images even if one fails
    
    return azure_urls

async def process_all_products(products_file_path: str):
    """Process all products: upload images to Azure and update URLs."""
    print(f"Reading products from {products_file_path}...")
    
    with open(products_file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"Found {len(products)} products to process.\n")
    
    # Process each product
    processed_products = []
    
    for idx, product in enumerate(products):
        print(f"\n[{idx + 1}/{len(products)}] Processing: {product.get('name', 'Unknown')}")
        
        try:
            # Process images
            azure_urls = await process_product_images(product, idx)
            
            # Update product with Azure URLs
            product['images'] = azure_urls
            
            # Ensure required fields exist
            if 'id' not in product or not product['id']:
                product['id'] = str(uuid.uuid4())
            
            # Map fields to backend schema (ProductCreate)
            processed_product = {
                'id': product.get('id', str(uuid.uuid4())),
                'name': product.get('name', ''),
                'category': product.get('category', ''),
                'description': product.get('description', ''),
                'price': float(product.get('price', 0)),
                'discount': float(product.get('discount', 0)),
                'images': azure_urls,
                'sizes': product.get('sizes', []),
                'stock': int(product.get('stock', 0)),
                'low_stock_threshold': int(product.get('lowStockThreshold', product.get('low_stock_threshold', 10))),
                'flavors': product.get('flavors', []),
                'dietary': product.get('dietary', []),
                'rating': float(product.get('rating', 0)),
                'review_count': int(product.get('reviewCount', product.get('review_count', 0))),
                'ingredients': product.get('ingredients', ''),
                'nutrition': product.get('nutrition', {}),
                'status': product.get('status', 'active'),
                'featured': bool(product.get('featured', False)),
            }
            
            processed_products.append(processed_product)
            print(f"✓ Product processed successfully")
            
        except Exception as e:
            print(f"✗ Failed to process product: {e}")
            continue
    
    return processed_products

def upload_products_to_backend(products: List[Dict]):
    """Upload processed products to the backend API."""
    print(f"\n\nUploading {len(products)} products to backend...")
    
    success_count = 0
    fail_count = 0
    
    for idx, product in enumerate(products):
        try:
            print(f"[{idx + 1}/{len(products)}] Uploading: {product['name']}")
            response = requests.post(f"{API_URL}/products/", json=product)
            
            if response.status_code == 200:
                print(f"  ✓ Successfully uploaded")
                success_count += 1
            else:
                print(f"  ✗ Failed: {response.status_code} - {response.text}")
                fail_count += 1
                
        except Exception as e:
            print(f"  ✗ Error uploading: {e}")
            fail_count += 1
    
    print(f"\n\nUpload Summary:")
    print(f"  Success: {success_count}")
    print(f"  Failed: {fail_count}")

async def main():
    """Main function to process products and upload to backend."""
    # Path to products.json (relative to backend directory)
    products_file_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'products.json')
    
    if not os.path.exists(products_file_path):
        print(f"Error: Products file not found at {products_file_path}")
        print("Please make sure the path is correct.")
        return
    
    try:
        # Process all products (decode images and upload to Azure)
        processed_products = await process_all_products(products_file_path)
        
        # Upload products to backend
        if processed_products:
            upload_products_to_backend(processed_products)
        else:
            print("\nNo products were processed successfully.")
            
    except Exception as e:
        print(f"Error in main process: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("Product Processing Script")
    print("=" * 60)
    print(f"Azure Container: {AZURE_CONTAINER_NAME}")
    print(f"Backend API: {API_URL}")
    print("=" * 60)
    print()
    
    asyncio.run(main())
