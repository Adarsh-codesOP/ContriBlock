import aiohttp
from typing import Optional, Dict, Any, BinaryIO

from app.core.config import settings


class IPFSClient:
    def __init__(self):
        self.api_url = settings.IPFS_API_URL
    
    async def add_file(self, file_content: BinaryIO, filename: str) -> Optional[str]:
        """Add a file to IPFS and return its CID."""
        try:
            url = f"{self.api_url}/api/v0/add"
            
            # Create form data with file
            form_data = aiohttp.FormData()
            form_data.add_field(
                name="file",
                value=file_content,
                filename=filename,
                content_type="application/octet-stream"
            )
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, data=form_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("Hash")
                    else:
                        print(f"Error adding file to IPFS: {await response.text()}")
                        return None
        except Exception as e:
            print(f"Error adding file to IPFS: {e}")
            return None
    
    async def get_file(self, cid: str) -> Optional[bytes]:
        """Get a file from IPFS by its CID."""
        try:
            url = f"{self.api_url}/api/v0/cat?arg={cid}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url) as response:
                    if response.status == 200:
                        return await response.read()
                    else:
                        print(f"Error getting file from IPFS: {await response.text()}")
                        return None
        except Exception as e:
            print(f"Error getting file from IPFS: {e}")
            return None
    
    async def pin_file(self, cid: str) -> bool:
        """Pin a file in IPFS to prevent garbage collection."""
        try:
            url = f"{self.api_url}/api/v0/pin/add?arg={cid}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url) as response:
                    if response.status == 200:
                        return True
                    else:
                        print(f"Error pinning file in IPFS: {await response.text()}")
                        return False
        except Exception as e:
            print(f"Error pinning file in IPFS: {e}")
            return False


# Create a singleton instance
ipfs_client = IPFSClient()