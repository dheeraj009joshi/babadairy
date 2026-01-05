# Setup Summary

This document summarizes the changes made to link the frontend and backend, and set up product data with Azure Blob Storage.

## Changes Made

### 1. Frontend-Backend Connection

**Updated Files:**
- `src/api/client.ts` - Now uses environment variable `VITE_API_URL` (defaults to `http://localhost:8000`)

**How to configure:**
- Create a `.env` file in the root directory with:
  ```env
  VITE_API_URL=http://localhost:8000
  ```
- Or set it in your deployment environment

### 2. Backend Schema Updates

**Updated Files:**
- `backend/schemas.py` - Added `rating` and `review_count` as optional fields to `ProductBase` schema

This allows products to be created with rating and review count from the JSON file.

### 3. Product Processing Script

**New File:**
- `backend/process_products.py` - Script to process products from JSON and upload to Azure

**Features:**
- Reads `public/data/products.json`
- Extracts base64-encoded images
- Uploads images to Azure Blob Storage
- Replaces base64 data with Azure URLs
- Uploads products to backend API

### 4. Documentation

**New Files:**
- `README_PRODUCTS_SETUP.md` - Complete setup guide for products and Azure
- `SETUP_SUMMARY.md` - This file

## Next Steps

### 1. Configure Azure Storage

1. Get your Azure Storage connection string
2. Create a `.env` file in `backend/` directory:
   ```env
   AZURE_STORAGE_CONNECTION_STRING=your_connection_string_here
   AZURE_CONTAINER_NAME=products
   API_URL=http://localhost:8000
   ```

### 2. Start Backend

```bash
cd backend
uvicorn main:app --reload
```

### 3. Run Product Processing Script

```bash
cd backend
python process_products.py
```

This will:
- Process all products from `public/data/products.json`
- Upload images to Azure
- Upload products to your database

### 4. Verify Setup

1. **Check Backend:**
   - Visit `http://localhost:8000/products/` to see products

2. **Check Frontend:**
   - Start frontend: `npm run dev`
   - Products should load from backend

## File Structure

```
babaDairy/
├── backend/
│   ├── process_products.py    # NEW: Product processing script
│   ├── schemas.py              # UPDATED: Added rating/review_count
│   ├── .env                    # CREATE: Azure credentials
│   └── ...
├── src/
│   └── api/
│       └── client.ts           # UPDATED: Uses env variable
├── public/
│   └── data/
│       └── products.json       # Source file with base64 images
├── README_PRODUCTS_SETUP.md    # NEW: Setup guide
└── SETUP_SUMMARY.md            # NEW: This file
```

## Important Notes

1. **Azure Storage:** You must configure Azure Storage before running the script
2. **Backend Running:** Backend must be running before processing products
3. **CORS:** Backend CORS is configured for `http://localhost:5173` (Vite default)
4. **Image URLs:** After processing, all product images will be Azure Blob Storage URLs

## Troubleshooting

See `README_PRODUCTS_SETUP.md` for detailed troubleshooting guide.

## What the Script Does

1. **Reads** products from `public/data/products.json`
2. **Processes** each product:
   - Extracts images (base64 or URLs)
   - Decodes base64 images to binary data
   - Uploads to Azure Blob Storage
   - Gets Azure URLs
   - Updates product data with Azure URLs
3. **Uploads** all products to backend API

## Success Criteria

✅ Frontend connects to backend API  
✅ Products load from backend in frontend  
✅ Images are stored in Azure Blob Storage  
✅ Product images display correctly in frontend  
✅ All product data is preserved (rating, reviews, etc.)
