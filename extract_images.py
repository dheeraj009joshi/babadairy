#!/usr/bin/env python3
"""
Extract images from products.json and save them to ice-images folder
"""
import json
import os
import base64
import re
from urllib.parse import urlparse
from pathlib import Path
import hashlib

def extract_base64_image(data_url, output_dir, index):
    """Extract and save base64 encoded image"""
    # Parse data URL: data:image/jpeg;base64,<data>
    match = re.match(r'data:image/(\w+);base64,(.+)', data_url)
    if not match:
        return None
    
    image_type = match.group(1)
    base64_data = match.group(2)
    
    # Decode base64
    try:
        image_data = base64.b64decode(base64_data)
    except Exception as e:
        print(f"Error decoding base64 image {index}: {e}")
        return None
    
    # Generate filename
    hash_name = hashlib.md5(base64_data.encode()).hexdigest()[:12]
    filename = f"image_{index}_{hash_name}.{image_type}"
    filepath = output_dir / filename
    
    # Save image
    with open(filepath, 'wb') as f:
        f.write(image_data)
    
    return str(filepath)

def download_url_image(url, output_dir, index):
    """Download image from URL"""
    try:
        import urllib.request
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1] or '.jpg'
        if not ext.startswith('.'):
            ext = '.jpg'
        
        hash_name = hashlib.md5(url.encode()).hexdigest()[:12]
        filename = f"image_{index}_{hash_name}{ext}"
        filepath = output_dir / filename
        
        urllib.request.urlretrieve(url, filepath)
        return str(filepath)
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None

def main():
    # Paths
    products_file = Path('public/data/products.json')
    output_dir = Path('public/ice-images')
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load products
    print(f"Loading products from {products_file}...")
    with open(products_file, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"Found {len(products)} products")
    
    # Extract images
    saved_images = []
    image_index = 0
    
    for product_idx, product in enumerate(products):
        product_name = product.get('name', f'product_{product_idx}')
        images = product.get('images', [])
        
        if not images:
            continue
        
        print(f"\nProcessing product: {product_name} ({len(images)} images)")
        
        for img_idx, image_url in enumerate(images):
            image_index += 1
            
            if image_url.startswith('data:image'):
                # Base64 image
                filepath = extract_base64_image(image_url, output_dir, image_index)
                if filepath:
                    saved_images.append({
                        'product': product_name,
                        'original': 'base64',
                        'saved': filepath
                    })
                    print(f"  ✓ Saved base64 image {image_index} to {filepath}")
            elif image_url.startswith('http://') or image_url.startswith('https://'):
                # URL image
                filepath = download_url_image(image_url, output_dir, image_index)
                if filepath:
                    saved_images.append({
                        'product': product_name,
                        'original': image_url,
                        'saved': filepath
                    })
                    print(f"  ✓ Downloaded image {image_index} from {image_url}")
            else:
                # Local path or other format
                print(f"  ⚠ Skipping image {image_index}: {image_url[:50]}...")
    
    # Save mapping
    mapping_file = output_dir / 'image_mapping.json'
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(saved_images, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"Extraction complete!")
    print(f"Total images saved: {len(saved_images)}")
    print(f"Output directory: {output_dir}")
    print(f"Mapping file: {mapping_file}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
