# PostalDelivery

PostalDelivery is a full-stack parcel delivery demo app built with Express + EJS + SQLite.

Main parts:
- `app.js`: Express server, sessions, static assets, and route mounting.
- `Database/Database.js`: Shared SQLite connection + schema bootstrap.
- `Database/seed.js`: Seeds the admin account.
- `routes/*`: Route definitions.
- `controllers/*`: Request handlers.
- `models/*`: SQLite helpers (Customers/Parcels/Payments).

## Quick start

```bash
npm install
npm run seed
npm start
```

Open: `http://localhost:3000`

## Function Tags

These tags describe what each function/handler is responsible for.

- `[AUTH]` Authentication and access control.
- `[SESSION]` Session guards and helpers.
- `[CUSTOMER]` Customer account persistence.
- `[PARCEL]` Parcel creation, lookup, and lifecycle.
- `[PAYMENT]` Payment creation and status updates.
- `[TRACKING]` Tracking log / shipment lifecycle records.
- `[REPORT]` Admin reporting and statistics aggregation.
- `[FORMAT]` Derived values (shipping cost, IDs).
- `[DB]` SQLite data access helpers.
- `[SYSTEM]` App startup/runtime utilities.

## `app.js`

### Runtime/system

| Block | Tag | Description |
|---|---|---|
| `require('dotenv').config()` | `[SYSTEM]` | Loads environment variables from `.env`. |
| `require('./Database/Database')` | `[DB][SYSTEM]` | Initializes SQLite connection and schema. |
| `express-session` setup | `[SESSION]` | Enables login sessions with cookie settings. |
| `res.locals.session/currentPath` | `[SESSION]` | Exposes session and current path to EJS views. |
| Route mounting (`/`, `/parcels`, `/admin`) | `[SYSTEM]` | Mounts route modules. |
| `GET /__routes` | `[SYSTEM]` | Debug route to list registered paths. |
| `GET /` + `GET /dashboard` | `[AUTH][SESSION]` | Redirects users to the correct dashboard by role. |
| `app.listen(PORT)` | `[SYSTEM]` | Starts the HTTP server. |

## `routes/auth.js` + `controllers/authController.js`

### Controller functions

| Function | Tag | Description |
|---|---|---|
| `showRegister(req, res)` | `[AUTH]` | Renders the registration page. |
| `handleRegister(req, res)` | `[AUTH][CUSTOMER][DB][SESSION]` | Creates a customer, stores session, redirects to dashboard. |
| `showLogin(req, res)` | `[AUTH]` | Renders the login page. |
| `handleLogin(req, res)` | `[AUTH][CUSTOMER][DB][SESSION]` | Validates credentials, stores session, redirects by role. |
| `logout(req, res)` | `[AUTH][SESSION]` | Destroys the session and redirects to login. |

### Route handlers

| Route | Tag | Description |
|---|---|---|
| `GET /register` | `[AUTH]` | Register page. |
| `POST /register` | `[AUTH][CUSTOMER]` | Register submission. |
| `GET /login` | `[AUTH]` | Login page. |
| `POST /login` | `[AUTH]` | Login submission. |
| `GET /logout` | `[AUTH]` | Logout. |

## `routes/parcels.js` + `controllers/parcelController.js`

### Helper functions

| Function | Tag | Description |
|---|---|---|
| `calculateShippingCost(weight)` | `[FORMAT]` | Calculates shipping cost from weight. |
| `generateTrackingNumber()` | `[FORMAT]` | Generates a `PD-...` tracking number. |

### Controller functions

| Function | Tag | Description |
|---|---|---|
| `showCreate(req, res)` | `[PARCEL]` | Renders the create-parcel form. |
| `createParcel(req, res)` | `[PARCEL][DB]` | Creates a parcel and redirects to its detail view. |
| `dashboard(req, res)` | `[PARCEL][DB]` | Lists parcels for the logged-in customer. |
| `viewParcel(req, res)` | `[PARCEL][PAYMENT][DB]` | Shows parcel details + associated payment (if exists). |
| `cancelParcel(req, res)` | `[PARCEL][PAYMENT][DB]` | Lets a customer cancel their parcel (Pending/Paid). |
| `payments(req, res)` | `[PAYMENT][DB]` | Lists payments for the logged-in customer’s parcels. |

### Route handlers

| Route | Tag | Description |
|---|---|---|
| `GET /parcels/dashboard` | `[PARCEL][SESSION]` | Customer dashboard listing parcels. |
| `GET /parcels/create` | `[PARCEL][SESSION]` | Create parcel page (customer only). |
| `POST /parcels/create` | `[PARCEL][SESSION]` | Create parcel submission. |
| `GET /parcels/payments` | `[PAYMENT][SESSION]` | Customer payments list. |
| `GET /parcels/:id` | `[PARCEL][SESSION]` | Parcel detail page. |
| `POST /parcels/:id/cancel` | `[PARCEL][SESSION]` | Customer cancels their parcel. |

## `controllers/paymentController.js`

### Controller functions

| Function | Tag | Description |
|---|---|---|
| `showPayment(req, res)` | `[PAYMENT][SESSION]` | Renders payment methods + QR codes for a parcel. |
| `payParcel(req, res)` | `[PAYMENT][PARCEL][DB][SESSION]` | Records payment and updates parcel status. |

### Route handlers (mounted in `routes/parcels.js`)

| Route | Tag | Description |
|---|---|---|
| `GET /parcels/:id/pay` | `[PAYMENT][SESSION]` | Payment page for one parcel (owner only). |
| `POST /parcels/:id/pay` | `[PAYMENT][SESSION]` | Payment submission for one parcel. |

## `routes/admin.js` + `controllers/adminController.js`

### Controller functions

| Function | Tag | Description |
|---|---|---|
| `dashboard(req, res)` | `[ADMIN][PARCEL][PAYMENT][DB]` | Admin dashboard for parcels and payments. |
| `report(req, res)` | `[ADMIN][REPORT][DB]` | Builds aggregated stats (revenue, COD outstanding, success rate, top customers, etc.). |
| `cancelParcel(req, res)` | `[ADMIN][PARCEL][DB]` | Admin cancels a parcel. |
| `markShipped(req, res)` | `[ADMIN][PARCEL][TRACKING][DB]` | Marks shipped and writes a tracking log entry. |
| `markDelivered(req, res)` | `[ADMIN][PARCEL][DB]` | Marks delivered. |
| `updatePaymentStatus(req, res)` | `[ADMIN][PAYMENT][DB]` | Updates payment status and syncs parcel state. |
| `updateStatus(req, res)` | `[ADMIN][PARCEL][TRACKING][DB]` | Updates parcel status and optionally logs tracking when shipped. |
| `deleteParcel(req, res)` | `[ADMIN][PARCEL][PAYMENT][TRACKING][DB]` | Deletes parcel and dependent records (function exists but not currently routed). |

### Route handlers

| Route | Tag | Description |
|---|---|---|
| `GET /admin/dashboard` | `[ADMIN][SESSION]` | Admin dashboard page. |
| `GET /admin/report` | `[ADMIN][REPORT][SESSION]` | Admin report page. |
| `GET /admin/report-debug` | `[REPORT]` | Debug access to report (no auth guard in current code). |
| `POST /admin/parcel/update-status` | `[ADMIN][PARCEL]` | Updates parcel status. |
| `POST /admin/payment/update-status` | `[ADMIN][PAYMENT]` | Updates payment status. |
| `POST /admin/parcel/cancel` | `[ADMIN][PARCEL]` | Cancels a parcel. |
| `POST /admin/parcel/ship` | `[ADMIN][PARCEL][TRACKING]` | Marks shipped and logs tracking. |
| `POST /admin/parcel/deliver` | `[ADMIN][PARCEL]` | Marks delivered. |

## `middleware/auth.js`

| Function | Tag | Description |
|---|---|---|
| `ensureAuth(req, res, next)` | `[SESSION][AUTH]` | Requires any logged-in session. |
| `ensureCustomer(req, res, next)` | `[SESSION][AUTH]` | Requires a non-admin customer session (admins are redirected). |

## `models/*`

### `models/Customer.js`

| Function | Tag | Description |
|---|---|---|
| `create(data, cb)` | `[CUSTOMER][DB]` | Inserts a customer row. |
| `findByEmail(email, cb)` | `[CUSTOMER][DB]` | Looks up customer by email. |
| `findById(id, cb)` | `[CUSTOMER][DB]` | Looks up customer by ID. |

### `models/Parcel.js`

| Function | Tag | Description |
|---|---|---|
| `create(data, cb)` | `[PARCEL][DB]` | Inserts a parcel row. |
| `findById(id, cb)` | `[PARCEL][DB]` | Looks up parcel by ID. |
| `findBySender(senderId, cb)` | `[PARCEL][DB]` | Lists parcels by sender/customer. |
| `findByTrackingNumber(tn, cb)` | `[PARCEL][DB]` | Looks up parcel by tracking number. |

### `models/Payment.js`

| Function | Tag | Description |
|---|---|---|
| `create(data, cb)` | `[PAYMENT][DB]` | Inserts a payment row. |
| `findByParcel(parcelId, cb)` | `[PAYMENT][DB]` | Gets the payment row for a parcel. |

## `Database/Database.js`

| Block | Tag | Description |
|---|---|---|
| SQLite connection (`new sqlite3.Database`) | `[DB][SYSTEM]` | Opens `Database/postal.db`. |
| Schema bootstrap (`db.exec`) | `[DB][SYSTEM]` | Creates Customers/Parcels/Payments/Tracking tables if missing. |
| Global singleton (`globalThis.__postalDb`) | `[SYSTEM][DB]` | Reuses one shared connection across imports. |

## `Database/seed.js`

| Function | Tag | Description |
|---|---|---|
| `seedAdmin()` | `[SYSTEM][AUTH][DB]` | Ensures the admin account exists (run via `npm run seed`). |

