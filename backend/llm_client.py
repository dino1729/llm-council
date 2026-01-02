"""LLM client for making requests via OpenAI-compatible API (LiteLLM gateway)."""

import asyncio
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from .config import OPENAI_API_KEY, OPENAI_BASE_URL

# Initialize the async client with LiteLLM gateway credentials
_client = AsyncOpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
)


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0
) -> Optional[Dict[str, Any]]:
    """
    Query a single model via the LiteLLM gateway.

    Args:
        model: Model identifier (e.g., "gpt-5.1", "claude-sonnet-4-5")
        messages: List of message dicts with 'role' and 'content'
        timeout: Request timeout in seconds

    Returns:
        Response dict with 'content' and optional 'reasoning_details', or None if failed
    """
    try:
        response = await _client.chat.completions.create(
            model=model,
            messages=messages,
            timeout=timeout,
        )

        message = response.choices[0].message

        return {
            'content': message.content,
            'reasoning_details': getattr(message, 'reasoning_details', None)
        }

    except Exception as e:
        print(f"Error querying model {model}: {e}")
        return None


async def query_models_parallel(
    models: List[str],
    messages: List[Dict[str, str]]
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel.

    Args:
        models: List of model identifiers
        messages: List of message dicts to send to each model

    Returns:
        Dict mapping model identifier to response dict (or None if failed)
    """
    tasks = [query_model(model, messages) for model in models]
    responses = await asyncio.gather(*tasks)
    return {model: response for model, response in zip(models, responses)}
