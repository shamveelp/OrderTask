from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderBase(BaseModel):
    customer_name: str
    amount: float
    status: str = "Pending"

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: str

class Order(OrderBase):
    id: int
    created_at: datetime
    
    amount_usd: Optional[float] = None

    class Config:
        from_attributes = True
