import os
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger(__name__)

# To generate a key for your .env file, you can run:
# from cryptography.fernet import Fernet
# Fernet.generate_key().decode()

KEY_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "secret.key")

def get_encryption_key():
    key = os.getenv("FERNET_ENCRYPTION_KEY")
    if key:
        return key.encode()
    
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as f:
            return f.read().strip()
            
    # Generate and save
    try:
        new_key = Fernet.generate_key()
        with open(KEY_FILE, "wb") as f:
            f.write(new_key)
        return new_key
    except Exception as e:
        logger.error(f"Failed to create secret key file: {e}")
        return None

ENCRYPTION_KEY = get_encryption_key()
fernet = None

if ENCRYPTION_KEY:
    try:
        fernet = Fernet(ENCRYPTION_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Fernet encryption: {e}")

def get_ebay_credentials(db):
    from ..models import Setting
    client_id_setting = db.query(Setting).filter(Setting.key == "ebay_client_id").first()
    client_secret_setting = db.query(Setting).filter(Setting.key == "ebay_client_secret").first()
    
    client_id = client_id_setting.value if client_id_setting else os.getenv("EBAY_CLIENT_ID")
    client_secret = decrypt_value(client_secret_setting.value) if client_secret_setting else os.getenv("EBAY_CLIENT_SECRET")
    
    return client_id, client_secret


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
