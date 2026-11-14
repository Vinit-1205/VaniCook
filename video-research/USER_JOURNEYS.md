# User Journeys & End-to-End Workflows: CookConnect (VaniCook)

This document maps the exact step-by-step user workflows implemented in the CookConnect application across all three user roles (Customer, Cook, and Admin) and the Vani Voice AI workflow.

---

## Journey 1: Customer Discovering & Booking a Dedicated Cook

**Persona:** Priya Sharma (Resident of Tower B, Flat 704, Prestige Falcon City)  
**Goal:** Hire a verified cook for North Indian vegetarian meals.

```
[1. Login / Access]
  Navigate to /login ──► Click Autofill (Priya Sharma) ──► Authenticate with JWT

[2. Society Context]
  Redirected to /customer/dashboard
  ├── Dashboard automatically establishes context: "Prestige Falcon City, Bangalore"
  └── Shows active society statistics: 3 Verified Cooks, 2 Forming Pools

[3. Cook Discovery & Filtering]
  Scroll to "Verified Neighbourhood Cooks"
  ├── Filter by Cuisine: "North Indian"
  ├── Filter by Diet: "Pure Vegetarian"
  └── Result: Sunita Devi (Rating: 4.9 ★, 8 Years Exp, Specialties: Phulka, Dal Tadka)

[4. Profile Inspection]
  Click "View Profile" / "Book Cook"
  └── CookDetailsModal opens
      ├── Displays background verification badge & resident reviews
      ├── Shows sequential visiting slots (Breakfast 7-9 AM, Lunch 11:30 AM-1:30 PM, Dinner 6:30-8:30 PM)
      └── Displays price comparison: Solo ₹3,600/mo vs. Shared Pool ₹1,980/mo

[5. Booking Customization & Submission]
  Within CookDetailsModal:
  ├── Select Meal Type: "LUNCH"
  ├── Select Model: "Share with neighbours in society" (Shared Pool)
  ├── Specify Household Size: 2 Persons
  ├── Dietary Preferences: "Pure Vegetarian", Spice Level: "Medium"
  └── Click "Submit Booking Request"
      └── PostgreSQL persists new Booking record with status 'PENDING'
      └── Toast notification displays confirmation
```
**Relevant Screenshots:** `02_login_screen.png`, `03_customer_dashboard.png`, `04_cook_discovery_and_search.png`, `05_cook_profile_detail.png`, `06_booking_workflow.png`

---

## Journey 2: Multiple Households Forming a Neighbourhood Cook Pool

**Persona:** Multiple neighbours in Tower B (Prestige Falcon City)  
**Goal:** Share one cook across adjacent flats to cut monthly cooking expenses by 55%.

```
[1. Marketplace Discovery]
  Navigate to /customer/pools (Neighbourhood Pools Marketplace)
  ├── Filter by Society: "Prestige Falcon City"
  └── View forming pools: "11:30 AM Lunch Pool" (2/3 Households Joined)

[2. Cost-Sharing Evaluation]
  Click "View Details" on the pool card
  ├── System renders dynamic tiered pricing breakdown:
  │     1 Household: ₹3,500/mo (Full solo price)
  │     2 Households: ₹2,100/mo (40% savings)
  │     3 Households: ₹1,575/mo (55% savings - Target reached!)
  └── Shows existing members: Flat 701 (Kavita) and Flat 704 (Priya)

[3. Joining the Pool]
  Click "Join Neighbourhood Pool"
  ├── System links user's primary flat number (Flat 802) to the group
  ├── PostgreSQL creates GroupMember record via GroupService.joinGroupRequest()
  ├── Pool household count updates from 2/3 to 3/3 (Status shifts to 'MATCHING')
  └── WebSocket emits event to all residents in Prestige Falcon City

[4. Cook Matching & Confirmation]
  Cook receives pool request in their Cook Hub
  └── Once accepted, status updates to 'CONFIRMED'
```
**Relevant Screenshots:** `07_neighbourhood_pools_market.png`, `08_pool_details_cost_sharing.png`

---

## Journey 3: The Domestic Cook's Daily Schedule & Livelihood Hub

**Persona:** Sunita Devi (Verified Cook Partner, Prestige Falcon City)  
**Goal:** Manage multi-household visiting route, review monthly earnings, and adjust capacity.

```
[1. Cook Login]
  Navigate to /login ──► Click Autofill (Sunita Devi) ──► Authenticate as COOK

[2. Cook Hub Dashboard (/cook/dashboard)]
  Cook views today's optimized sequential schedule:
  ├── Shift 1 (07:00 AM – 08:30 AM): Tower B, Flat 701 (Kavita)
  ├── Shift 2 (11:30 AM – 01:00 PM): Tower B, Flat 704 (Priya)
  └── Shift 3 (06:30 PM – 08:00 PM): Tower B, Flat 802 (Ananya)
  ├── Active Monthly Earnings Summary: ₹28,500 across 4 households
  └── Incoming Request Queue: 1 pending neighbourhood pool awaiting approval

[3. Availability & Capacity Manager (/cook/availability)]
  Cook adjusts work schedule:
  ├── Toggles days of the week (Monday through Saturday)
  ├── Sets max household capacity limit (e.g. 4 homes) to prevent burnout
  └── Database updates CookAvailability table

[4. Profile & Culinary Specialties (/cook/profile)]
  Cook updates regional cuisines (North Indian, Punjabi), bio, and verified society badges
```
**Relevant Screenshots:** `12_cook_dashboard.png`, `13_cook_availability_schedule.png`, `14_cook_profile_management.png`

---

## Journey 4: Multilingual Voice AI Interaction (Vani AI)

**Persona:** Domestic Cook or Regional Resident (Hindi Speaker)  
**Goal:** Book a cook verbally without typing or navigating menus.

```
[1. Activate Assistant]
  User taps central "Meet Vani Voice" microphone orb
  └── VoiceAssistantModal opens with animated soundwave visual

[2. Language Selection & Speech Capture]
  User selects language pill: "हिन्दी (Hindi)"
  ├── User speaks: "Mujhe Sunita Devi ko dinner ke liye book karna hai"
  ├── Browser captures 16kHz linear PCM WAV audio
  └── Transmits Base64 audio buffer to POST /api/voice/command

[3. Gnani Prisma STT & Orchestration]
  Backend sends audio to Gnani Prisma STT (prisma-v3.0)
  ├── Transcribed Output: "मुझे सुनीता देवी को डिनर के लिए बुक करना है"
  ├── Intent Extracted: CREATE_GROUP_REQUEST / BOOK_COOK
  └── Entities: { cook: "Sunita Devi", mealType: "DINNER", households: 3 }

[4. Safety Confirmation Gate]
  Voice state transitions to CONFIRMATION_REQUIRED
  ├── Amber banner displays: "Action Confirmation Required - Safety Gate"
  ├── Spoken prompt via Gnani Timbre: "Prestige Falcon City mein Sunita Devi ke saath Dinner pool schedule karna chahte hain?"
  └── User reviews staged details and clicks "Confirm Action"

[5. Database Execution & Verbal Closure]
  System commits booking to PostgreSQL
  └── Gnani Timbre synthesizes verbal confirmation:
      "Aapka request safalta-poorvak darj kar liya gaya hai."
```
**Relevant Screenshots:** `09_voice_assistant_modal.png`, `10_voice_interaction_flow.png`

