from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.models.order import Order
from app.models.user import User
from app.schemas.order import Order as OrderSchema, OrderCreate, OrderUpdate
from app.external.api import get_exchange_rate
from app.websockets.manager import manager

router = APIRouter()

@router.post("/", response_model=OrderSchema)
async def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    order = Order(
        customer_name=order_in.customer_name,
        amount=order_in.amount,
        status=order_in.status
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Broadcast new order to websockets
    await manager.broadcast({
        "type": "new_order",
        "data": {
            "id": order.id,
            "customer_name": order.customer_name,
            "amount": order.amount,
            "status": order.status,
            "created_at": order.created_at.isoformat()
        }
    })
    
    rate = await get_exchange_rate("INR", "USD")
    order_dict = order.__dict__
    order_dict["amount_usd"] = order.amount * rate
    return order_dict

@router.get("/", response_model=List[OrderSchema])
async def read_orders(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    orders = query.offset(skip).limit(limit).all()
    
    # We could optimize by fetching rate once
    rate = await get_exchange_rate("INR", "USD")
    results = []
    for order in orders:
        order_dict = order.__dict__
        order_dict["amount_usd"] = order.amount * rate
        results.append(order_dict)
    
    return results

@router.get("/{id}", response_model=OrderSchema)
async def read_order(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    rate = await get_exchange_rate("INR", "USD")
    order_dict = order.__dict__
    order_dict["amount_usd"] = order.amount * rate
    return order_dict

@router.put("/{id}", response_model=OrderSchema)
async def update_order(
    *,
    db: Session = Depends(get_db),
    id: int,
    order_in: OrderUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = order_in.status
    db.commit()
    db.refresh(order)
    
    # Broadcast status update
    await manager.broadcast({
        "type": "update_order",
        "data": {
            "id": order.id,
            "status": order.status
        }
    })
    
    rate = await get_exchange_rate("EUR", "USD")
    order_dict = order.__dict__
    order_dict["amount_usd"] = order.amount * rate
    return order_dict
