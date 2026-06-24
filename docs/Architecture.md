# System Architecture & Design

This document provides a comprehensive overview of the architectural design and folder structures used in both the backend and frontend of the **OrderTask** application.

---

## 1. High-Level Architecture

The system follows a classic **Client-Server Architecture** with an emphasis on **real-time communication** and **modular design**.

- **Frontend (Client):** A responsive, single-page application built with Next.js (App Router) and React. It communicates with the backend via RESTful APIs for standard CRUD operations and uses WebSockets for real-time order updates.
- **Backend (Server):** A high-performance Python backend built with FastAPI. It handles business logic, database transactions, authentication, and broadcasts real-time events via a centralized WebSocket manager.
- **Database:** A relational database (managed via SQLAlchemy ORM) used to store user credentials, orders, and transactional data securely.

### Key Architectural Patterns
- **Modular Monolith (Backend):** Features are grouped into distinct domains (auth, orders, dashboard) to maintain clean separation of concerns while keeping deployment simple.
- **Component-Driven UI (Frontend):** UI elements are decoupled into reusable React components.
- **Event-Driven UI Updates:** The frontend subscribes to a WebSocket connection to reflect data changes (e.g., new orders, status changes) without needing to manually poll the server.

---

## 2. Technology Stack

### Frontend
- **Framework:** Next.js (v15+) using the App Router
- **Library:** React (v19)
- **Styling:** Tailwind CSS (v4) with CSS Variables for theme management
- **Icons:** Lucide React
- **Data Fetching & State:** Axios, React Hooks
- **Real-time:** Native WebSockets / `socket.io-client`

### Backend
- **Framework:** FastAPI (Python)
- **ORM:** SQLAlchemy
- **Real-time:** FastAPI WebSockets
- **Authentication:** JWT (JSON Web Tokens)
- **CORS & Middleware:** FastAPI native middleware

---

## 3. Backend Architecture & Folder Structure

The backend follows a **Domain-Driven Design (DDD)** inspired structure. Instead of grouping files by type (e.g., all controllers together, all models together), it groups them by feature/module.

### Backend Directory Layout
```text
backend/
├── app/
│   ├── core/               # Application-wide configurations and setup
│   │   ├── config.py       # Environment variables and settings
│   │   ├── database.py     # SQLAlchemy engine and session management
│   │   ├── security.py     # Password hashing, JWT token generation
│   │   └── websocket.py    # Global WebSocket connection manager
│   │
│   ├── external/           # Integrations with third-party APIs
│   │   └── currency_api.py # External currency conversion/fetching logic
│   │
│   ├── modules/            # Feature-specific domains
│   │   ├── auth/           # Authentication domain
│   │   │   ├── router.py   # API endpoints (login, signup)
│   │   │   ├── schemas.py  # Pydantic models for validation
│   │   │   ├── models.py   # SQLAlchemy database models
│   │   │   └── service.py  # Business logic
│   │   ├── dashboard/      # Analytics and dashboard domain
│   │   │   └── ...
│   │   └── orders/         # Order management domain
│   │       └── ...
│   │
│   ├── shared/             # Reusable utilities, constants, or base schemas
│   │
│   └── main.py             # FastAPI application instance and router registration
│
├── requirements.txt        # Python dependencies
└── venv/                   # Virtual environment
```

### Backend Design Decisions
- **Separation of Concerns:** `router.py` only handles HTTP requests/responses, delegating the actual business logic to `service.py`. `schemas.py` handles validation, and `models.py` defines the DB structure.
- **WebSocket Manager:** A centralized manager in `core/websocket.py` tracks active connections and broadcasts updates (e.g., when an order is created or updated in `orders/service.py`).

---

## 4. Frontend Architecture & Folder Structure

The frontend leverages the **Next.js App Router** for routing, utilizing a modular and scalable directory structure.

### Frontend Directory Layout
```text
frontend/
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/         # Route group for authentication pages
│   │   │   ├── login/      # /login route
│   │   │   │   └── page.tsx
│   │   │   └── signup/     # /signup route
│   │   │       └── page.tsx
│   │   ├── orders/         # /orders route
│   │   │   └── page.tsx
│   │   ├── globals.css     # Global styles and Tailwind v4 imports/theme configuration
│   │   ├── layout.tsx      # Root layout (includes Providers and global UI shells)
│   │   └── page.tsx        # Main entry point (Dashboard)
│   │
│   ├── components/         # Reusable React components
│   │   ├── AuthProvider.tsx# Context provider for managing auth state
│   │   ├── Layout.tsx      # Main application shell (Sidebar, Header, etc.)
│   │   └── ...             # Other UI components (Cards, Buttons, Modals)
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useWebSockets.ts# Hook for managing WebSocket connections and events
│   │
│   └── services/           # API interaction layer
│       ├── authService.ts  # Axios calls for authentication
│       └── ...
│
├── package.json            # Node dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration for Tailwind
└── tailwind.config.ts      # (Optional) Tailwind configuration file
```

### Frontend Design Decisions
- **Route Groups:** Using `(auth)` allows grouping related pages logically without affecting the URL path.
- **Service Layer:** API calls are abstracted into the `src/services/` directory using Axios. This keeps React components clean and focused strictly on the UI.
- **Context API:** `AuthProvider.tsx` is used to globally manage the user's authentication state, preventing prop-drilling.
- **Real-time Hooks:** `useWebSockets.ts` isolates the WebSocket lifecycle management, exposing simple callback registries for components to use when data arrives.
- **Tailwind CSS v4:** Uses the modern `@import "tailwindcss";` and `@theme inline` structure for styling directly inside `globals.css`.

---

## Conclusion
This architecture ensures that **OrderTask** remains maintainable, highly cohesive, and loosely coupled. The backend modularity allows for easy feature additions without regressions, while the frontend's strict separation between UI components and service/state layers guarantees a scalable codebase.
