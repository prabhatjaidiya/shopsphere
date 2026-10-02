**# 🛒 ShopSphere**



A full-stack e-commerce platform being built with **\*\*React, Node.js, Express, TypeScript, MongoDB, and Mongoose\*\***.



**## 📌 Overview**



ShopSphere is a practical e-commerce application with two main areas:



\- 👤 Customer Store

\- 👨‍💼 Admin Dashboard



The project is being developed incrementally using a **\*\*28-day development roadmap\*\***. The customer-facing frontend is currently being built with mock data before backend API integration.



**---**



**## ✨ Planned Features**



**### 👤 Customer**



\- Product browsing

\- Product search

\- Product filtering

\- Product sorting

\- Product details

\- User registration and login

\- Shopping cart

\- Wishlist

\- Checkout

\- Test payment

\- Order history

\- Order status tracking

\- Product reviews



**### 👨‍💼 Admin**



\- Admin authentication

\- Admin dashboard

\- Product CRUD

\- Category management

\- Inventory management

\- Order management

\- Customer management

\- Analytics dashboard

\- Coupon management



**### 🔐 Planned Security**



\- JWT authentication

\- bcrypt password hashing

\- Protected routes

\- Role-based authorization

\- Backend input validation

\- Environment variables for sensitive configuration



\> Most features above are planned for later roadmap days and are not implemented yet.



**---**



**## 🏗️ Architecture**



Planned application architecture:



\`\`\`text

React Frontend

      ↓

REST API

      ↓

Express Server

      ↓

Mongoose

      ↓

MongoDB Atlas

\`\`\`



**### Request Flow**



\`\`\`text

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

\`\`\`



**---**



**## 🛠️ Tech Stack**



**### Frontend**



\- React

\- Vite

\- TypeScript

\- Tailwind CSS

\- React Router

\- TanStack Query



**### Backend**



\- Node.js

\- Express

\- TypeScript

\- REST API



**### Database**



\- MongoDB Atlas

\- Mongoose



**### Authentication**



\- JWT

\- bcrypt

\- Role-based authorization



**### Other Tools**



\- Git

\- GitHub

\- Cloudinary (planned)

\- Test payment integration (planned)



**---**



**## 📁 Project Structure**



\`\`\`text

shopsphere/

├── client/

│   └── React + Vite frontend

├── server/

│   └── Node.js + Express backend

├── docs/

│   └── UI-DESIGN.md

├── README.md

├── .gitignore

└── package.json

\`\`\`



**---**



**## 🎯 Project Goals**



The goal of ShopSphere is to build a realistic full-stack e-commerce application while practicing:



\- React application architecture

\- Reusable component development

\- REST API development

\- Authentication and authorization

\- MongoDB data modeling

\- E-commerce business logic

\- Admin functionality

\- API integration

\- Responsive UI development

\- Production deployment

\- Full-stack project organization



**---**



**# 📋 Development Roadmap**



**## Day 1 — Project Planning & Architecture ✅**



**### Completed**



\- [x] Define project requirements

\- [x] Define customer user flow

\- [x] Define admin user flow

\- [x] Plan application architecture

\- [x] Create GitHub repository

\- [x] Initialize React frontend

\- [x] Initialize Node.js backend

\- [x] Create README

\- [x] Initial Git commit



**\*\*Status:\*\*** Completed



**---**



**## Day 2 — UI Design & UX Direction ✅**



**### Customer UI Planning**



\- [x] Homepage structure

\- [x] Product listing page

\- [x] Product details page

\- [x] Cart page

\- [x] Checkout flow

\- [x] Login/Register screens



**### Admin UI Planning**



\- [x] Admin dashboard

\- [x] Product management

\- [x] Order management

\- [x] Inventory management

\- [x] Customer management

\- [x] Analytics structure



**### Design System & Documentation**



\- [x] Typography, color, and spacing systems

\- [x] Button and input styles

\- [x] Product card structure and status badges

\- [x] Responsive design strategy

\- [x] Loading, empty, success, and error states

\- [x] Document UI/UX decisions in \`docs/UI-DESIGN.md\`

\- [x] Commit and push UI design documentation



**\*\*Status:\*\*** Completed



**---**



**## Day 3 — React Setup & Shared Components ✅**



**### Frontend Foundation**



\- [x] React + Vite setup

\- [x] TypeScript configuration

\- [x] Tailwind CSS setup

\- [x] React Router setup

\- [x] TanStack Query setup



**### Reusable Components & Layout**



\- [x] Shared UI components and reusable component foundation

\- [x] Navbar

\- [x] Footer

\- [x] \`CustomerLayout\`

\- [x] Navbar and Footer integration

\- [x] React Router \`Outlet\`



**### Customer Routes**



\- [x] \`/\`

\- [x] \`/products\`

\- [x] \`/products/:id\`

\- [x] \`/cart\`

\- [x] \`/checkout\`

\- [x] \`/login\`

\- [x] \`/register\`

\- [x] \`/orders\`



**\*\*Status:\*\*** Completed



**---**



**## Day 4 — Customer Homepage ✅**



**### Homepage Sections**



\- [x] Hero section

\- [x] Category section

\- [x] Featured products

\- [x] Promotional banner

\- [x] Responsive homepage layout



**### Reusable Components & Mock Data**



\- [x] \`HeroSection\`

\- [x] \`CategorySection\`

\- [x] \`CategoryCard\`

\- [x] \`FeaturedProducts\`

\- [x] \`ProductCard\`

\- [x] \`PromoBanner\`

\- [x] Mock category data

\- [x] Mock product data



**### Responsive UI & Navigation**



\- [x] Desktop, tablet, and mobile layouts

\- [x] Responsive product and category grids

\- [x] Responsive hero and promotional banner

\- [x] Homepage, product, cart, orders, login, and register navigation

\- [x] Homepage UI, responsive layout, navigation, and console/error checks



**\*\*Status:\*\*** Completed



**### Homepage Flow**



\`\`\`text

Hero

  ↓

Categories

  ↓

Featured Products

  ↓

Promotional Banner

\`\`\`



**---**



**## Day 5 — Product Listing Page ✅**



**### Product Listing**



\- [x] Build \`/products\` page

\- [x] Product grid using reusable \`ProductCard\`

\- [x] Product search

\- [x] Category filtering

\- [x] Minimum and maximum price filtering

\- [x] Product sorting

\- [x] Product result count

\- [x] Empty state

\- [x] Responsive layout



**### Search, Filtering & Sorting**



\- [x] Case-insensitive product-name search

\- [x] Display matching products and an empty state

\- [x] All products, Electronics, Fashion, Shoes, and Accessories filters

\- [x] Minimum and maximum price filters

\- [x] Prevent invalid minimum/maximum ranges

\- [x] Display selected price range

\- [x] Popular, price low-to-high, price high-to-low, and rating sorting



**### Responsive UX**



\- [x] Desktop, tablet, and mobile product layouts

\- [x] Responsive filter controls and mobile filter panel

\- [x] Responsive category pills, search, and sorting controls

\- [x] Horizontal overflow prevention

\- [x] Filter sidebar and sticky desktop filter sidebar

\- [x] Reset filters and empty product state

\- [x] Product card hover effects



**\*\*Data source:\*\*** The listing uses mock/static product data. Backend API integration is planned for a later roadmap stage.



**\*\*Status:\*\*** Completed



**### Product Listing Flow**



\`\`\`text

Product Listing

      ↓

Search

      ↓

Category Filter

      ↓

Price Filter

      ↓

Sorting

      ↓

Product Grid / Empty State

\`\`\`



**---**



**## Day 6 — Product Details Page ✅**



**### Product Details**



\- [x] Build the product details page for \`/products/:id\`

\- [x] Read the product ID using React Router's \`useParams\`

\- [x] Find the matching product in mock data

\- [x] Handle invalid IDs and products that cannot be found

\- [x] Display product name, category, rating, and price

\- [x] Display stock status using the available mock data/default

\- [x] Add quantity increase/decrease controls with minimum and stock limits

\- [x] Calculate total price from unit price and quantity

\- [x] Add product image/gallery UI with a fallback when images are unavailable

\- [x] Add wishlist toggle UI

\- [x] Connect the product details Add to Cart action to the shared cart context (implemented during Day 7)

\- [x] Link product cards to the matching details route using React Router \`Link\`

\- [x] Add scroll-to-top behavior when the route changes

\- [x] Improve responsive spacing for mobile layouts

\- [x] Configure the customer layout as a flex column so the footer stays at the bottom on short pages and follows content on long pages



**### Testing & Build**



\- [x] Test product details and navigation

\- [x] Check invalid product IDs

\- [x] Check quantity and total-price behavior

\- [x] Check stock-related button states

\- [x] Check wishlist and Add to Cart UI interactions

\- [x] Review responsive layout and footer behavior

\- [x] Frontend production build completed successfully with \`tsc -b && vite build\`



**\*\*Important implementation notes:\*\***



\- Product details still use mock/static data; no product API integration has been completed as part of this day.

\- The current mock products do not include image URLs or descriptions, so the page uses its fallback UI/text until those fields are supplied.

\- Add to Cart is connected to the shared React cart context. Cart persistence across page refreshes has not been implemented yet.

\- Wishlist state is local to the product details component and is not persistent.



**\*\*Status:\*\*** Completed



**---**



**## Day 7 — Cart & Frontend Review 🚧**


**### Shared Cart State**


- [x] Create `CartContext` with React Context and `useState`
- [x] Add `CartProvider` around the application
- [x] Implement `addToCart` with duplicate-product quantity handling
- [x] Implement increase/decrease quantity actions
- [x] Implement remove-from-cart action
- [x] Calculate subtotal from cart items
- [x] Connect the product details page to the shared cart
- [x] Connect product listing cards to the shared cart
- [x] Show Add to Cart confirmation feedback


**### Cart Page**


- [x] Display cart products, unit prices, quantities, and line totals
- [x] Add quantity controls
- [x] Add remove-item action
- [x] Display order summary and subtotal
- [x] Add empty-cart state and Continue Shopping link
- [x] Add checkout navigation link
- [x] Test adding products, quantity updates, subtotal, removal, and empty state
- [x] Check cart layout on mobile and desktop


**### Frontend Review & Build**


- [x] Production build passes with `npm run build` (`tsc -b && vite build`)
- [ ] Review all customer-facing routes and navigation
- [ ] Finish responsive and browser-console checks across all pages
- [ ] Update notes and create the Day 7 Git checkpoint


**Implementation notes:**


- Cart state currently lives in React Context and resets on a full page refresh; persistence is not implemented yet.
- Cart quantity controls currently have a minimum quantity of 1. Stock-limit enforcement in the cart still needs to be considered.
- Checkout is still a frontend flow; no payment processing or order creation is implemented yet.
- Products continue to use mock/static data; backend API integration is planned for a later roadmap stage.


**Status:** In Progress


**---**


**## 📚 Documentation**



**### UI/UX Design**



The UI/UX direction, design system, responsive strategy, and interface states are documented in:



\`\`\`text

docs/UI-DESIGN.md

\`\`\`



**### Current Data Strategy**



The homepage, product listing, and product details currently use mock/static product or category data. Backend API integration will be added in later roadmap days.



**---**



**## 📊 Project Status**



\- **\*\*Project:\*\*** In Progress

\- **\*\*Overall progress:\*\*** **\*\*6/28 days — 21.43%\*\*** (Day 7 in progress)

\- **\*\*Completed days:\*\*** **\*\*1–6\*\***

\- **\*\*Current milestone:\*\*** Day 7 — Cart & Frontend Review (in progress)

\- **\*\*Next milestone:\*\*** Finish frontend review, update notes, and create the Day 7 Git checkpoint



**### Progress Tracker**



\`\`\`text

Day 1  ████████████████████  Completed

Day 2  ████████████████████  Completed

Day 3  ████████████████████  Completed

Day 4  ████████████████████  Completed

Day 5  ████████████████████  Completed

Day 6  ████████████████████  Completed



Overall

██████░░░░░░░░░░░░░░░░░░░░  21.43%

\`\`\`



**---**



**## 🚀 Development Approach**



ShopSphere is being developed incrementally, completing and reviewing the frontend foundation before integrating real backend data and e-commerce workflows.



\`\`\`text

Frontend Foundation

       ↓

Homepage UI

       ↓

Product Listing UI

       ↓

Product Details

       ↓

Cart & Frontend Review

       ↓

Backend API

       ↓

Database Integration

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

\`\`\`



The exact implementation sequence will follow the 28-day roadmap. Planned features should not be considered implemented until their roadmap tasks are completed.



**---**



**## 👨‍💻 Developer**



**\*\*Prabhat Jaidiya\*\***



Building ShopSphere as a practical full-stack e-commerce project while developing skills in React, TypeScript, Node.js, Express, MongoDB, and modern full-stack development.