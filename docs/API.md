# ShopSphere API Documentation

Base URL:
- Local: `http://localhost:5000`
- Production: `https://shopsphere-22ek.onrender.com`

> Confirm the production URL and route behavior against the deployed API before publishing.
> Protected routes require a valid authentication token. Admin routes require an admin account.

## Health

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Check API health |

## Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a customer |
| POST | `/api/auth/login` | Public | Authenticate a user |
| GET | `/api/auth/protected` | Authenticated | Verify access to a protected route |

## Products

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/products` | Public | List products (supports the filters implemented by the API) |
| GET | `/api/products/:id` | Public | Get product details |
| POST | `/api/products` | Admin | Create a product |
| PATCH | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |

## Categories

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/categories` | Public | List categories |
| POST | `/api/categories` | Admin | Create a category |

## Cart

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/cart` | Customer | Get the signed-in customer's cart |
| POST | `/api/cart` | Customer | Add a product to the cart |
| PATCH | `/api/cart/:productId` | Customer | Update a cart item's quantity |
| DELETE | `/api/cart/:productId` | Customer | Remove a cart item |

## Wishlist

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/wishlist` | Customer | Get the customer's wishlist |
| POST | `/api/wishlist` | Customer | Add a product to the wishlist |
| DELETE | `/api/wishlist/:productId` | Customer | Remove a product from the wishlist |

## Checkout and Payments

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/checkout/validate` | Customer | Validate checkout details |
| POST | `/api/checkout/create-payment-order` | Customer | Create a Razorpay payment order |
| POST | `/api/checkout/verify-payment` | Customer | Verify payment and finalize the order |

## Customer Orders

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/orders/my-orders` | Customer | List the customer's orders |

## Admin Orders

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/admin/orders` | Admin | List orders |
| GET | `/api/admin/orders/:orderId` | Admin | Get order details |
| PATCH | `/api/admin/orders/:orderId/status` | Admin | Update order status |
| GET | `/api/admin/check` | Admin | Verify admin access |

## Authentication and error handling

- Send the authentication token using the header format expected by the backend (commonly `Authorization: Bearer <token>`).
- Admin endpoints must reject non-admin users.
- Validate request data and resource IDs; the API should return appropriate HTTP error statuses for invalid input, missing resources, and unauthorized access.

## Notes

This file documents the API route surface. For exact payload schemas, query parameters, response examples, and status codes, consult the corresponding Express route/controller and validation code before adding examples.
