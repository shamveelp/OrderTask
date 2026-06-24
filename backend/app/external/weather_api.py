import httpx
from app.core.logging import logger

async def get_current_weather() -> str:
    try:
        # Using Open-Meteo for New Delhi
        url = "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            temp = data["current_weather"]["temperature"]
            return f"{temp}°C"
    except Exception as e:
        logger.error(f"Weather API failed: {e}")
        return "N/A"
