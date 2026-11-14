<div align="center">

# 🍳 VaniCook
### *One Cook. Multiple Households. Affordable Cooking. Better Livelihoods.*

<p align="center">
  <strong>An AI-powered, location-centric neighbourhood cook-sharing platform with multilingual voice intelligence.</strong>
  <br />
  <em>Developed for the <strong>Gnani AI Multilingual Hackathon 2026</strong></em>
</p>

[![Gnani AI Hackathon](https://img.shields.io/badge/Gnani_AI-Hackathon_2026-6366F1?style=for-the-badge&logo=openai&logoColor=white)](https://api.vachana.ai)
[![React 19](https://img.shields.io/badge/React_19-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express_MVC-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL_18-Prisma_ORM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

<br />

[✨ Explore Features](#-key-features) •
[🎙️ Gnani Voice AI](#-gnani-ai-voice-architecture) •
[🏢 Neighbourhood Pools](#-the-neighbourhood-cook-pool-innovation) •
[📸 Live UI Gallery](#-application-walkthrough--visual-gallery) •
[🚀 Quickstart Guide](#-quickstart-guide) •
[🔑 Demo Accounts](#-one-click-demo-credentials)

<br />
<br />

<img src="./screenshots/01_landing_page.png" alt="VaniCook Landing Page Hero" width="95%" style="border-radius: 18px; box-shadow: 0 20px 40px rgba(0,0,0,0.25);" />

</div>

---

## 🌟 Executive Overview

**VaniCook** (CookConnect) transforms urban domestic cooking for Indian gated residential societies. 

Traditional domestic cooking platforms treat cook hiring as an expensive, isolated 1:1 engagement (costing households **₹3,500–₹5,000/month** while forcing cooks to travel between 5–7 distant houses in grueling city traffic). 

**VaniCook changes the game through Spatial Pooling:**
- Adjacent families in the same apartment tower (e.g., Tower B, Flats 701, 704, and 802) share **one verified, dedicated home cook** visiting their floor sequentially.
- **Households save 45% to 55%** on monthly cooking costs (dropping down to **₹1,400–₹1,800/month** or ~₹45/meal).
- **Cooks earn +65% to +80% more** (**₹28,000–₹35,000/month**) with **ZERO inter-city commute**—all within one residential complex.
- **Vani Voice Assistant (Powered by Gnani AI):** Non-tech-savvy domestic cooks and regional residents can discover cooks, form pools, and check daily schedules using natural voice in **Hindi, Marathi, Kannada, English, and Hinglish**.

---

## 📊 Market Comparison: Why VaniCook Wins

| Feature Dimension | Traditional Cook Agencies (BookMyBai, Helpers Near Me) | Food Delivery Apps (Zomato, Swiggy) | 🍳 **VaniCook (CookConnect)** |
| :--- | :--- | :--- | :--- |
| **Engagement Model** | 1:1 Private domestic hire | Restaurant delivery per order | **Spatial Multi-Household Pool (1:N)** |
| **Monthly Cost** | High (₹4,000 – ₹7,000 + agency cuts) | Very High (₹9,000 – ₹15,000/person) | **Affordable (₹1,400 – ₹1,800/family)** |
| **Food Quality** | Variable, unvetted | Commercial / Preservative-heavy | **Fresh, hygienic, home-cooked in your kitchen** |
| **Cook Earnings** | ₹14,000 – ₹18,000 (exhausting commute) | Delivery riders: ₹15,000 – ₹20,000 | **₹28,000 – ₹35,000 (localized within 1 society)** |
| **Daily Transit** | 3–4 hours in buses / shared autos | Constant road riding | **0 hours (Elevator ride between floors)** |
| **Accessibility** | English web forms & paper agencies | Touch-only mobile app | **Multilingual Voice AI (Hindi, Marathi, Kannada, English)** |
| **Safety & Trust** | Paper register with society guard | N/A | **Police verified + RWA Admin oversight + Resident reviews** |

---

## 🏢 The Neighbourhood Cook Pool Innovation

```
                     TRADITIONAL MODEL                                              VANICOOK POOL MODEL
           (3 Cooks Travel Across City to Same Tower)                       (1 Dedicated Cook Serves Contiguous Flats)

     Cook A (Indiranagar) ──► Flat 701 (Pays ₹3,500)                                       Flat 701 (Pays ₹1,575) ──┐
     Cook B (Koramangala) ──► Flat 704 (Pays ₹3,500)                 Tower B Elevator ──►  Flat 704 (Pays ₹1,575) ──┼──► 1 Cook Earns ₹4,725!
     Cook C (Whitefield)  ──► Flat 802 (Pays ₹3,500)                                       Flat 802 (Pays ₹1,575) ──┘   (Zero Travel Fatigue)
   (3-4 Hours in Traffic • High Fuel Costs • Exhaustion)                                (Sequential Kitchen Routes • Fresh Hot Rotis)
```

### The Tiered Cost-Sharing Formula
Implemented in `src/backend/services/pricing.service.js`:
- **1 Household (Solo Hire):** Base Rate = **₹3,500/month** (Customer pays full rate; Cook earns ₹3,500)
- **2 Households Shared:** Rate per household = **₹2,100/month** (**40% Savings**; Cook earns ₹4,200)
- **3 Households Shared:** Rate per household = **₹1,575/month** (**55% Savings**; Cook earns ₹4,725)
- **4 Households Shared:** Rate per household = **₹1,400/month** (**60% Savings**; Cook earns ₹5,600)
- Across 3 daily shifts (Breakfast, Lunch, Dinner), the cook earns **₹28,000 to ₹35,000 monthly**.

---

## 🎙️ Gnani AI Voice Architecture

<div align="center">
  <img src="./screenshots/09_voice_assistant_modal.png" alt="Vani Voice Assistant Modal" width="70%" style="border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.2);" />
</div>

<br />

VaniCook integrates **Gnani AI** as its foundational speech intelligence layer, bridging the digital literacy gap for domestic workers:

```
[1. Browser Microphone]
   └── Native 16kHz Linear PCM Audio (via WavRecorder Web Audio API)
   └── Encoded into standard RIFF WAVE Blob & Base64 stream
           │
           ▼
[2. Express Controller Sanitization]
   └── extractAudioBuffer() removes data URL prefixes & verifies RIFF magic bytes
           │
           ▼
[3. Gnani Prisma STT (ASR)]
   └── Endpoint: https://api.vachana.ai/stt/v3
   └── Model: prisma-v3.0 (Multipart/form-data)
   └── Detects Language: Hindi (hi-IN), Marathi (mr-IN), Kannada (kn-IN), English (en-IN)
           │
           ▼
[4. VaniCook Intent Orchestrator]
   └── Extracts Intent (FIND_COOKS, CREATE_GROUP_REQUEST, CALCULATE_PRICING)
   └── Extracts Entities (Meal Type: Lunch, Households: 3, Cook: Sunita Devi)
   └── Safety State Machine: CONFIRMATION_REQUIRED
           │
           ▼
[5. Voice Confirmation Safety Gate]
   └── UI displays interactive Amber Safety Banner before committing financial bookings
           │
           ▼
[6. Gnani Timbre TTS (Speech Synthesis)]
   └── Endpoint: https://api.vachana.ai/api/v1/tts/inference
   └── Model: timbre-v2.5 (JSON payload)
   └── Regional Voices: 'Nalini' (Hindi), 'Meera' (Marathi), 'Arvind' (English)
   └── Client audio element plays natural spoken response
```

### Supported Indic Languages in Production:
| Language | Code | Voice Model | Example Spoken Utterance |
| :--- | :---: | :---: | :--- |
| **हिन्दी (Hindi)** | `hi-IN` | `Nalini` | *"सुनीता देवी को लंच के लिए बुक करो"* |
| **मराठी (Marathi)** | `mr-IN` | `Meera` | *"आमच्या सोसायटीमध्ये 3 फॅमिलीसाठी व्हेज कूक शोध"* |
| **English (India)** | `en-IN` | `Arvind` | *"Show forming pools in Prestige Falcon City"* |
| **ಕನ್ನಡ (Kannada)** | `kn-IN` | Native | *"ನಮ್ಮ ಅಪಾರ್ಟ್ಮೆಂಟ್ನಲ್ಲಿ ಅಡುಗೆಯವರನ್ನು ಹುಡುಕಿ"* |
| **Hinglish (Auto)** | `indic-auto` | Adaptive | *"Prestige me 2 families ke sath lunch pool banana hai"* |

---

## 📸 Application Walkthrough & Visual Gallery

### 1. The Public Experience & Society Context
<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="./screenshots/01b_landing_features.png" alt="Value Pillars & Features" />
        <p align="center"><em>Value Pillars: Group Pools, 45% Savings & Voice AI</em></p>
      </td>
      <td width="50%">
        <img src="./screenshots/02_login_screen.png" alt="Split Screen Login" />
        <p align="center"><em>Split-Screen Login with One-Click Demo Autofill</em></p>
      </td>
    </tr>
  </table>
</div>

### 2. Cook Discovery & Booking Workflow
<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="./screenshots/04_cook_discovery_and_search.png" alt="Cook Discovery & Filters" />
        <p align="center"><em>Multi-Facet Cook Discovery (Cuisine, Rating & Diet)</em></p>
      </td>
      <td width="50%">
        <img src="./screenshots/05_cook_profile_detail.png" alt="Cook Profile Detail" />
        <p align="center"><em>Verified Cook Profile, Resident Reviews & Visiting Slots</em></p>
      </td>
    </tr>
    <tr>
      <td width="50%">
        <img src="./screenshots/06_booking_workflow.png" alt="Booking Workflow Modal" />
        <p align="center"><em>Interactive Booking: Shared Pool Toggle & Price Calculation</em></p>
      </td>
      <td width="50%">
        <img src="./screenshots/11_customer_bookings.png" alt="Customer Bookings Management" />
        <p align="center"><em>Active Subscriptions, Cooking Schedules & Cook Contacts</em></p>
      </td>
    </tr>
  </table>
</div>

### 3. The Neighbourhood Cook Pool Marketplace
<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="./screenshots/07_neighbourhood_pools_market.png" alt="Neighbourhood Pools Marketplace" />
        <p align="center"><em>Active Forming Pools with Live Capacity & Neighbour Avatars</em></p>
      </td>
      <td width="50%">
        <img src="./screenshots/08_pool_details_cost_sharing.png" alt="Tiered Cost-Sharing Calculator" />
        <p align="center"><em>Tiered Cost Calculator: ₹3,500 down to ₹1,575 as neighbours join</em></p>
      </td>
    </tr>
  </table>
</div>

### 4. Gnani AI Voice Interaction & Safety Gate
<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="./screenshots/09_voice_assistant_modal.png" alt="Voice Assistant Modal" />
        <p align="center"><em>Vani Multilingual Voice Assistant with 16kHz PCM Engine</em></p>
      </td>
      <td width="50%">
        <img src="./screenshots/10_voice_interaction_flow.png" alt="Voice Confirmation Safety Gate" />
        <p align="center"><em>Voice Transcript & Amber Safety Confirmation Gate</em></p>
      </td>
    </tr>
  </table>
</div>

### 5. Cook Livelihood Hub & Administrator Governance
<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="./screenshots/12_cook_dashboard.png" alt="Cook Dashboard" />
        <p align="center"><em>Cook Route Schedule across Tower B & ₹28,500 Earnings</em></p>
      </td>
      <td width="50%">
        <img src="./screenshots/13_cook_availability_schedule.png" alt="Cook Availability Manager" />
        <p align="center"><em>Cook Availability Manager across Weekly Shifts</em></p>
      </td>
    </tr>
    <tr>
      <td width="50%">
        <img src="./screenshots/14_cook_profile_management.png" alt="Cook Profile Management" />
        <p align="center"><em>Cook Profile Management & Dietary Checkboxes</em></p>
      </td>
      <td width="50%">
        <img src="./screenshots/15_admin_dashboard.png" alt="Admin Command Center" />
        <p align="center"><em>Admin Command Center: Platform KPIs & Verification Queue</em></p>
      </td>
    </tr>
  </table>
</div>

---

## 🛠️ System Architecture & Technology Stack

VaniCook is engineered inside a **single-root unified monorepo** following strict MVC architecture:

```
CookConnect/
├── prisma/
│   └── schema.prisma             # PostgreSQL schema (11 relational models)
├── public/                       # Static public assets
├── screenshots/                  # 16 High-Resolution 1920x1080 UI Captures
├── src/
│   ├── backend/                  # Node.js & Express MVC Backend
│   │   ├── config/               # Database, Seed & Environment configs
│   │   ├── controllers/          # Voice, Cook, Group, Booking, Admin, Auth
│   │   ├── middleware/           # JWT verification, Role Guard, Zod validation
│   │   ├── routes/               # REST API endpoints
│   │   ├── services/             # Orchestrator, Pricing, Scheduling, Admin
│   │   │   └── gnani/            # Prisma STT, Timbre TTS & Voice Orchestrator
│   │   ├── sockets/              # Socket.IO room broadcasters
│   │   └── server.js             # Express & HTTP server entrypoint
│   └── frontend/                 # React 19 + Vite 6 Client Application
│       ├── components/           # Common UI, Navigation, Modals, Voice
│       ├── context/              # AuthContext & Session management
│       ├── pages/                # Customer, Cook, Admin, Landing, Auth
│       ├── services/             # Axios API services & WebSockets
│       ├── utils/                # wavRecorder.js (16kHz PCM) & formatters
│       ├── App.jsx               # Application root
│       └── main.jsx              # DOM bootstrap
├── video-research/               # Complete Hackathon research & video scripts
├── nodemon.json                  # Restricts reload to src/backend, ignores .db
└── package.json                  # Root dependencies & concurrent dev runner
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** `>= 20.0.0`
- **PostgreSQL 18** running locally or in cloud
- **Git**

### 2. Installation & Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/vinit-developer/Cookconnect.git
cd Cookconnect
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/CookCon"

# Authentication
JWT_SECRET="cookconnect_jwt_super_secret_phase1_key_2026_xyz987"
JWT_EXPIRES_IN="7d"

# Gnani AI Enterprise API Key
GNANI_API_KEY="YOUR_GNANI_VACHANA_API_KEY"
```

### 4. Database Setup & Seeding
Push the Prisma schema and seed test demonstration data:
```bash
npx prisma db push
npm run db:seed
```

### 5. Launch Application
Start both the Express backend and the Vite client concurrently:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 One-Click Demo Credentials

The login page ([`/login`](http://localhost:5173/login)) includes **one-click autofill buttons** for all three roles:

| Role | Name | Email Address | Password | Assigned Society |
| :--- | :--- | :--- | :--- | :--- |
| 👤 **Customer** | Priya Sharma | `priya.sharma@example.com` | `Customer#123` | Prestige Falcon City (Tower B, Flat 704) |
| 🍳 **Cook** | Sunita Devi | `sunita.devi@cookconnect.in` | `CookPass#123` | Prestige Falcon City (Verified Partner) |
| 🛡️ **Admin** | System Administrator | `admin@cookconnect.in` | `CookAdmin#2026` | Platform-wide Oversight |

---

## 🌍 Social & Economic Impact

1. **Dignity & Livelihood for Domestic Cooks:**
   Transforms domestic cooks from transit-exhausted gig workers into thriving micro-entrepreneurs. Cooks save **₹1,500–₹2,500 monthly** on transit fares, regain **3+ hours daily**, and boost their income to **₹28,500+**.
2. **Affordable Nutrition for Urban Families:**
   Enables working couples, students, and senior citizens to enjoy freshly cooked, nutritious, customized meals for less than the cost of one food delivery order per week.
3. **Digital Language Inclusion:**
   By powering natural voice interaction in native Indian languages with **Gnani AI**, VaniCook dismantles the digital divide for domestic workers across India.

---

<div align="center">
  <p><strong>VaniCook • Built with ❤️ for the Gnani AI Multilingual Hackathon 2026</strong></p>
  <p><em>One Cook. Multiple Households. Better Lives.</em></p>
</div>
