# OrderTask

OrderTask is a modern, real-time Order Management System designed with a robust Domain-Driven Design (DDD) backend architecture and a highly responsive, mobile-first frontend.

The platform provides seamless order processing, real-time activity tracking via WebSockets, dynamic currency conversions using third-party APIs, and secure HttpOnly cookie-based authentication.

---

## 🚀 Features
- **Real-Time Updates**: Live websocket broadcasts for instant dashboard synchronization whenever an order is created or its status changes.
- **Third-Party API Integrations**: 
  - Real-time `INR` to `USD` currency conversion (via Frankfurter API).
  - Dynamic weather fetching for dashboard context (via Open-Meteo).
  - Random customer generation for quick testing (via Randomuser.me).
- **Advanced Security**: JWT-based authentication featuring short-lived Access Tokens and long-lived Refresh Tokens, securely stored in `HttpOnly` cookies to prevent XSS attacks.
- **Responsive UI**: Built with Next.js and Tailwind CSS, featuring mobile-first sidebars, horizontal scrolling tables, and glassmorphic aesthetics.

---

## 🛠️ Backend Setup Guide

The backend is built with **FastAPI** (Python) and utilizes **PostgreSQL** via SQLAlchemy for data persistence.

### Prerequisites
- Python 3.10+
- PostgreSQL server

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file (see below).
5. Run the application (tables will auto-create on startup):
   ```bash
   uvicorn app.main:app --reload
   ```

### Backend `.env` Example
Create a `.env` file in the root of the `backend` directory:
```env
PROJECT_NAME="OrderFlow API"
VERSION="1.0.0"
API_V1_STR="/api/v1"
SECRET_KEY="your-super-secret-key-change-it-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orderflow"
```

---

## 🎨 Frontend Setup Guide

The frontend is a **Next.js** application styled with **Tailwind CSS**.

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file (see below).
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend `.env` Example
Create a `.env` file in the root of the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
```

---

## 🏗️ Backend Architecture

The backend strictly follows a **Domain-Driven Design (DDD)** folder structure to ensure massive scalability and decoupling.

### Directory Structure
- **`app/core/`**: Houses global configurations, secure WebSocket connection managers, security hashing, JWT generation logic, and the database engine setup.
- **`app/external/`**: Encapsulates all third-party API interactions (`currency_api.py`, `random_user_api.py`, `weather_api.py`). If an external API changes endpoints (e.g., Frankfurter API), it only needs to be updated here, isolating the business logic from external failures.
- **`app/modules/`**: Contains the core business domains (`auth`, `orders`, `dashboard`). Each module is entirely self-contained with its own:
  - `router.py`: FastAPI endpoints.
  - `model.py`: SQLAlchemy database models.
  - `schemas.py`: Pydantic validation schemas.
  - `service.py`: Business logic and database operations.
  - `dependencies.py` (if applicable): Module-specific dependency injections.

### How the System Works
1. **Authentication Flow**: When a user logs in, the `auth/service.py` issues two JWTs (Access & Refresh). The `auth/router.py` injects these directly into the browser as `HttpOnly`, `SameSite=lax` cookies. The frontend Axios client intercepts `401 Unauthorized` requests, automatically hits the `/auth/refresh` endpoint, rotates the token, and seamlessly retries the request.
2. **Order Processing**: When an order is created, the system immediately calculates its USD equivalent via the external `currency_api`. It saves the record to the database and utilizes `app.core.websocket.manager` to broadcast the exact JSON payload to all actively connected clients.
3. **WebSockets**: A single `/ws` endpoint is kept open by the frontend's `useWebSocket` hook. The hook possesses an automatic 3-second reconnection loop in case of network interruptions, guaranteeing that the dashboard metrics and recent activity tables remain in sync across all active tabs without requiring page reloads.
