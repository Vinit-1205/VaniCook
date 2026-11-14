# Project Overview: CookConnect (VaniCook)

**Platform:** CookConnect (Branded in Frontend as *VaniCook*)  
**Submission:** Gnani AI Multilingual Hackathon 2026  
**Core Tagline:** *"One Cook. Multiple Households. Affordable Cooking. Better Earnings. Powered by Voice AI."*  
**Repository Architecture:** Unified Single-Root Full-Stack MVC Monorepo (Node.js/Express + React 19/Vite + PostgreSQL/Prisma)

---

## 1. Executive Summary

**CookConnect** is an AI-powered, location-centric neighbourhood cook-sharing platform engineered specifically for Indian high-density residential societies and gated apartment communities. 

While traditional domestic help platforms treat cook hiring as a purely transactional, single-household private engagement (resulting in high monthly costs of ₹3,500–₹5,000 for families and fragmented, transit-heavy workdays for domestic cooks), CookConnect introduces the **Neighbourhood Cook Pool**. In this pooled model, 2 to 4 adjacent households within the same apartment wing or residential society share a single dedicated, verified home cook who prepares sequential, freshly cooked meals on-site.

This co-sharing architecture reduces monthly cooking costs for urban households by **45% to 50%** (bringing the cost down to ~₹1,400–₹1,800/month or ~₹45/meal) while simultaneously boosting cook monthly earnings by **+65% to +80%** (₹28,000–₹35,000/month) and eliminating cross-city transit fatigue.

Integrated into the heart of the platform is **Vani AI**, a voice-first conversational interface powered by **Gnani AI Prisma Speech-to-Text (STT)** and **Gnani Timbre Text-to-Speech (TTS)**. Vani enables non-tech-savvy domestic cooks, senior residents, and busy working professionals to discover cooks, form cooking pools, check schedules, and execute bookings using natural multilingual spoken commands across **Hindi, Marathi, Kannada, English, and Hinglish**.

---

## 2. Key Information Matrix

| Attribute | Details |
| :--- | :--- |
| **Project Name** | CookConnect / VaniCook |
| **Target Sector** | Urban PropTech, Domestic Gig-Economy & AI Voice Automation |
| **Geographic Focus** | Indian Metro & Tier-1 Gated Communities (Bengaluru, Mumbai/Thane, NCR, Hyderabad, Pune) |
| **Primary Users** | 1. Urban Households (Working couples, bachelors, nuclear families, elderly residents)<br>2. Independent Domestic Cooks (Local home chefs, domestic workers)<br>3. Residential Society Administrators & RWAs |
| **Core Innovation** | Multi-household sequential cooking route optimization + Multilingual Voice AI action execution |
| **Voice AI Engine** | Gnani Prisma ASR (`prisma-v3.0`) + Gnani Timbre TTS (`timbre-v2.5`) |
| **Frontend Stack** | React 19, Vite 6, Tailwind CSS 3, Motion for React, Lucide React, Axios |
| **Backend Stack** | Node.js (ES Modules), Express.js MVC, Socket.IO, JWT, bcryptjs, Zod |
| **Database & ORM** | PostgreSQL 18, Prisma ORM 6.4, PostGIS-ready coordinate schemas |

---

## 3. The Core Problem We Solve

1. **For Urban Households:**
   - **Cost Prohibitive:** Hiring a private cook costs ₹3,500 to ₹5,000 per month for a single family. For young couples and students, this is often unaffordable, forcing reliance on unhealthy, expensive food delivery apps (Zomato/Swiggy).
   - **Coordination Headaches:** Finding reliable, background-verified domestic help depends on word-of-mouth guard registry books or unvetted local classifieds.
   - **Language Barriers:** Communicating dietary nuances (e.g., pure Jain, low-oil sabzi, Marathi phulka style) often suffers from miscommunication.

2. **For Domestic Cooks:**
   - **Low Income & High Attrition:** Cooks must travel between 5–7 distant houses scattered across different localities to earn a living wage (₹15,000–₹20,000), spending 3 to 4 hours daily in traffic and public transit.
   - **Digital Exclusion:** Most domestic cooks in India are semi-literate or uncomfortable with complex smartphone application forms and English interfaces.
   - **Unpredictable Earnings:** Sudden customer cancellations or leaves leave cooks without financial security.

---

## 4. The CookConnect Solution

### The Neighbourhood Cook Pool
Instead of dispatching one cook to one household across town:
- CookConnect clusters households by **Residential Society, Tower, and Floor**.
- Compatible families (sharing dietary preferences, e.g., North Indian Pure Veg, Jain, or Homestyle Marathi) join a single **Cook Pool**.
- The cook arrives at the society and prepares sequential meals across contiguous flats (e.g., Flat 701, Flat 704, and Flat 802 in Tower B).
- **The Result:** 
  - Each family pays only a fraction of the base rate (~₹1,400–₹1,800/mo).
  - The cook spends zero transit time between kitchens and earns **₹28,000+** monthly from just 2 to 3 adjacent societies.

### Voice-First Multilingual Interaction (Vani AI)
Rather than forcing users through complicated booking filters:
- Domestic cooks and residents tap a central microphone and speak naturally in their native tongue:
  - *"Sunita Devi ko sham ke dinner ke liye book kar do"* (Hindi)
  - *"Amchya society madhye don families sathi veg cook shodh"* (Marathi)
  - *"Show forming pools in Prestige Falcon City"* (English)
- CookConnect transcribes the speech with **Gnani Prisma STT**, executes intent and entity extraction, interacts with PostgreSQL via Prisma, and responds verbally using **Gnani Timbre TTS**.
- High-risk operations (such as creating a binding pool request) are governed by an interactive **Voice Confirmation Safety Gate**.

---

## 5. Product Uniqueness & Market Differentiation

| Feature Dimension | Traditional Cook Agencies (BookMyBai, Helpers Near Me) | Food Delivery Apps (Zomato, Swiggy) | **CookConnect (VaniCook)** |
| :--- | :--- | :--- | :--- |
| **Model** | 1:1 Private domestic hire | Restaurant delivery per meal | **Shared Neighbourhood Pooling (1:N)** |
| **Monthly Cost** | High (₹4,000 – ₹7,000 + agency commission) | Very High (₹9,000 – ₹15,000/person) | **Affordable (₹1,400 – ₹1,800/family)** |
| **Food Quality** | Fresh, home-cooked | Commercial restaurant / Cloud kitchen | **Customized, hygienic, home-cooked in your kitchen** |
| **Cook Earnings** | ₹14,000 – ₹18,000 (fragmented travel) | Delivery riders: ₹15,000 – ₹20,000 | **₹28,000 – ₹35,000 (localized within 1 society)** |
| **Accessibility** | English web portals / Phone agents | Touch-only mobile app | **Multilingual Voice AI (Hindi, Marathi, Kannada, English)** |
| **Safety & Verification** | Manual paper copies | N/A | **Aadhaar/Police verified badge + Resident RWA reviews** |

---

## 6. Social & Economic Impact

1. **Livelihood Dignity & Wealth Generation for Domestic Workers:**
   CookConnect transforms domestic workers into micro-entrepreneurs. By consolidating their workday into a single residential society, cooks save ₹1,500–₹2,500 monthly on bus/auto fares, gain 3 hours of daily personal time, and increase their net monthly income by over 65%.

2. **Democratization of Fresh, Healthy Home Food:**
   Young working professionals, students, and seniors who cannot afford a private cook gain daily access to nutritious, customized meals prepared right in their own kitchen for less than the cost of a single meal delivery order every week.

3. **Digital Inclusion via Gnani AI:**
   By replacing complex UI navigations with voice-driven conversational workflows in native Indic languages, CookConnect bridges the digital literacy divide for domestic workers across India.

