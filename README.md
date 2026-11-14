# CookConnect — Phase 1: Foundation & Neighbourhood Cook Marketplace

> **"One Cook. Multiple Households. Affordable Cooking. Better Earnings."**

CookConnect connects households in Indian residential societies with verified independent cooks and enables multiple nearby families to share one cook, reducing meal expenses by **40% to 60%** while increasing the cook's hourly earnings.

---

## 🏗️ 1. Project Architecture

CookConnect follows a strict **single-root unified architecture**. The React frontend and Node.js/Express backend live together inside one root project under `src/`, with all dependencies managed via the root `package.json`.

```
CookConnect/
├── public/
│   └── assets/
│       └── favicon.svg
├── src/
│   ├── frontend/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/            # Button, Card, Badge, Modal, Input
│   │   │   ├── layout/            # Navbar, Footer, DashboardLayout
│   │   │   ├── animations/        # FadeIn, StaggerContainer, ScaleOnHover
│   │   │   └── voice/             # VoiceAssistantModal (AI voice entry point)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Premium high-conversion landing page
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── customer/          # CustomerDashboard, CookDetailsModal, BookingsList
│   │   │   ├── cook/              # CookDashboard, AvailabilityManager, ProfileEdit
│   │   │   └── admin/             # AdminDashboard (System metrics & governance)
│   │   ├── services/              # Axios API clients (auth, cook, booking, location)
│   │   ├── context/               # AuthContext (JWT auth state, roles, session)
│   │   ├── hooks/                 # useAuth, useDebounce
│   │   ├── routes/                # AppRoutes, ProtectedRoute (Role-based guards)
│   │   ├── utils/                 # Currency formatters, constants
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind + Brand Design System
│   │
│   └── backend/
│       ├── config/
│       │   ├── database.js        # Prisma client singleton
│       │   ├── env.js             # Environment configuration
│       │   └── seed.js            # Comprehensive Indian society & cook seeder
│       ├── models/                # Prisma query & persistence layer
│       │   ├── user.model.js
│       │   ├── cook.model.js
│       │   ├── location.model.js
│       │   ├── availability.model.js
│       │   └── booking.model.js
│       ├── controllers/           # HTTP handlers & response formatting
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── cook.controller.js
│       │   ├── availability.controller.js
│       │   ├── location.controller.js
│       │   └── booking.controller.js
│       ├── services/              # Business logic & pool pricing calculators
│       │   ├── auth.service.js
│       │   ├── user.service.js
│       │   ├── cook.service.js
│       │   ├── availability.service.js
│       │   ├── location.service.js
│       │   └── booking.service.js
│       ├── routes/                # API endpoints router
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── cook.routes.js
│       │   ├── availability.routes.js
│       │   ├── location.routes.js
│       │   ├── booking.routes.js
│       │   └── index.js
│       ├── middleware/            # JWT auth, role authorize, Zod validator, errorHandler
│       ├── validators/            # Zod validation schemas
│       ├── sockets/               # Real-time Socket.IO foundation (Phase 2/3 ready)
│       ├── utils/                 # Standard ApiResponse envelope
│       ├── app.js                 # Express app setup, Helmet, CORS, Rate-limiting
│       └── server.js              # HTTP server entry point & Socket.IO initialization
│
├── prisma/
│   └── schema.prisma              # PostgreSQL schema with PostGIS-ready coordinate architecture
├── .env                           # Local environment config
├── .env.example                   # Sample environment template
├── .gitignore
├── index.html                     # Vite entry HTML
├── package.json                   # Unified root dependencies
├── tailwind.config.js             # Custom brand design system
├── vite.config.js                 # Vite + React configuration with /api proxy
└── test_phase1.js                 # Automated 27-point verification suite
```

---

## 🎨 2. Brand Identity & Design System

The platform is styled with a distinct, premium food-tech aesthetic tailored for Indian residential communities:

| Token | Hex | Usage |
|---|---|---|
| **Forest Green** | `#174D38` | Primary brand color, headers, hero accents, primary CTAs |
| **Fresh Green** | `#8BCF83` | Secondary accents, badges, savings highlights, success indicators |
| **Warm Cream** | `#FAF8F1` | Background canvas, soft contrast, warm domestic hospitality feel |
| **Charcoal** | `#202923` | High-contrast typography and structured surfaces |
| **Muted Sage** | `#E7EFE5` | Neutral borders, tag pills, soft card highlights |

- **Typography**: Outfit for display headings, Plus Jakarta Sans for body prose.
- **Interactions**: Smooth entrance and hover animations using Motion for React (`framer-motion`), fully honoring `prefers-reduced-motion` accessibility preferences.

---

## 🗄️ 3. Database Schema Overview (PostgreSQL + Prisma)

- **`User`**: Core identity table (`CUSTOMER`, `COOK`, `ADMIN`), bcrypt-hashed passwords, profile links.
- **`CookProfile`**: Experience years, culinary specialities, cuisines, dietary practices (`Pure Vegetarian`, `Jain`, `Non-Vegetarian`), capacity, base monthly rate, ratings, reviews count.
- **`Society`**: Residential gated societies with locality, city, postal code, and latitude/longitude coordinates (PostGIS-ready).
- **`CookSociety`**: Many-to-many relationship linking cooks with the residential societies they service.
- **`HouseholdLocation`**: User flat and tower locations within societies (e.g., Tower B, Flat 704).
- **`CookAvailability`**: Day-of-week slots (`MONDAY` - `SUNDAY`) across `BREAKFAST`, `LUNCH`, `DINNER` with booking status and slot capacities.
- **`Booking`**: Subscriptions between customer and cook, meal slots, start/end dates, monthly rate, and **`sharedRatio`** (1.0 for solo, 0.55 for 2-family pool, 0.40 for 3-family pool).
- **`BookingRequirement`**: Dietary preferences, spice levels, family size, special instructions.
- **`Review`**: Resident ratings (1-5 stars) and authentic feedback.
- **`GroupRequest` & `GroupMember`**: Architectural foundation for Phase 2 automated neighbourhood cook pooling.
- **`Notification`**: Real-time notification structure.
- **`VoiceSession`**: Conversational session state for Phase 2 Gnani AI speech integration.

---

## 📡 4. REST API Endpoint Catalog

All API endpoints follow a unified response envelope:
`{ "success": true, "message": "...", "data": ..., "meta": ... }`

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new customer or cook partner (Zod validated).
- `POST /api/auth/login` — Login with JWT token issuance (also sets HTTP-only cookie).
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `POST /api/auth/logout` — Clear session cookie.

### Cooks & Discovery (`/api/cooks`)
- `GET /api/cooks/discover` — Search and filter cooks by `societyId`, `cuisine`, `diet`, `mealType`, `minRating`, `maxPrice`, `search`.
- `GET /api/cooks/:id` — View full cook details, bio, rating, schedule, and reviews.
- `GET /api/cooks/me` — Cook views their own profile (Cook only).
- `PUT /api/cooks/me` — Cook updates bio, rates, cuisines, specialities (Cook only).
- `GET /api/cooks/pool-preview/:societyId` — View forming multi-household pools in a society.

### Availability (`/api/availability`)
- `GET /api/availability/cook/:cookProfileId` — View schedule slots for a cook.
- `GET /api/availability/me` — Cook views their weekly slots.
- `POST /api/availability` — Cook adds a new visiting slot (Day + Meal type + Time).
- `PUT /api/availability/:id` — Cook updates or toggles slot booked status.
- `DELETE /api/availability/:id` — Cook removes a slot.

### Locations & Societies (`/api/locations`)
- `GET /api/locations/societies` — List residential societies with cook counts.
- `GET /api/locations/societies/:id` — Details of a residential society.
- `POST /api/locations/societies` — Admin adds a new society.
- `GET /api/locations/my-locations` — Customer views their registered household flats.
- `POST /api/locations/my-locations` — Customer links an apartment flat to a society.

### Bookings & Reviews (`/api/bookings`)
- `POST /api/bookings` — Customer books a cook (Solo or Neighbourhood Shared Pool).
- `GET /api/bookings/customer` — Customer views their subscriptions.
- `GET /api/bookings/cook` — Cook views incoming requests and active households.
- `PATCH /api/bookings/:id/status` — Accept, cancel, or complete booking.
- `POST /api/bookings/reviews` — Customer leaves a 1-5 star review.

### User & Governance (`/api/users`)
- `GET /api/users/profile` — View profile.
- `PUT /api/users/profile` — Update profile.
- `GET /api/users/admin/stats` — Platform metrics (Admin only).

---

## 🔑 5. Pre-Seeded Demonstration Accounts

| Role | Name | Email | Password | Society |
|---|---|---|---|---|
| **Customer** | Priya Sharma | `priya.sharma@example.com` | `Customer#123` | Prestige Shantiniketan (Tower B, Flat 704) |
| **Customer** | Rohit Verma | `rohit.verma@example.com` | `Customer#123` | DLF The Icon Phase 5 (Wing A, Flat 1202) |
| **Cook** | Sunita Devi | `sunita.devi@cookconnect.in` | `CookPass#123` | Prestige Shantiniketan (North Indian Specialist) |
| **Cook** | Ramesh Nair | `ramesh.nair@cookconnect.in` | `CookPass#123` | Prestige Shantiniketan (South Indian Specialist) |
| **Cook** | Anita Joshi | `anita.joshi@cookconnect.in` | `CookPass#123` | Hiranandani Estate (Gujarati/Jain Specialist) |
| **Admin** | Administrator | `admin@cookconnect.in` | `CookAdmin#2026` | System-wide Governance |

*Tip: The Login page provides one-click autofill buttons for each demo role.*

---

## 🚀 6. Installation & Execution Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL 14+ (Local service or cloud connection)

### Setup Instructions

1. **Clone & Install Dependencies**:
   ```bash
   cd CookConnect
   npm install
   ```

2. **Configure Environment (`.env`)**:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   DATABASE_URL="postgresql://postgres@localhost:5433/cookconnect_db?schema=public"
   JWT_SECRET="cookconnect_jwt_super_secret_phase1_key_2026_xyz987"
   JWT_EXPIRES_IN="7d"
   ```

3. **Initialize Database & Seed Data**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Run Application in Development**:
   ```bash
   npm run dev
   ```
   - Frontend starts at: `http://localhost:5173`
   - Backend API starts at: `http://localhost:5000/api`

5. **Run in Production**:
   ```bash
   npm run build
   npm start
   ```

6. **Run Verification Test Suite**:
   ```bash
   node test_phase1.js
   ```

---

## 🧪 7. Test Results Summary

Automated 27-point verification test suite passed with **100% success rate**:

- ✅ Backend health check (`GET /api/health`)
- ✅ Cook discovery with full pricing calculation (`GET /api/cooks/discover`)
- ✅ Cuisine & dietary filtering (`GET /api/cooks/discover?cuisine=South Indian`)
- ✅ Residential societies directory (`GET /api/locations/societies`)
- ✅ Customer authentication & JWT issuance (`POST /api/auth/login`)
- ✅ Cook partner authentication (`POST /api/auth/login`)
- ✅ Admin authentication (`POST /api/auth/login`)
- ✅ Role-based authorization guard (403 Forbidden on unauthorized role access)
- ✅ Customer registration with society & flat association (`POST /api/auth/register`)
- ✅ Shared pool booking request creation with 45% discount calculation (`POST /api/bookings`)
- ✅ Cook acceptance and status activation (`PATCH /api/bookings/:id/status`)
- ✅ Verified review submission & aggregate rating recalculation (`POST /api/bookings/reviews`)
- ✅ Cook availability management: adding slot & removing slot (`POST /api/availability`, `DELETE /api/availability/:id`)
- ✅ Admin platform analytics & metrics (`GET /api/users/admin/stats`)
- ✅ Neighbourhood pool forming preview (`GET /api/cooks/pool-preview/:societyId`)

---

## 🔮 8. Phase Boundaries & Roadmap

### Phase 1 (Completed):
- Single-root unified architecture with strict MVC backend.
- PostgreSQL database with Prisma ORM.
- Authentication, JWT, bcrypt, Zod validation, role authorization.
- Premium food-tech design system with Motion animations.
- Complete landing page with live shared pricing calculator.
- Customer dashboard with database discovery, filtering, and booking.
- Cook dashboard with profile editing, availability scheduling, and booking management.
- Admin dashboard with platform analytics.
- Voice assistant conversational UI entry point (simulated preview).

### Phase 2 (Upcoming):
- Live Gnani AI multilingual Speech-to-Text and Text-to-Speech integration.
- Neighbourhood group matching algorithms & automated tower pool forming.
- Real-time Socket.IO chat and cook arrival notifications.
- Dynamic group cost sharing contracts.

### Phase 3 (Upcoming):
- Online payments & escrow billing via UPI / Razorpay.
- Society gate pass integration (MyGate / NoBrokerHood webhooks).
- Advanced cook route optimization across residential complexes.

#   V a n i C o o k  
 