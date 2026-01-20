from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.storage import upload_file_to_azure
import logging

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

# Maximum file size: 10MB (10 * 1024 * 1024 bytes)
MAX_FILE_SIZE = 10 * 1024 * 1024

logger = logging.getLogger(__name__)

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file to Azure Blob Storage.
    Returns the public URL of the uploaded file.
    Maximum file size: 10MB
    """
    try:
        if not file.filename:
            raise ValueError("No filename provided")
        
        logger.info(f"Upload request received for file: {file.filename}, content_type: {file.content_type}")
        
        # Read file content once and reuse it
        file_content = await file.read()
        file_size = len(file_content)
        
        logger.info(f"File size: {file_size} bytes ({file_size / (1024 * 1024):.2f}MB)")
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.1f}MB, but file is {file_size / (1024 * 1024):.2f}MB"
            )
        
        if file_size == 0:
            raise ValueError("File is empty")
        
        logger.info("Starting Azure upload...")
        # Upload to Azure directly with bytes (avoids reading file twice)
        url = await upload_file_to_azure(file_content, filename=file.filename)
        logger.info(f"File uploaded successfully to Azure: {url}")
        
        return JSONResponse(
            content={"url": url},
            status_code=200
        )
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Upload validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
