# Glidee Demo Flow

## 🚀 Setup

1. **Start the dev server:**

   ```bash
   pnpm dev
   ```

2. **Open the app:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📋 Demo Scenarios

### 1. Landing Page (Public)

**URL:** `/`

- [ ] View the landing page with hero, features, testimonials
- [ ] Notice the Login/Get Started buttons in navbar
- [ ] Scroll to see the features and "How it Works" sections

---

### 2. Parent Registration & Login Flow

#### Register a New Parent Account

**URL:** `/auth/register`

1. [ ] Click "Get Started" from landing page
2. [ ] Fill in registration form:
   - **Name:** `Demo Parent`
   - **Email:** `demo.parent@test.com`
   - **Password:** `password123`
   - **Role:** `Parent` (default)
3. [ ] Click "Create Account"
4. [ ] Should redirect to Parent Dashboard

#### Parent Dashboard

**URL:** `/dashboard`

- [ ] View welcome message with parent's name
- [ ] See "No students" prompt (since it's a new account)
- [ ] Notice the bottom tab navigation (Home, Book, Rides, Alerts, Profile)

#### Add a Student (via Profile)

**URL:** `/profile`

1. [ ] Click "Profile" tab in bottom nav
2. [ ] View profile with email and name from auth
3. [ ] See "My Children" section (empty for new accounts)
4. [ ] Click "Add" to add a student

#### Book a Ride

**URL:** `/book`

1. [ ] Click "Book" tab in bottom nav
2. [ ] Go through booking wizard:
   - Step 1: Select a child (need to add one first)
   - Step 2: Choose date & route
   - Step 3: Select pickup/dropoff stops
   - Step 4: Review and confirm
3. [ ] Submit booking

#### View Rides

**URL:** `/rides`

- [ ] See list of upcoming and past rides
- [ ] Click on a ride to view details

---

### 3. Driver Flow

#### Register/Login as Driver

**URL:** `/auth/register` or `/auth/login`

1. [ ] Register a new account:
   - **Name:** `Demo Driver`
   - **Email:** `demo.driver@test.com`
   - **Password:** `password123`
   - **Role:** Select `Driver`
2. [ ] Should redirect to Driver Dashboard

#### Driver Dashboard

**URL:** `/driver/dashboard`

- [ ] View today's schedule (will be empty without seeded data)
- [ ] See trip cards with pickup/dropoff info
- [ ] Notice "Start Trip" button on scheduled trips

#### Driver Trip Management

**URL:** `/driver/trip/:tripId`

- [ ] View active trip details
- [ ] See passenger list with board/drop status
- [ ] Update trip status (en-route, completed)
- [ ] Mark passengers as boarded/dropped

#### Report Incident

**URL:** `/driver/incidents`

- [ ] Fill incident report form
- [ ] Select incident type and severity
- [ ] Submit report

---

### 4. Admin Flow

#### Register/Login as Admin

**URL:** `/auth/register` or `/auth/login`

1. [ ] Register a new account:
   - **Name:** `Demo Admin`
   - **Email:** `demo.admin@test.com`
   - **Password:** `password123`
   - **Role:** Select `Admin`
2. [ ] Should redirect to Admin Dashboard

#### Admin Dashboard

**URL:** `/admin`

- [ ] View fleet overview stats (vehicles, drivers, etc.)
- [ ] See recent bookings table
- [ ] Notice sidebar navigation

#### Live Map

**URL:** `/admin/live-map`

- [ ] View map placeholder with active buses
- [ ] See bus list in sidebar with status
- [ ] View real-time stats footer

#### Manage Bookings

**URL:** `/admin/bookings`

- [ ] View all bookings with status filters
- [ ] Search bookings
- [ ] View booking details

#### Manage Routes

**URL:** `/admin/routes`

- [ ] View route list
- [ ] Click route to see stops and details
- [ ] View map of selected route

#### Manage Fleet

**URL:** `/admin/fleet`

- [ ] Toggle between Vehicles and Drivers tabs
- [ ] View vehicle status cards
- [ ] View driver assignments

---

## 🔑 Test Accounts

If you've run the seed script, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | <admin@glidee.com> | password123 |
| Driver | <driver@glidee.com> | password123 |
| Parent | <parent@glidee.com> | password123 |

**Note:** Seeded accounts may not work with better-auth password verification. For the demo, **register new accounts** as shown above.

---

## ⚠️ Known Limitations

1. **No seeded data:** Most dashboards will show empty states for fresh accounts
2. **Map placeholder:** Real map integration not implemented
3. **Notifications:** Using mock data (no backend endpoint)
4. **Real-time updates:** Not implemented yet

---

## ✨ Key Features to Highlight

### Authentication

- ✅ Email/password registration & login
- ✅ Role-based routing (parent → /dashboard, driver → /driver/dashboard, admin → /admin)
- ✅ Session persistence
- ✅ Sign out functionality

### Parent Features

- ✅ Dashboard with active trips and upcoming rides
- ✅ Booking wizard (multi-step form)
- ✅ Ride history and details
- ✅ Profile management

### Driver Features

- ✅ Daily schedule view
- ✅ Trip management (start/complete trips)
- ✅ Passenger tracking (board/drop students)
- ✅ Incident reporting

### Admin Features

- ✅ Fleet overview dashboard
- ✅ Live map view (placeholder)
- ✅ Booking management
- ✅ Route and stop management
- ✅ Vehicle and driver management

---

## 🎯 Quick Demo Path (5 minutes)

1. **Landing** → Show features and value prop
2. **Register** → Create parent account
3. **Dashboard** → Show empty state, explain what would appear
4. **Book** → Walk through booking wizard
5. **Sign out** → Show auth works
6. **Register as Admin** → Different role, different dashboard
7. **Admin Dashboard** → Show fleet management capabilities
8. **Live Map** → Show real-time tracking concept

---

## 🛠️ Troubleshooting

**Auth not working?**

- Check `/api/auth/get-session` returns `null` (not 404)
- Ensure dev server is running on port 3000

**Empty dashboards?**

- This is expected for fresh accounts
- Data comes from bookings, trips, routes created by users

**Styling issues?**

- Run `pnpm dev` to ensure Tailwind is processing
