"""Configuration for the LLM Council."""

import os
from pathlib import Path
import yaml

# Load configuration from YAML file
_config_path = Path(__file__).parent / "config.yml"
with open(_config_path) as f:
    _config = yaml.safe_load(f)

# LiteLLM gateway credentials (OpenAI-compatible API)
# These should be set in your shell environment (e.g., .zshrc)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")

# Council members - list of model identifiers
COUNCIL_MODELS = _config["council_models"]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = _config["chairman_model"]

# Model for title generation
TITLE_MODEL = _config.get("title_model", "gemini-2.5-flash")

# Data directory for conversation storage
DATA_DIR = _config.get("data_dir", "data/conversations")
