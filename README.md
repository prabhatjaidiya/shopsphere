# 🛒 ShopSphere

A full-stack e-commerce platform built with React, Node.js, Express, TypeScript, and MongoDB.

## 📌 Overview

ShopSphere is a realistic full-stack e-commerce application with two main sides:

* Customer Store
* Admin Dashboard

The project is being developed incrementally using a 28-day development roadmap.

## ✨ Features

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

## 🏗️ Architecture

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

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* TanStack Query

### Backend

* Node.js
* Express
* TypeScript
* REST API

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT
* bcrypt
* Role-based authorization

### Other Tools

* Git
* GitHub
* Cloudinary
* Test payment integration

## 📁 Project Structure

```text
shopsphere/
│
├── client/
│   └── React + Vite frontend
│
├── server/
│   └── Node.js + Express backend
│
├── README.md
├── .gitignore
└── package.json
```

## 🎯 Project Goals

The goal of ShopSphere is to build a realistic full-stack e-commerce application while practicing:

* React application architecture
* REST API development
* Authentication and authorization
* MongoDB data modeling
* E-commerce business logic
* Admin functionality
* API integration
* Production deployment
* Full-stack project organization

## 📋 Day 1 — Project Planning

### Customer Flow

```text
Browse
  ↓
Search / Filter
  ↓
Product Details
  ↓
Cart / Wishlist
  ↓
Login / Register
  ↓
Checkout
  ↓
Address
  ↓
Test Payment
  ↓
Order Created
  ↓
Order History / Status
```

### Admin Flow

```text
Admin Login
     ↓
Dashboard
     ├── Products
     ├── Categories
     ├── Inventory
     ├── Orders
     ├── Customers
     └── Analytics
```

## 📋 Development Roadmap

### Day 1 — Project Planning & Architecture ✅

- [x] Define project requirements
- [x] Define customer user flow
- [x] Define admin user flow
- [x] Plan application architecture
- [x] Create GitHub repository
- [x] Initialize React frontend
- [x] Initialize Node.js backend
- [x] Create README
- [x] Initial Git commit

**Status:** Completed

---

### Day 2 — UI Design & UX Direction ✅

#### Customer UI Planning

- [x] Homepage structure
- [x] Product listing page
- [x] Product details page
- [x] Cart page
- [x] Checkout flow
- [x] Login/Register screens

#### Admin UI Planning

- [x] Admin dashboard
- [x] Product management
- [x] Order management
- [x] Inventory management
- [x] Customer management
- [x] Analytics structure

#### Design System

- [x] Typography system
- [x] Color system
- [x] Spacing system
- [x] Button styles
- [x] Input styles
- [x] Product card structure
- [x] Status badges
- [x] Responsive design strategy
- [x] Loading, empty, success and error states

#### Documentation

- [x] Document UI/UX decisions
- [x] Create `docs/UI-DESIGN.md`
- [x] Commit and push UI design documentation

**Status:** Completed

## 📚 Documentation

### UI/UX Design

The UI/UX direction, design system, responsive strategy, and interface states are documented in:

- `docs/UI-DESIGN.md`

## 📊 Project Status

- **Project:** In Progress
- **Overall Progress:** 2/28 Days — 7.14%
- **Current Day:** Day 2 — UI Design & UX Direction
- **Day 2 Status:** Completed
- **Next:** Day 3 — React Setup & Shared Components