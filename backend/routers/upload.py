from fastapi import APIRouter, UploadFile, File, HTTPException
from services.storage import upload_file_to_azure
import logging

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

logger = logging.getLogger(__name__)

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    try:
        url = await upload_file_to_azure(file)
        return {"url": url}
    except ValueError as e:
        logger.error(f"Upload configuration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")
