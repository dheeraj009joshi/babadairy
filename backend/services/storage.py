from azure.storage.blob.aio import BlobServiceClient
import os
from fastapi import UploadFile
import uuid

async def upload_file_to_azure(file: UploadFile) -> str:
    """
    Uploads a file to Azure Blob Storage and returns the public URL.
    """
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    container_name = os.getenv("AZURE_CONTAINER_NAME")

    if not connection_string or not container_name:
        raise ValueError("Azure Storage credentials not configured. Please set AZURE_STORAGE_CONNECTION_STRING and AZURE_CONTAINER_NAME environment variables.")

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    
    try:
        async with blob_service_client:
            # Create a unique name for the blob
            filename = file.filename
            extension = filename.split(".")[-1] if "." in filename else "jpg"
            blob_name = f"{uuid.uuid4()}.{extension}"
            
            # Create a blob client using the local file name as the name for the blob
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

            # Upload the created file
            # Read the file content as bytes
            file_content = await file.read()
            await blob_client.upload_blob(file_content, overwrite=True)
            
            return blob_client.url
    except Exception as e:
        print(f"Azure Upload Error: {e}")
        raise e
    finally:
        # Reset file pointer for subsequent reads if necessary (though usually not needed after upload)
        await file.seek(0)
