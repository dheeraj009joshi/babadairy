from azure.storage.blob.aio import BlobServiceClient
import os
from fastapi import UploadFile
from typing import Union
import uuid

async def upload_file_to_azure(file: Union[UploadFile, bytes], filename: str = None) -> str:
    """
    Uploads a file to Azure Blob Storage and returns the public URL.
    Can accept either UploadFile object or bytes directly.
    """
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    container_name = os.getenv("AZURE_CONTAINER_NAME")

    if not connection_string or not container_name:
        raise ValueError("Azure Storage credentials not configured. Please set AZURE_STORAGE_CONNECTION_STRING and AZURE_CONTAINER_NAME environment variables.")

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    
    try:
        async with blob_service_client:
            # Get filename and extension
            if isinstance(file, UploadFile):
                original_filename = file.filename or "upload"
                file_content = await file.read()
            else:
                # file is bytes
                file_content = file
                original_filename = filename or "upload"
            
            extension = original_filename.split(".")[-1] if "." in original_filename else "jpg"
            blob_name = f"{uuid.uuid4()}.{extension}"
            
            # Create a blob client
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

            # Upload the file content directly
            await blob_client.upload_blob(file_content, overwrite=True)
            
            return blob_client.url
    except Exception as e:
        print(f"Azure Upload Error: {e}")
        raise e
