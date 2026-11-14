# Technology Stack & System Architecture: CookConnect (VaniCook)

This document provides a thorough audit of the technology stack, software architecture, third-party libraries, and system infrastructure used throughout CookConnect.

---

## 1. Architectural Architecture Overview

CookConnect is architected as a **unified single-root full-stack repository** adhering strictly to Model-View-Controller (MVC) principles on the backend and modern component-driven reactive principles on the frontend.

```
                          ┌────────────────────────────────────────────────────────┐
                          │               CLIENT LAYER (Browser / Mobile)          │
                          │   React 19 • Vite 6 • Tailwind CSS • Motion for React  │
                          └───────────────────────────┬────────────────────────────┘
                                                      │
                                                      │ HTTP / REST & WebSockets (Socket.IO)
                                                      │ Audio Base64 (16kHz PCM WAV)
                                                      ▼
                          ┌────────────────────────────────────────────────────────┐
                          │               NODE.JS / EXPRESS BACKEND                │
                          │                 (Strict MVC Structure)                 │
                          │                                                        │
                          │  Controllers:  Voice, Cook, Group, Booking, Admin      │
                          │  Services:     Orchestrator, Pricing, Scheduling       │
                          │  Middleware:   JWT Auth, Role Guard, Zod Validators    │
                          └───────────────┬────────────────────────┬───────────────┘
                                          │                        │
               REST / Multipart FormData  │                        │ Prisma ORM Client
               X-API-Key-ID Auth          │                        │ Parameterized Queries
                                          ▼                        ▼
┌──────────────────────────────────────────────────┐      ┌───────────────────────────────┐
│              GNANI AI MULTILINGUAL CLOUD         │      │       POSTGRESQL 18 RDBMS     │
│  Prisma STT:  https://api.vachana.ai/stt/v3      │      │                               │
│  Timbre TTS:  https://api.vachana.ai/api/v1/tts  │      │  User, Society, CookProfile,  │
│  Languages:   Hindi, Marathi, Kannada, English   │      │  GroupRequest, Booking, Review│
└──────────────────────────────────────────────────┘      └───────────────────────────────┘
```

---

## 2. Frontend Technologies & Dependencies

| Category | Technology | Version | Purpose & Implementation |
| :--- | :--- | :--- | :--- |
| **Core Framework** | **React** | `^19.0.0` | Declarative UI rendering, hooks (`useState`, `useEffect`, `useRef`, `useContext`). |
| **DOM Renderer** | **React DOM** | `^19.0.0` | Browser DOM reconciliation and client rendering. |
| **Build Tool & Bundler** | **Vite** | `^6.2.0` | Ultra-fast Hot Module Replacement (HMR), Rollup-based tree-shaking and production asset bundling. |
| **Client Routing** | **React Router DOM** | `^7.2.0` | Declarative client routing with role-based Route Guards (`ProtectedRoute.jsx`), code splitting via `lazy()`. |
| **Styling & Design System** | **Tailwind CSS** | `^3.4.17` | Utility-first styling with custom editorial color palette (`#173D2E` Forest, `#F8F5EC` Ivory, `#C47755` Terracotta). |
| **CSS Preprocessing** | **PostCSS & Autoprefixer** | `^8.5.3` / `^10.4.20` | Vendor prefixing and CSS transformation. |
| **Animations & Transitions** | **Motion for React** (`framer-motion`) | `^12.4.7` | Hardware-accelerated UI entrance animations, animated soundwave rings, modal transitions. |
| **Iconography** | **Lucide React** | `^0.475.0` | Crisp, scalable SVG iconography across all customer and cook dashboard cards. |
| **HTTP Client** | **Axios** | `^1.7.9` | Promise-based asynchronous HTTP client with base URL configuration and JWT bearer interceptors. |
| **Real-time Client** | **Socket.IO Client** | `^4.8.1` | Bi-directional WebSocket communication for live pool household count updates. |
| **Audio Processing** | **Web Audio API** (`WavRecorder`) | Native Browser API | `AudioContext` and `ScriptProcessorNode` capturing 16kHz mono linear PCM in standard RIFF WAVE. |

---

## 3. Backend Technologies & Dependencies

| Category | Technology | Version | Purpose & Implementation |
| :--- | :--- | :--- | :--- |
| **Runtime Engine** | **Node.js** | `>= 20.0` (ES Modules) | Asynchronous non-blocking runtime with native modern ES Modules (`import`/`export`). |
| **Web Server Framework** | **Express.js** | `^4.21.2` | RESTful API routing, middleware chaining, and HTTP request dispatching. |
| **Real-time Engine** | **Socket.IO** | `^4.8.1` | Society-level room management (`emitToSociety`, `emitToGroup`) for live pool joining notifications. |
| **Database ORM** | **Prisma Client** | `^6.4.1` | Type-safe query builder, relation mapping, schema migrations, and connection pooling. |
| **Security & Headers** | **Helmet** | `^8.0.0` | Sets secure HTTP response headers (CSP, HSTS, frame protection). |
| **CORS Middleware** | **CORS** | `^2.8.5` | Cross-Origin Resource Sharing control with credentials support. |
| **Rate Limiting** | **express-rate-limit** | `^7.5.0` | Prevents denial-of-service and brute-force attacks on auth and voice endpoints. |
| **Authentication & Tokens**| **JSON Web Token (`jsonwebtoken`)** | `^9.0.2` | Stateless signed bearer token issuing and verification (`HS256`). |
| **Password Hashing** | **bcryptjs** | `^3.0.2` | Salted one-way password hashing (10 salt rounds) for user and cook credentials. |
| **Schema Validation** | **Zod** | `^3.24.2` | Runtime schema validation for incoming HTTP request bodies (auth, booking, group). |
| **Form Data Handling** | **form-data** | `^4.0.0` | Constructs compliant multipart/form-data streams for Gnani Prisma STT audio uploads. |
| **Environment Config** | **dotenv** | `^16.4.7` | Zero-dependency environment variable loader from `.env`. |

---

## 4. Database Architecture & Models (PostgreSQL 18 + Prisma)

The relational schema is configured in [`prisma/schema.prisma`](file:///d:/codesVinit/Cookconnect/prisma/schema.prisma) with 11 primary models:

1. **`User`**: Base identity with role (`CUSTOMER`, `COOK`, `ADMIN`), email, phone, and hashed credentials.
2. **`HouseholdLocation`**: User residences tagged with `societyId`, building name, flat number, and primary flag.
3. **`Society`**: Residential apartment complex containing name, locality, city, state, postal code, and geographic coordinates (`latitude`, `longitude`).
4. **`CookProfile`**: Professional cook details, bio, experience years, cuisines array, dietary specialties, hourly/monthly base rates, verification flag, max households limit (typically 4).
5. **`CookSociety`**: Many-to-many relationship mapping which residential societies a cook is actively cleared to serve.
6. **`CookAvailability`**: Cook shift scheduling table (`dayOfWeek`, `mealSlot`, `isAvailable`).
7. **`GroupRequest`**: The core pool entity (`OPEN`, `MATCHING`, `COOK_PENDING`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`), meal type, target vs current households, estimated shared price per household.
8. **`GroupMember`**: Join table tracking which households belong to which pool, flat number, and cost share percentage.
9. **`Booking`**: Formalized customer-to-cook engagement (`PENDING`, `CONFIRMED`, `ACTIVE`, `CANCELLED`), monthly rate, shared ratio, schedule details.
10. **`BookingRequirement`**: Granular dietary instructions, spice level, family member headcounts.
11. **`VoiceSession`**: Voice state persistence table tracking session state (`IDLE`, `LISTENING`, `CONFIRMATION_REQUIRED`, `EXECUTED`), recognized transcript, pending action payload, and synthesized audio reference.

---

## 5. Security & Data Protection Measures

- **No Secrets in Frontend:** API keys (`GNANI_API_KEY`, `JWT_SECRET`) reside solely in the backend `.env` and are never serialized or sent down to browser code.
- **Safe Audio Base64 Extraction:** Custom `extractAudioBuffer()` utility strips Data URL scheme prefixes before Base64 decoding, preventing RIFF corruption.
- **Pre-flight Audio Magic Byte Validation:** STT service verifies RIFF and WAVE magic headers before dispatching bytes upstream, eliminating corrupted API payloads.
- **Role Guard Middleware:** Restricts endpoints such that only `COOK` can access availability managers, only `ADMIN` can verify cooks, and customers cannot tamper with other households' bookings.
- **Parameterized SQL Queries:** Prisma ORM completely abstracts raw SQL, protecting against SQL injection vulnerabilities.

