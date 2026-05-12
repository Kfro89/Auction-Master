import os
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger(__name__)

# To generate a key for your .env file, you can run:
# from cryptography.fernet import Fernet
# Fernet.generate_key().decode()
ENCRYPTION_KEY = os.getenv("FERNET_ENCRYPTION_KEY")
fernet = None

if ENCRYPTION_KEY:
    try:
        fernet = Fernet(ENCRYPTION_KEY.encode())
    except Exception as e:
        logger.error(f"Failed to initialize Fernet encryption: {e}")

def encrypt_value(value: str) -> str:
    """Encrypt a string using Fernet. If no key is set, returns the plain text."""
    if not fernet or not value:
        return value
    return fernet.encrypt(value.encode()).decode()

def decrypt_value(encrypted_value: str) -> str:
    """Decrypt a string using Fernet. If decryption fails or no key is set, returns the original string."""
    if not fernet or not encrypted_value:
        return encrypted_value
    try:
        return fernet.decrypt(encrypted_value.encode()).decode()
    except Exception as e:
        logger.warning(f"Could not decrypt value (might be plaintext or key changed): {e}")
        return encrypted_value
