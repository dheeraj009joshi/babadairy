from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.storage import upload_file_to_azure
import logging

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

logger = logging.getLogger(__name__)

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file to Azure Blob Storage.
    Returns the public URL of the uploaded file.
    """
    try:
        logger.info(f"Upload request received for file: {file.filename}, content_type: {file.content_type}, size: {file.size if hasattr(file, 'size') else 'unknown'}")
        
        if not file.filename:
            raise ValueError("No filename provided")
        
        # Upload to Azure
        url = await upload_file_to_azure(file)
        logger.info(f"File uploaded successfully to Azure: {url}")
        
        return JSONResponse(
            content={"url": url},
            status_code=200
        )
    except ValueError as e:
        logger.error(f"Upload configuration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
