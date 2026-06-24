from typing import Annotated
from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core import security
from app.core.config import settings
from app.modules.auth import service, schemas
from app.modules.auth.model import User
from app.modules.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["auth"])

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
    )

@router.post("/login")
async def login_for_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    tokens = service.authenticate_user(db, form_data.username, form_data.password)
    set_auth_cookies(response, tokens["access_token"], tokens["refresh_token"])
    return {"message": "Login successful", "access_token": tokens["access_token"], "token_type": "bearer"}

@router.post("/signup", response_model=schemas.User)
async def signup(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    return service.create_user(db, user_in)

@router.post("/refresh")
async def refresh_access_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    
    payload = security.verify_token(refresh_token, "refresh")
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    access_token = security.create_access_token(data={"sub": user.username})
    new_refresh_token = security.create_refresh_token(data={"sub": user.username})
    set_auth_cookies(response, access_token, new_refresh_token)
    return {"message": "Token refreshed successfully"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user_status(current_user: User = Depends(get_current_active_user)):
    return {"authenticated": True, "username": current_user.username}
