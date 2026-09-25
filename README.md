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

### Day 1 Deliverable

* [x] Project requirements defined
* [x] Customer flow defined
* [x] Admin flow defined
* [x] Architecture planned
* [x] GitHub repository created
* [x] Client project initialized
* [x] Server project initialized
* [x] README started
* [x] Initial project commit pushed

## 🚧 Development Status

**Project:** In Progress

**Current Day:** Day 1 — Project Planning & Requirements

**Day 1 Status:** Completed foundation and requirements.