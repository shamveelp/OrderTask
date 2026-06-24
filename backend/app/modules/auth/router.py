from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth import service, schemas

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    return service.authenticate_user(db, form_data.username, form_data.password)

@router.post("/signup", response_model=schemas.User)
async def signup(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    return service.create_user(db, user_in)
