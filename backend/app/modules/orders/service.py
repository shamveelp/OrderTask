from typing import List, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.orders import repository, schemas
from app.external.currency_api import get_exchange_rate
from app.core.websocket import manager

async def get_all_orders_with_usd(db: Session, skip: int = 0, limit: int = 100, status: str = None) -> List[dict]:
    orders = repository.get_orders(db, skip=skip, limit=limit, status=status)
    rate = await get_exchange_rate("INR", "USD")
    results = []
    for order in orders:
        order_dict = order.__dict__.copy()
        order_dict["amount_usd"] = order.amount * rate
        results.append(order_dict)
    return results

async def create_order_with_broadcast(db: Session, order_in: schemas.OrderCreate) -> dict:
    order = repository.create_order(db, order_in)
    
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
    order_dict = order.__dict__.copy()
    order_dict["amount_usd"] = order.amount * rate
    return order_dict

async def get_single_order_with_usd(db: Session, order_id: int) -> dict:
    order = repository.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    rate = await get_exchange_rate("INR", "USD")
    order_dict = order.__dict__.copy()
    order_dict["amount_usd"] = order.amount * rate
    return order_dict

async def update_order_with_broadcast(db: Session, order_id: int, order_in: schemas.OrderUpdate) -> dict:
    order = repository.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = repository.update_order_status(db, order, order_in.status)
    
    await manager.broadcast({
        "type": "update_order",
        "data": {
            "id": order.id,
            "status": order.status
        }
    })
    
    rate = await get_exchange_rate("INR", "USD")
    order_dict = order.__dict__.copy()
    order_dict["amount_usd"] = order.amount * rate
    return order_dict
