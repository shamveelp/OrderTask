from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.model import User
from app.modules.orders.repository import get_orders
from app.external.weather_api import get_current_weather

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    orders = get_orders(db)
    total_orders = len(orders)
    pending = len([o for o in orders if o.status == "Pending"])
    processing = len([o for o in orders if o.status == "Processing"])
    completed = len([o for o in orders if o.status == "Completed"])
    
    weather = await get_current_weather()
    
    return {
        "total_orders": total_orders,
        "pending": pending,
        "processing": processing,
        "completed": completed,
        "weather": weather
    }
