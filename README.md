# Lumen Market (Full-Stack E-Commerce)

A modern full-stack e-commerce demo with product browsing, cart management, authentication, Stripe payments, and order history.

## Features
- Product listing with search and category filter
- Product details with multi-image gallery and quantity selector
- Cart management with local storage
- User registration and login
- Checkout with Stripe Payment Intents
- Order history for logged-in users
- Admin dashboard with product management

## Tech Stack
- Frontend: HTML, CSS, JavaScript (vanilla)
- Backend: Node.js, Express.js
- Database: MySQL
- Payments: Stripe

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment

Create a `.env` file using `.env.example` and set your MySQL credentials. To seed an admin user, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before running the seed script.

3. Seed products

```bash
npm run seed
```

4. Start the server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Stripe Test Cards
Use Stripe test card `4242 4242 4242 4242` with any future date and any CVC.

## Notes
- Orders are created after payment confirmation.
- Cart data is stored in the browser using localStorage.
- Admin dashboard is available at `/admin.html` for admin users.
