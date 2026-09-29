# 🛒 ShopSphere

A full-stack e-commerce platform built with **React, Node.js, Express, TypeScript, MongoDB, and Mongoose**.

## 📌 Overview

ShopSphere is a realistic full-stack e-commerce application with two main sides:

* 👤 Customer Store
* 👨‍💼 Admin Dashboard

The project is being developed incrementally using a **28-day development roadmap**.

---

## ✨ Planned Features

### 👤 Customer

* Product browsing
* Product search
* Product filtering
* Product sorting
* Product details
* User registration and login
* Shopping cart
* Wishlist
* Checkout
* Test payment
* Order history
* Order status tracking
* Product reviews

### 👨‍💼 Admin

* Admin authentication
* Admin dashboard
* Product CRUD
* Category management
* Inventory management
* Order management
* Customer management
* Analytics dashboard
* Coupon management

### 🔐 Security

* JWT authentication
* bcrypt password hashing
* Protected routes
* Role-based authorization
* Backend input validation
* Environment variables for sensitive configuration

> Most of these features are planned for later roadmap days and are not implemented yet.

---

# 🏗️ Architecture

```text
React Frontend
      ↓
REST API
      ↓
Express Server
      ↓
Mongoose
      ↓
MongoDB Atlas
```

### Request Flow

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Mongoose
  ↓
MongoDB
  ↓
Response
  ↓
Client
```

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* TanStack Query

## Backend

* Node.js
* Express
* TypeScript
* REST API

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* JWT
* bcrypt
* Role-based authorization

## Other Tools

* Git
* GitHub
* Cloudinary
* Test payment integration

---

# 📁 Project Structure

```text
shopsphere/
│
├── client/
│   └── React + Vite frontend
│
├── server/
│   └── Node.js + Express backend
│
├── docs/
│   └── UI-DESIGN.md
│
├── README.md
├── .gitignore
└── package.json
```

---

# 🎯 Project Goals

The goal of ShopSphere is to build a realistic full-stack e-commerce application while practicing:

* React application architecture
* Reusable component development
* REST API development
* Authentication and authorization
* MongoDB data modeling
* E-commerce business logic
* Admin functionality
* API integration
* Responsive UI development
* Production deployment
* Full-stack project organization

---

# 📋 Development Roadmap

## Day 1 — Project Planning & Architecture ✅

### Completed

* [x] Define project requirements
* [x] Define customer user flow
* [x] Define admin user flow
* [x] Plan application architecture
* [x] Create GitHub repository
* [x] Initialize React frontend
* [x] Initialize Node.js backend
* [x] Create README
* [x] Initial Git commit

**Status:** Completed

---

## Day 2 — UI Design & UX Direction ✅

### Customer UI Planning

* [x] Homepage structure
* [x] Product listing page
* [x] Product details page
* [x] Cart page
* [x] Checkout flow
* [x] Login/Register screens

### Admin UI Planning

* [x] Admin dashboard
* [x] Product management
* [x] Order management
* [x] Inventory management
* [x] Customer management
* [x] Analytics structure

### Design System

* [x] Typography system
* [x] Color system
* [x] Spacing system
* [x] Button styles
* [x] Input styles
* [x] Product card structure
* [x] Status badges
* [x] Responsive design strategy
* [x] Loading, empty, success and error states

### Documentation

* [x] Document UI/UX decisions
* [x] Create `docs/UI-DESIGN.md`
* [x] Commit and push UI design documentation

**Status:** Completed

---

## Day 3 — React Setup & Shared Components ✅

### Frontend Foundation

* [x] React + Vite setup
* [x] TypeScript configuration
* [x] Tailwind CSS setup
* [x] React Router setup
* [x] TanStack Query setup

### Reusable Components

* [x] Button
* [x] Input
* [x] Loader
* [x] Navbar
* [x] Footer

### Customer Layout

* [x] CustomerLayout
* [x] Navbar integration
* [x] Footer integration
* [x] React Router Outlet

### Customer Routes

* [x] `/`
* [x] `/products`
* [x] `/products/:id`
* [x] `/cart`
* [x] `/checkout`
* [x] `/login`
* [x] `/register`
* [x] `/orders`

**Status:** Completed

---

## Day 4 — Customer Homepage 🚧

### Homepage Sections

* [x] Hero section
* [x] Category section
* [x] Featured products
* [x] Promotional banner
* [x] Responsive homepage layout

### Reusable Homepage Components

* [x] `HeroSection`
* [x] `CategorySection`
* [x] `CategoryCard`
* [x] `FeaturedProducts`
* [x] `ProductCard`
* [x] `PromoBanner`

### Mock Data

* [x] Mock category data
* [x] Mock product data
* [x] Product card rendering with mock data
* [x] Category card rendering with mock data

### Responsive UI

* [x] Desktop layout
* [x] Tablet layout
* [x] Mobile layout
* [x] Responsive product grid
* [x] Responsive category grid
* [x] Responsive hero section
* [x] Responsive promotional banner

### Navigation

* [x] Homepage navigation
* [x] Product navigation
* [x] Cart navigation
* [x] Orders navigation
* [x] Login navigation
* [x] Register navigation

### Testing

* [x] Homepage UI testing
* [x] Responsive testing
* [x] Navigation testing
* [x] Console/error checking

**Status:** Completed

---

# 📚 Documentation

### UI/UX Design

The UI/UX direction, design system, responsive strategy, and interface states are documented in:

```text
docs/UI-DESIGN.md
```

### Homepage

The Day 4 homepage includes:

```text
Hero
  ↓
Categories
  ↓
Featured Products
  ↓
Promotional Banner
```

Current product and category information uses **mock/static data**.

Backend API integration will be added in later roadmap days.

---

# 📊 Project Status

* **Project:** In Progress
* **Overall Progress:** **4/28 Days — 14.29%**
* **Current Day:** **Day 4 — Customer Homepage**
* **Day 4 Status:** **Completed**
* **Next:** **Day 5 — Continue according to the 28-day roadmap**

---

# 🚀 Current Development Philosophy

ShopSphere is being developed incrementally.

The current priority is to establish a strong frontend foundation before connecting the application to real backend data.

```text
Frontend Foundation
       ↓
Homepage UI
       ↓
Product UI
       ↓
Backend API
       ↓
Database
       ↓
Authentication
       ↓
E-commerce Logic
       ↓
Admin Dashboard
       ↓
Testing
       ↓
Deployment
```

The homepage currently uses mock data so that the UI and component architecture can be completed independently from the backend implementation.

---

# 👨‍💻 Developer

**Prabhat Jaidiya**

Building ShopSphere as a practical full-stack e-commerce project while developing skills in React, TypeScript, Node.js, Express, MongoDB, and modern full-stack development.