import httpx
from app.core.logging import logger

async def get_exchange_rate(base: str = "INR", target: str = "USD") -> float:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.frankfurter.app/latest?from={base}&to={target}")
            response.raise_for_status()
            data = response.json()
            return data["rates"][target]
    except Exception as e:
        logger.error(f"Failed to fetch exchange rate: {e}")
        return 0.012 # Fallback rate for INR -> USD
