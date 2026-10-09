# 🛍️ ShopSphere

A full-stack e-commerce platform built with **React, TypeScript, Tailwind CSS, Node.js, Express, and MongoDB**.

ShopSphere is being developed as a structured 28-day full-stack project, covering both the customer-facing shopping experience and an admin management system.

---

## 📊 Project Status

- **Project:** In Progress
- **Overall Progress:** **11/28 days — 39.29%**
- **Completed Days:** 1–11
- **Current Milestone:** **Day 12 — Roles & Protected Routes**
- **Next Milestone:** Day 13

### Progress Tracker

| Day | Milestone | Status |
|---|---|---|
| Day 1 | Project Planning & Architecture | ✅ Completed |
| Day 2 | UI Design & UX Direction | ✅ Completed |
| Day 3 | React Setup & Shared Components | ✅ Completed |
| Day 4 | Customer Homepage | ✅ Completed |
| Day 5 | Product Listing Page | ✅ Completed |
| Day 6 | Product Details Page | ✅ Completed |
| Day 7 | Cart & Frontend Review | ✅ Completed |
| Day 8 | Express + TypeScript Setup | ✅ Completed |
| Day 9 | MongoDB & Mongoose | ✅ Completed |
| Day 10 | Product API | ✅ Completed |
| Day 11 | Authentication & Users | ✅ Completed |
| Day 12 | Roles & Protected Routes | 🟡 In Progress |


### Current tracking

**ShopSphere: 11/28 — 39.29%**

**Day 11: 6/6 steps complete — 100%**

**Day 12: Implementation and authorization testing complete.**

Remaining: Day 12 learning notes, documentation update, and final verification.

> Overall progress counts only fully completed roadmap days. Day 12 will count toward overall progress after all required steps are completed.

---

## 🔐 Day 11 — Authentication & Users

### Completed

- User Mongoose model
- User validation
- Email uniqueness
- Secure password handling
- bcrypt password hashing
- Registration API
- Login API
- Password verification
- JWT generation
- JWT verification
- Authentication middleware
- Bearer token handling
- Protected route testing
- Authentication error handling

### Authentication Flow

```text
Registration
    ↓
Validate Input
    ↓
Check Existing User
    ↓
bcrypt.hash()
    ↓
Create User
    ↓
MongoDB

---

# 🎯 Project Goals

ShopSphere aims to provide a complete e-commerce experience with:

### Customer Side

- Browse products
- Search and filter products
- View product details
- Manage shopping cart
- User authentication
- Checkout
- Order management
- Product reviews

### Admin Side

- Dashboard
- Product management
- Category management
- Order management
- User management
- Inventory management

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query

## Backend

- Node.js
- Express
- TypeScript
- REST API
- Mongoose

## Database

- MongoDB
- MongoDB Atlas

## Authentication

Planned:

- JWT
- bcrypt
- Role-based authorization

## Other Technologies

Planned:

- Cloudinary
- REST APIs
- Vercel
- Render / Railway

---

# 🏗️ Architecture

```text
React Frontend
      ↓
HTTP Request
      ↓
Express REST API
      ↓
Routes
      ↓
Controllers
      ↓
Mongoose Models
      ↓
MongoDB Atlas
      ↓
JSON Response
      ↓
React Frontend
```

---

# 🔄 Request Flow

```text
Client
  ↓
Express Server
  ↓
Middleware
  ↓
Route
  ↓
Controller
  ↓
Mongoose
  ↓
MongoDB Atlas
  ↓
Controller
  ↓
JSON Response
  ↓
Client
```

---

# 📁 Project Structure

```text
shopsphere/
│
├── client/                         # React + TypeScript frontend
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                         # Node.js + Express + TypeScript backend
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   │
│   │   ├── models/
│   │   │   ├── Product.ts
│   │   │   ├── Category.ts
│   │   │   └── User.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── product.controller.ts
│   │   │   └── auth.controller.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── product.routes.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   │
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   │
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── test-bcrypt.ts
│   │   └── test-jwt.ts
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   └── UI-DESIGN.md
│
├── README.md
├── notes.md
├── .gitignore
└── package.json
```

> The structure above will expand as new roadmap milestones are implemented.

---

# 🗄️ Database Design

MongoDB Atlas currently contains the foundation for the ShopSphere database layer.

```text
MongoDB Atlas
     ↓
ShopSphere Database
     │
     ├── products
     │
     └── categories
```

### Product → Category Relationship

```text
Product
   │
   └── category: ObjectId
                    ↓
                 Category
```

Products reference categories using MongoDB `ObjectId`.

Mongoose can later populate this relationship when required.

---

# 📦 Product Model

The current Product model supports:

- Name
- Description
- Price
- Category
- Stock
- Images
- Rating
- Validation
- Automatic timestamps

Validation includes:

```text
Price  ≥ 0
Stock  ≥ 0
Rating  0–5
```

Mongoose automatically maintains:

```text
createdAt
updatedAt
```

---

# 🏷️ Category Model

The Category model currently supports:

- Name
- Description
- Required name validation
- Unique category names
- String trimming
- Automatic timestamps

---

# 🔌 MongoDB Connection

MongoDB is connected through Mongoose.

```text
server.ts
    ↓
connectDB()
    ↓
Mongoose
    ↓
MongoDB Atlas
```

The MongoDB connection string is stored in an environment variable:

```env
MONGODB_URI=your_mongodb_connection_string
```

Sensitive environment variables are not committed to Git.

---

# 🧪 Database Testing

The Day 9 database layer has been tested for:

- MongoDB connection
- Category creation
- Product creation
- Product retrieval
- Product update
- Product deletion
- Validation errors
- ObjectId relationship
- Automatic timestamps
- Test data cleanup

Example validation tests successfully reject:

```text
Negative price
Negative stock
Rating greater than 5
```

---

# 🚀 Local Development

## Clone the repository

```bash
git clone <repository-url>
cd shopsphere
```

## Install dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Never commit the real `.env` file.

Use `.env.example` to document required variables.

---

# ▶️ Run the Backend

```bash
cd server
npm run dev
```

Expected output:

```text
MongoDB connected successfully
ShopSphere API running on port 5000
```

---

# 🏗️ Build the Backend

```bash
cd server
npm run build
```

The TypeScript build should complete without errors.

---

# 📚 Development Roadmap

## Phase 1 — Planning & Frontend

- [x] Day 1 — Project Planning & Architecture
- [x] Day 2 — UI Design & UX Direction
- [x] Day 3 — React Setup & Shared Components
- [x] Day 4 — Customer Homepage
- [x] Day 5 — Product Listing Page
- [x] Day 6 — Product Details Page
- [x] Day 7 — Cart & Frontend Review

## Phase 2 — Backend Foundation

- [x] Day 8 — Express + TypeScript Setup
- [x] Day 9 — MongoDB & Mongoose
- [x] Day 10 — Product API
- [x] Day 11 — Category API
- [ ] Day 12 — Authentication
- [ ] Day 13 — Authorization
- [ ] Day 14 — Backend Review

## Phase 3 — Full-Stack Integration

- [ ] API integration
- [ ] Authentication integration
- [ ] Product management
- [ ] Cart synchronization
- [ ] Checkout
- [ ] Orders

## Phase 4 — Admin & Production

- [ ] Admin dashboard
- [ ] Inventory management
- [ ] Reviews
- [ ] Image uploads
- [ ] Error handling
- [ ] Testing
- [ ] Deployment
- [ ] Final optimization

---

# 🧠 Key Concepts Practiced

During the first nine days, the project has covered:

- React component architecture
- React Router
- Tailwind CSS
- State management
- Cart management
- Express
- TypeScript
- REST API foundations
- Environment variables
- MongoDB
- MongoDB Atlas
- Mongoose
- Schemas
- Models
- ObjectId
- Validation
- Timestamps
- CRUD operations
- Git workflow

---

# 📌 Current Focus

## Day 12 — Roles & Protected Routes

Day 12 builds role-based authorization on top of the authentication foundation completed on Day 11.

### Authorization Features

- Defined two supported roles: `customer` and `admin`.
- Added reusable `authorizeRoles` middleware.
- Validated JWT payloads, including non-empty user IDs and supported role values.
- Restricted the `GET /api/admin/check` test endpoint to authenticated admins.
- Preserved public access to product listing and existing product details endpoints.
- Kept public registration from accepting client-supplied roles.

### Authorization Flow

```text
Incoming Request
      ↓
Authentication Middleware
      ↓
Verify JWT and Validate Claims
      ↓
Attach Authenticated User
      ↓
Role Authorization Middleware
      ↓
Check Allowed Roles
      ↓
401 — Missing or Invalid Authentication
403 — Insufficient Permissions
200 — Authorized Request
```

### Verification Results

| Test | Expected Result | Result |
|---|---|---|
| Missing token on admin endpoint | 401 Unauthorized | Passed |
| Customer token on admin endpoint | 403 Forbidden | Passed |
| Admin-role test token on admin endpoint | 200 OK | Passed |
| Unsupported JWT role | 401 Unauthorized | Passed |
| Existing protected route with customer token | 200 OK | Passed |
| Public product listing without a token | Successful response | Passed |
| TypeScript type checking | No errors | Passed |
| Production build | Successful | Passed |

### Git Checkpoint

- **Commit:** `2b7a1f4`
- **Message:** `feat: add role-based authorization middleware`
- **Repository:** Implementation committed as `2b7a1f4`; README documentation changes are pending commit.

### Remaining Work

- Finalize Day 12 learning notes and documentation.
- Verify the final README and Git status.
- Mark Day 12 complete only after all required steps are confirmed.

> Security note: The admin test used a temporary, locally signed JWT to validate role-checking behavior. A real database-backed admin login has not yet been tested, and authorization based on JWT role claims does not automatically reflect later role changes in MongoDB.

---

# 👨‍💻 Developer

**Prabhat Jaidiya**

B.Sc. Mathematical Science — University of Delhi

Aspiring Full-Stack Developer

---

# 📄 License

This project is being developed as a personal learning and portfolio project.