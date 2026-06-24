import httpx

async def get_exchange_rate(base: str = "INR", target: str = "USD") -> float:
    # We will use frankfurter.app for open source currency conversion without API key
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.frankfurter.app/latest?from={base}&to={target}")
            response.raise_for_status()
            data = response.json()
            return data["rates"][target]
    except Exception as e:
        print(f"Failed to fetch exchange rate: {e}")
        # Return fallback rate if API fails
        return 1.1 
