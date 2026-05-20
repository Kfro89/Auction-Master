import logging
from typing import Optional
from sqlalchemy.orm import Session
from .base import AIProvider
from .local_provider import LocalProvider
from .gemini_provider import GeminiProvider
from ...models import Setting
from ...services.security import decrypt_value

logger = logging.getLogger(__name__)

def get_active_provider(db: Session) -> AIProvider:
    """
    Factory to instantiate the active AI provider based on application settings.
    """
    provider_setting = db.query(Setting).filter(Setting.key == "ai_provider").first()
    provider_type = provider_setting.value if provider_setting else "local"
    
    if provider_type == "gemini":
        key_setting = db.query(Setting).filter(Setting.key == "gemini_api_key").first()
        if key_setting and key_setting.value:
            api_key = decrypt_value(key_setting.value)
            return GeminiProvider(api_key=api_key)
        else:
            logger.warning("Gemini provider selected but no API key found. Falling back to Local LLM.")
            return LocalProvider()
    
    return LocalProvider()

def get_ai_concurrency_limit(db: Session) -> int:
    """
    Fetches the configured concurrency limit for AI tasks.
    """
    limit_setting = db.query(Setting).filter(Setting.key == "ai_concurrency_limit").first()
    if limit_setting and limit_setting.value:
        try:
            return int(limit_setting.value)
        except ValueError:
            pass
            
    # Default based on provider if not explicitly set
    provider_setting = db.query(Setting).filter(Setting.key == "ai_provider").first()
    if provider_setting and provider_setting.value == "gemini":
        return 50 # Default high concurrency for Gemini
    
    return 6 # Default for Local LLM
