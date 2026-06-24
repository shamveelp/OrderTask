from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.model import User
from app.modules.orders import service, schemas
from app.external.random_user_api import get_random_customer_name

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=schemas.Order)
async def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: schemas.OrderCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await service.create_order_with_broadcast(db, order_in)

@router.get("", response_model=List[schemas.Order])
async def read_orders(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await service.get_all_orders_with_usd(db, skip=skip, limit=limit, status=status)

@router.get("/random-customer", response_model=dict)
async def get_random_customer(current_user: User = Depends(get_current_active_user)):
    name = await get_random_customer_name()
    return {"name": name}

@router.get("/{id}", response_model=schemas.Order)
async def read_order(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await service.get_single_order_with_usd(db, id)

@router.put("/{id}", response_model=schemas.Order)
async def update_order(
    *,
    db: Session = Depends(get_db),
    id: int,
    order_in: schemas.OrderUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await service.update_order_with_broadcast(db, id, order_in)
