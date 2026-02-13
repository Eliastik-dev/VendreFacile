# VendreFacile
 
 ## Docker Access
 - **Frontend**: [http://localhost:5174](http://localhost:5174)
 - **Backend API**: [http://localhost:3001](http://localhost:3001)
 - **Postgres Primary**: Localhost:5432
 - **Postgres Replica**: Localhost:5433
 
 ## Development - Full Stack Classified Ads Platform

![Architecture](https://img.shields.io/badge/Architecture-Hexagonal-blue)
![DDD](https://img.shields.io/badge/Pattern-DDD-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Redis](https://img.shields.io/badge/Redis-7-red)

A production-grade full-stack classified ads platform built with **Hexagonal Architecture**, **Domain-Driven Design**, and modern React. Organized as a monorepo for streamlined development.

## 🏗️ Project Structure

```
VendreFacile/
├── server/                 # Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── modules/       # 4 Bounded Contexts (Ads, Users, Messaging, Search)
│   │   ├── shared/        # Infrastructure (DB, Redis, Security)
│   │   └── server.ts      # Express app
│   ├── tests/
│   └── package.json
├── client/                 # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API integration layer
│   │   ├── stores/        # Zustand state management
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml      # Full-stack orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (recommended)
- PostgreSQL 15 (if running without Docker)
- Redis 7 (if running without Docker)

### Option 1: Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Server, Client)
docker-compose up --build

# Server will run on http://localhost:3000
# Client will run on http://localhost:5173
```

### Option 2: Local Development

#### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env with your configuration

# Start PostgreSQL and Redis (via Docker or local)
docker-compose up postgres redis -d

# Run server
npm run dev
```

**Server runs on:** `http://localhost:3000`

#### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

**Client runs on:** `http://localhost:5173`

## 📊 Backend Architecture

### Hexagonal Architecture with DDD

The backend follows clean architecture principles:

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (REST)                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│         (Use Cases, DTOs, Port Interfaces)                  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│    (Entities, Value Objects, Domain Events)                 │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │
│  │    Ads    │  │  Users   │  │ Messaging │  │  Search  │ │
│  └───────────┘  └──────────┘  └───────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│    (PostgreSQL, Redis, Security, External APIs)             │
└─────────────────────────────────────────────────────────────┘
```

### Four Bounded Contexts

1. **Ads** - Core business logic for classified ads
2. **Users** - Authentication, authorization, PII encryption
3. **Messaging** - Buyer-seller communication
4. **Search** - Optimized search with caching (<200ms)

## 🎨 Frontend Architecture

### React + Vite + Tailwind CSS

**Key Technologies:**
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

### Service Layer Architecture

```typescript
// API Client with JWT interceptors
services/api.ts → Axios instance

// Domain Services
services/authService.ts   → Login, register, token management
services/adService.ts     → CRUD operations for ads
services/searchService.ts → Search with client-side caching
```

### State Management

```typescript
// Zustand stores
stores/useAuthStore.ts → User authentication state
```

## 📱 Features

### ✅ Implemented

**Backend:**
- User authentication (JWT)
- Ad management (Create, publish, update, mark as sold)
- Internal messaging system
- Optimized search with Redis caching
- PII encryption (GDPR compliance)
- Rate limiting
- Health checks

**Frontend:**
- Responsive home page with search
- Ad grid with filters (category, price, location)
- Mobile-responsive navigation
- Authentication state management
- Client-side search caching
- Loading and error states

### 🚧 To Be Implemented

- Ad details page
- User dashboard (My Ads, Favorites)
- Login/Register pages
- Messaging interface
- GDPR cookie banner
- Image upload

## 🔐 Security Features

### Backend
- **JWT tokens** with access/refresh pattern
- **Password hashing** with bcrypt (12 rounds)
- **PII encryption** with AES-256-GCM (GDPR)
- **Rate limiting** (100 req/15min)
- **SQL injection prevention** (parameterized queries)

### Frontend
- **Token storage** in localStorage
- **Automatic token refresh** via interceptors
- **Protected routes** (authentication required)
- **XSS protection** (React DOM escaping)

## 📊 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```http
POST /register
Body: { email, password, firstName, lastName, phone? }

POST /login
Body: { email, password }
Response: { accessToken, refreshToken, userId, email, role }
```

### Ads
```http
GET /ads
Query: ?sellerId, ?status

POST /ads (authenticated)
Body: { title, description, price, currency, city, postalCode, category, images[] }

GET /ads/:id

PATCH /ads/:id/publish (authenticated)

PATCH /ads/:id/sold (authenticated, owner only)
```

### Search
```http
GET /search
Query: ?keyword, ?category, ?minPrice, ?maxPrice, ?city, ?page, ?limit
```

### Messaging
```http
GET /conversations (authenticated)

GET /conversations/:id/messages (authenticated)

POST /messages (authenticated)
Body: { receiverId, adId, content }
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test                # Run all tests
npm run test:watch      # Watch mode
```

### Frontend Build
```bash
cd client
npm run build           # Production build
npm run preview         # Preview production build
```

## 🔄 Performance

### Target Metrics
- **Search response:** <200ms (with caching)
- **Page load:** <1s (first contentful paint)
- **API response:** <100ms (database queries)

### Optimizations
- **Backend**: Redis caching, database indexes, connection pooling
- **Frontend**: Client-side caching, code splitting, lazy loading

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache & sessions |
| Server | 3000 | Node.js API |
| Client | 5173 | React app |

## 📝 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vendrefacile_db
DB_USER=vendrefacile
DB_PASSWORD=change_me
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=32-character-key-here-for-pii
```

### Client (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 📈 Scalability Strategy

### Horizontal Scaling
- Stateless backend (sessions in Redis)
- Load balancer ready
- Database read replicas
- Redis cluster for high availability

### Vertical Scaling
- PostgreSQL resource optimization
- Connection pooling (2-10 connections)
- Indexed queries
- Caching strategy

## 📚 Key Design Decisions

### Why Monorepo?
- Shared TypeScript types
- Atomic commits across stack
- Simplified CI/CD
- Better developer experience

### Why Hexagonal Architecture?
- Domain isolation from frameworks
- Easy to test (mock infrastructure)
- Flexibility to swap implementations

### Why Vite?
- Extremely fast HMR (<100ms)
- Modern ESM-based build
- Optimized for React

### Why Tailwind CSS?
- Fast development
- Consistent design system
- Small production bundle (PurgeCSS)
- Mobile-first responsive design

## 🎓 Educational Value

This project demonstrates:
- ✅ Enterprise architecture patterns
- ✅ Clean code principles (SOLID, KISS)
- ✅ Test-driven development
- ✅ Security best practices
- ✅ Scalability considerations
- ✅ Modern full-stack development

Perfect for:
- Final year university projects
- Senior developer interviews
- Learning DDD and hexagonal architecture
- Full-stack portfolio projects

## 📜 License

MIT License - Academic Project

---

**Built with ❤️ using Hexagonal Architecture, DDD, React, and modern best practices**
