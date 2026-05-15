import os
import logging
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)

# A default dev key generated via Fernet.generate_key()
DEFAULT_DEV_KEY = b'wXyZ1_cTb52o2nZ_WzB10Q0mJ_N2yB_P4mO9hVzR8wA='

class CryptoService:
    def __init__(self):
        key = os.getenv("ENCRYPTION_KEY")
        if not key:
            logger.warning("ENCRYPTION_KEY environment variable not set. Using default development key.")
            key = DEFAULT_DEV_KEY
        else:
            key = key.encode() if isinstance(key, str) else key
            
        try:
            self.cipher_suite = Fernet(key)
        except Exception as e:
            logger.error(f"Failed to initialize Fernet with provided key. Check ENCRYPTION_KEY format. Error: {e}")
            raise

    def encrypt(self, data: str) -> str:
        if not data:
            return ""
        return self.cipher_suite.encrypt(data.encode()).decode()

    def decrypt(self, encrypted_data: str) -> str:
        if not encrypted_data:
            return ""
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()

crypto_service = CryptoService()
