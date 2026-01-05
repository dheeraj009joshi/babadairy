# Products Setup Guide

This guide explains how to set up products from `public/data/products.json` with Azure Blob Storage for images.

## Prerequisites

1. **Azure Storage Account** - You need an Azure Storage Account with a container created
2. **Backend Running** - Make sure your FastAPI backend is running on `http://localhost:8000`
3. **Python Dependencies** - Install backend dependencies: `pip install -r backend/requirements.txt`

## Step 1: Configure Azure Storage

1. **Create Azure Storage Account** (if you don't have one):
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Storage Account
   - Create a container named `products` (or any name you prefer)

2. **Get Connection String**:
   - Go to your Storage Account → **Access Keys**
   - Copy the **Connection string**

3. **Set Environment Variables**:
   
   Create a `.env` file in the `backend/` directory:
   
   ```env
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net
   AZURE_CONTAINER_NAME=products
   API_URL=http://localhost:8000
   ```

   Or set them as environment variables:
   ```bash
   export AZURE_STORAGE_CONNECTION_STRING="your_connection_string"
   export AZURE_CONTAINER_NAME="products"
   export API_URL="http://localhost:8000"
   ```

## Step 2: Start the Backend

Make sure your backend server is running:

```bash
cd backend
uvicorn main:app --reload
```

The backend should be accessible at `http://localhost:8000`.

## Step 3: Run the Product Processing Script

The script will:
1. Read products from `public/data/products.json`
2. Extract base64-encoded images
3. Upload images to Azure Blob Storage
4. Replace base64 data with Azure URLs
5. Upload products to your backend database

Run the script:

```bash
cd backend
python process_products.py
```

The script will:
- Process each product's images
- Upload them to Azure
- Show progress for each product
- Upload all products to the backend API

## Step 4: Verify Products

1. **Check Backend**:
   - Visit `http://localhost:8000/products/` to see all products
   - Or check in your MongoDB database

2. **Check Frontend**:
   - Start your frontend: `npm run dev`
   - Navigate to the Shop page
   - Products should load from the backend with Azure image URLs

## Frontend Configuration

The frontend API client is configured to use `http://localhost:8000` by default. You can override this by setting:

```env
VITE_API_URL=http://your-backend-url:8000
```

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

## Troubleshooting

### Azure Upload Errors

**Problem**: "Azure Storage credentials not configured"

**Solution**: 
- Make sure you've set `AZURE_STORAGE_CONNECTION_STRING` and `AZURE_CONTAINER_NAME` in your `.env` file
- Verify your connection string is correct
- Check that the container exists in Azure

### Backend Connection Errors

**Problem**: "Failed to upload product: Connection refused"

**Solution**:
- Make sure the backend is running: `uvicorn main:app --reload`
- Check that the backend is accessible at `http://localhost:8000`
- Verify `API_URL` in your `.env` file matches your backend URL

### Image Upload Failures

**Problem**: Some images fail to upload

**Solution**:
- Check your Azure Storage account quota
- Verify the connection string has write permissions
- Check internet connectivity
- Look at the error messages in the script output

### Frontend Not Loading Products

**Problem**: Products don't show in frontend

**Solution**:
- Check browser console for errors
- Verify the backend is running and accessible
- Check that `VITE_API_URL` is set correctly (if using custom URL)
- Make sure CORS is configured in the backend (should allow `http://localhost:5173`)

## Script Features

- **Base64 Decoding**: Automatically decodes base64 images from products.json
- **Batch Upload**: Processes all products sequentially
- **Error Handling**: Continues processing even if one product fails
- **Progress Tracking**: Shows progress for each product and image
- **URL Replacement**: Automatically replaces base64 data with Azure URLs

## What the Script Does

1. Reads `public/data/products.json`
2. For each product:
   - Extracts all images (base64 or URLs)
   - Decodes base64 images
   - Uploads to Azure Blob Storage
   - Gets Azure URLs
   - Updates product data with Azure URLs
3. Uploads all products to backend API at `/products/`

## Notes

- The script preserves existing URLs (doesn't re-upload if image is already a URL)
- Products are uploaded with their original IDs if present
- The script maps field names from frontend format (camelCase) to backend format (snake_case)
- All images are stored in Azure under the `products/` prefix in the container
