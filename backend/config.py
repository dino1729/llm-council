"""Configuration for the LLM Council."""

import os
from pathlib import Path
import yaml
from typing import Dict, Any

# Load configuration from YAML file
_config_path = Path(__file__).parent / "config.yml"

def _load_config():
    with open(_config_path) as f:
        return yaml.safe_load(f)

_config = _load_config()

# LiteLLM gateway credentials (OpenAI-compatible API)
# These should be set in your shell environment (e.g., .zshrc)
# Or in the config.yml file as 'openai_api_key' and 'openai_base_url'
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or _config.get("openai_api_key")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL") or _config.get("openai_base_url")

# Ensure API key is not None to prevent OpenAI client validation error
# If using a local gateway that doesn't require a key, any non-empty string works
if not OPENAI_API_KEY:
    OPENAI_API_KEY = "sk-placeholder"

# Council members - list of model identifiers
COUNCIL_MODELS = _config["council_models"]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = _config["chairman_model"]

# Model for title generation
TITLE_MODEL = _config.get("title_model", "gemini-2.5-flash")

# Data directory for conversation storage
DATA_DIR = _config.get("data_dir", "data/conversations")

def update_config(new_config: Dict[str, Any]):
    """Update configuration and save to file."""
    global _config, COUNCIL_MODELS, CHAIRMAN_MODEL, TITLE_MODEL, DATA_DIR
    
    # Update in-memory config
    _config.update(new_config)
    
    # Update exposed variables
    if "council_models" in new_config:
        COUNCIL_MODELS = new_config["council_models"]
    if "chairman_model" in new_config:
        CHAIRMAN_MODEL = new_config["chairman_model"]
    if "title_model" in new_config:
        TITLE_MODEL = new_config["title_model"]
    if "data_dir" in new_config:
        DATA_DIR = new_config["data_dir"]
        
    # Save to file
    with open(_config_path, 'w') as f:
        yaml.dump(_config, f, default_flow_style=False)

def get_config() -> Dict[str, Any]:
    """Get current configuration."""
    return _config
