from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.core.websocket import manager

# Import new module routers
from app.modules.auth.router import router as auth_router
from app.modules.orders.router import router as orders_router
from app.modules.dashboard.router import router as dashboard_router

# For testing without Alembic, we can auto-create tables:
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build main API router
api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(orders_router)
api_router.include_router(dashboard_router)

# Include websocket
@api_router.websocket("/ws/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "OrderFlow API Running. Visit /docs for Swagger UI"}