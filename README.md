# Real-Time Order Management Dashboard

A lightweight full-stack application built with FastAPI (Python), PostgreSQL, Next.js (React), and Tailwind CSS. It demonstrates real-time status updates via WebSockets, database modeling, external API integration, and clean engineering practices.

## Features

- **Authentication**: JWT-based mock authentication.
- **Real-time Updates**: Order status changes broadcasted to all connected clients via WebSockets automatically.
- **External API Integration**: Automatically converts EUR to USD upon order creation/read via the `Frankfurter.app` open source exchange rate API.
- **Premium Frontend UI**: Built with Next.js, featuring responsive design, glassy components, dark mode, loading states, and smooth interactions.
- **Database Migrations**: Setup using Alembic.
- **Containerization Support**: Includes Docker setup for PostgreSQL database.

## Architecture Decisions

1. **Backend Architecture**:
   - Used **FastAPI** for its high performance, automatic OpenAPI documentation, and native WebSocket support.
   - Organized into modular components: `api` (routes), `models` (DB), `schemas` (Pydantic), `core` (Config/Auth), and `external` (API integrations).
   - **PostgreSQL** + **SQLAlchemy** chosen for robust relational data handling. **Alembic** is used for future-proof migrations.
   - `Frankfurter` API is used over standard mocked APIs because it provides reliable currency exchange without needing an API Key, simplifying deployment.

2. **Frontend Architecture**:
   - **Next.js (App Router)** + **React** used to provide a modern, highly performant React framework.
   - **Tailwind CSS** with custom dark styling to achieve the requested premium dashboard look without relying heavily on bulky UI libraries.
   - Used `axios` with an interceptor to cleanly manage Auth tokens across all requests.
   - A custom `useWebSocket` hook abstracting connection logic and message parsing to push updates cleanly into React component state without refreshing.

## Setup Instructions

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
1. Navigate to `backend/` directory.
2. Start the database: `docker-compose up -d`
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`
6. Run Alembic migrations (Optional if database is clean): `alembic upgrade head`
7. Start the server: `uvicorn app.main:app --reload`
   - The API will be available at http://localhost:8000
   - Swagger Documentation available at http://localhost:8000/docs

### 3. Frontend Setup
1. Navigate to `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Access the application at http://localhost:3000

## API Documentation
The swagger documentation provides full details on all endpoints.
- `/api/v1/auth/login`: POST mock login
- `/api/v1/orders/`: GET (list), POST (create)
- `/api/v1/orders/{id}`: GET (read), PUT (update status)
- `/api/v1/ws/ws`: WebSocket endpoint
