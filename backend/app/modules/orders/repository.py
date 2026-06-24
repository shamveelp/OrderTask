from sqlalchemy.orm import Session
from typing import List, Optional
from app.modules.orders.model import Order
from app.modules.orders.schemas import OrderCreate

def get_order(db: Session, order_id: int) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Order]:
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.offset(skip).limit(limit).all()

def create_order(db: Session, order_in: OrderCreate) -> Order:
    db_order = Order(
        customer_name=order_in.customer_name,
        amount=order_in.amount,
        status=order_in.status
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_status(db: Session, db_order: Order, new_status: str) -> Order:
    db_order.status = new_status
    db.commit()
    db.refresh(db_order)
    return db_order
