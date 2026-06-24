import httpx
from app.core.logging import logger

async def get_random_customer_name() -> str:
    try:
        url = "https://randomuser.me/api/"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            first = data["results"][0]["name"]["first"]
            last = data["results"][0]["name"]["last"]
            return f"{first} {last}"
    except Exception as e:
        logger.error(f"Random User API failed: {e}")
        return "Guest User"
