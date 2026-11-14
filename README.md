<div align="center">VaniCook
One Cook. Many Homes. One Connected Neighbourhood.
An AI-powered neighbourhood cooking platform that connects households with trusted cooks — making everyday meals more affordable and helping independent cooks earn better.





Discover cooks · Share cooking costs · Build stronger communities
</div>About VaniCook
VaniCook is an AI-powered, location-based cooking marketplace designed for Indian residential communities. It connects households with independent, verified cooks and introduces a neighbourhood-sharing model: multiple nearby families can share the services of one cook.

Instead of every household independently hiring a cook, VaniCook helps residents coordinate meal requirements and share cooking arrangements. This can reduce household cooking expenses by an estimated 40–60%, while helping cooks serve more households and improve their hourly earnings.
The problem we're solving
- For households: Finding reliable cooks, managing monthly costs and coordinating meal requirements can be difficult.
- For independent cooks: Limited local discovery and one-household arrangements can restrict earning potential.
- For residential communities: Neighbours often have similar cooking needs but lack a trusted way to coordinate shared arrangements.
The VaniCook approach
1. Discover cooks available in your residential society.
2. Compare cuisines, specialities, ratings, availability and pricing.
3. Book a cook individually or explore a shared neighbourhood arrangement.
4. Coordinate meal preferences and household requirements.
5. Build a more affordable and sustainable local cooking network.
Core concept
<div align="center">Traditional arrangement	VaniCook shared arrangement
One household hires one cook	Nearby households can share one cook
Separate household expenses	Cooking costs can be shared
Limited local discovery	Society-based cook discovery
Independent coordination	A common booking platform


</div>Illustrative savings: Shared pricing is designed around household participation. Actual savings depend on the cook, meal slots, number of households and agreed requirements.

Product highlights
Feature	Description
Society-based discovery	Find cooks serving your residential society and nearby communities.
Cook profiles	Explore experience, cuisines, specialities, ratings and pricing.
Shared cooking model	Support individual bookings and multi-household cooking arrangements.
Availability management	Cooks manage weekly availability across breakfast, lunch and dinner.
Household preferences	Capture dietary practices, spice levels, family size and special instructions.
Role-based dashboards	Dedicated experiences for customers, cooks and administrators.
Reviews and ratings	Let customers share feedback after completed bookings.
Voice assistant foundation	A conversational voice interface designed for future multilingual speech integration.
Neighbourhood pooling foundation	Data structures and preview functionality for future automated group matching.


Technology stack
<div align="center">Layer	Technologies
Frontend	React, Vite, Tailwind CSS
Backend	Node.js, Express.js
Database	PostgreSQL
ORM	Prisma
Authentication	JWT, bcrypt, HTTP-only cookies
Validation	Zod
Real-time foundation	Socket.IO
UI motion	Motion for React
API communication	Axios
Development	Git, GitHub, npm


</div>Architecture
VaniCook follows a single-root unified architecture. The React frontend and Node.js/Express backend are maintained inside one project, with dependencies managed through the root package.json.
VaniCook/
├── public/
│   └── assets/
│       └── favicon.svg
│
├── src/
│   ├── frontend/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── animations/
│   │   │   └── voice/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── cook/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── backend/
│       ├── config/
│       │   ├── database.js
│       │   ├── env.js
│       │   └── seed.js
│       ├── models/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middleware/
│       ├── validators/
│       ├── sockets/
│       ├── utils/
│       ├── app.js
│       └── server.js
│
├── prisma/
│   └── schema.prisma
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── test_phase1.js
Backend structure
The backend is organised into clear responsibility layers:
- Config: Database connection, environment configuration and seed data.
- Models: Prisma-based data access and persistence.
- Controllers: HTTP request handling and response formatting.
- Services: Application logic, booking workflows and shared-pricing calculations.
- Routes: REST API endpoint definitions.
- Middleware: Authentication, role authorisation, validation and error handling.
- Validators: Zod request schemas.
- Sockets: Foundation for future real-time communication.
Brand identity
VaniCook uses a warm, premium food-tech visual language inspired by freshness, trust and the feeling of home-cooked meals.
Brand token	Colour	Usage
Forest Green	#174D38	Primary brand, headers and calls to action
Fresh Green	#8BCF83	Accents, savings highlights and success states
Warm Cream	#FAF8F1	Main background and warm surfaces
Charcoal	#202923	Primary text and strong contrast
Muted Sage	#E7EFE5	Soft surfaces, borders and supporting elements


Typography
- Outfit — display headings.
- Plus Jakarta Sans — body text and interface content.
Interaction design
- Smooth entrance and hover animations using Motion for React.
- Responsive layouts for different screen sizes.
- Accessibility support for prefers-reduced-motion.
Database design
VaniCook uses PostgreSQL with Prisma ORM.
Model	Responsibility
User	Identity, account roles (CUSTOMER, COOK, ADMIN) and authentication data.
CookProfile	Cook experience, specialities, cuisines, dietary practices, capacity, pricing and ratings.
Society	Residential society, locality, city, postal code and geographic coordinates.
CookSociety	Many-to-many relationship between cooks and societies they serve.
HouseholdLocation	Household flat and tower information within a society.
CookAvailability	Weekly availability across breakfast, lunch and dinner.
Booking	Customer-cook subscriptions, meal slots, dates, monthly rates and shared ratios.
BookingRequirement	Dietary preferences, spice levels, family size and special instructions.
Review	Customer ratings and feedback.
GroupRequest	Foundation for neighbourhood cook-pooling requests.
GroupMember	Households participating in a shared group.
Notification	Notification data structure.
VoiceSession	Conversational session foundation for future speech integration.


Shared pricing model
The booking architecture supports different household participation ratios:
Arrangement	Shared ratio
Individual household	1.00
Two-household pool	0.55
Three-household pool	0.40


These ratios represent the configured pricing model and should be interpreted alongside the actual cook rate and booking terms.
REST API reference
All API responses follow a unified response envelope:
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {}
}
Authentication — /api/auth
Method	Endpoint	Purpose
POST	/api/auth/register	Register a customer or cook partner.
POST	/api/auth/login	Authenticate and issue a JWT session.
GET	/api/auth/me	Retrieve the authenticated user's profile.
POST	/api/auth/logout	Clear the session cookie.


Cook discovery — /api/cooks
Method	Endpoint	Purpose
GET	/api/cooks/discover	Discover and filter cooks by society, cuisine, diet, meal type, rating and price.
GET	/api/cooks/:id	Retrieve cook details, schedule and reviews.
GET	/api/cooks/me	Retrieve the cook's own profile.
PUT	/api/cooks/me	Update cook profile, rates and specialities.
GET	/api/cooks/pool-preview/:societyId	Preview neighbourhood pools in a society.


Availability — /api/availability
Method	Endpoint	Purpose
GET	/api/availability/cook/:cookProfileId	View a cook's availability.
GET	/api/availability/me	View the authenticated cook's schedule.
POST	/api/availability	Add an availability slot.
PUT	/api/availability/:id	Update or toggle an availability slot.
DELETE	/api/availability/:id	Remove an availability slot.


Locations and societies — /api/locations
Method	Endpoint	Purpose
GET	/api/locations/societies	List residential societies and cook counts.
GET	/api/locations/societies/:id	Retrieve society details.
POST	/api/locations/societies	Add a society (Admin).
GET	/api/locations/my-locations	View registered household locations.
POST	/api/locations/my-locations	Associate a household flat with a society.


Bookings and reviews — /api/bookings
Method	Endpoint	Purpose
POST	/api/bookings	Create an individual or shared booking request.
GET	/api/bookings/customer	View customer subscriptions.
GET	/api/bookings/cook	View incoming requests and active households.
PATCH	/api/bookings/:id/status	Accept, cancel or complete a booking.
POST	/api/bookings/reviews	Submit a customer review.


User and administration — /api/users
Method	Endpoint	Purpose
GET	/api/users/profile	Retrieve the current profile.
PUT	/api/users/profile	Update the current profile.
GET	/api/users/admin/stats	Retrieve platform metrics (Admin).


Demo accounts
The Phase 1 seed data includes demonstration accounts for customer, cook and administrator workflows.
Role	Demo account
Customer	priya.sharma@example.com
Customer	rohit.verma@example.com
Cook	sunita.devi@cookconnect.in
Cook	ramesh.nair@cookconnect.in
Cook	anita.joshi@cookconnect.in
Admin	admin@cookconnect.in


Demo accounts and passwords are intended for local development only. Check src/backend/config/seed.js for the current seeded credentials. Never use demo credentials in production.

Getting started
Prerequisites
- Node.js v18 or later.
- PostgreSQL 14 or later.
- npm.
- Git.
1. Clone the repository
git clone https://github.com/Vinit-1205/VaniCook.git
cd VaniCook
2. Install dependencies
npm install
3. Configure environment variables
Create a local .env file using .env.example as a template.
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/vanicook_db?schema=public"

JWT_SECRET="replace_with_a_long_random_secret"
JWT_EXPIRES_IN="7d"
Update the database URL and credentials to match your local PostgreSQL setup. Use a unique, securely generated JWT secret.
4. Initialise the database
npm run db:migrate
npm run db:seed
5. Start the development server
npm run dev
Service	Local URL
Frontend	http://localhost:5173
Backend API	http://localhost:5000/api


6. Build for production
npm run build
npm start
7. Run the verification suite
node test_phase1.js
Phase 1 verification
The supplied Phase 1 documentation reports a 27-point automated verification suite with 100% success.

The documented checks include:
- Backend health check.
- Cook discovery and pricing calculations.
- Cuisine and dietary filtering.
- Residential society directory.
- Customer, cook and admin authentication.
- Role-based authorisation.
- Customer registration with society and flat association.
- Shared-pool booking and discount calculation.
- Cook booking acceptance and status activation.
- Review submission and rating recalculation.
- Cook availability creation and removal.
- Admin analytics.
- Neighbourhood pool preview.
The results above reflect the supplied Phase 1 project report. Run node test_phase1.js against your current checkout to verify the current codebase.
Roadmap
Phase 1 — Foundation and marketplace
<details>
<summary><strong>Completed scope documented for Phase 1</strong></summary>- Unified frontend and backend project architecture.
- PostgreSQL database with Prisma ORM.
- JWT authentication, bcrypt password hashing and role authorisation.
- Zod request validation.
- Food-tech design system and motion animations.
- Landing page with shared-pricing calculator.
- Customer dashboard with cook discovery, filtering and booking.
- Cook dashboard with profile and availability management.
- Admin dashboard with platform analytics.
- Voice assistant conversational UI preview.
- Neighbourhood pool preview foundation.
</details>Phase 2 — Intelligent neighbourhood coordination
- Gnani AI multilingual Speech-to-Text and Text-to-Speech integration.
- Neighbourhood group-matching algorithms.
- Automated residential tower and society pool formation.
- Real-time Socket.IO chat.
- Cook arrival notifications.
- Dynamic group cost-sharing contracts.
Phase 3 — Payments and ecosystem integrations
- Online payments and escrow-style billing through UPI / Razorpay.
- Residential society gate-pass integrations (MyGate / NoBrokerHood webhooks).
- Advanced cook route optimisation across residential complexes.
Security notes
- Keep .env out of version control.
- Use .env.example only for placeholder configuration.
- Generate a strong, unique JWT secret for each environment.
- Never commit API keys, database passwords or production credentials.
- Keep seeded demo accounts restricted to local development.
- Validate and authorise sensitive operations on the backend.
Contributing
Contributions, suggestions and issue reports are welcome.
1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them locally.
4. Commit with a descriptive message.
5. Open a pull request describing the changes.
Project information
	
Project	VaniCook
Category	AI-powered FoodTech
Initial release scope	Phase 1 — Foundation
Primary market	Indian residential communities
Repository	Vinit-1205/VaniCook


<div align="center">VaniCook
Bringing neighbourhoods together, one meal at a time.

Discover local cooks. Share the cost. Make home cooking easier.
</div>
