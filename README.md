# NOVA

> A polished streetwear storefront built for browsing, buying, and managing a modern product catalog.

[![CI](https://github.com/yousefhares-eng/nova-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/yousefhares-eng/nova-ecommerce/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-3c873a?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

NOVA is a full-stack e-commerce experience for premium streetwear. It includes a responsive storefront, product discovery, cart and guest checkout, account authentication, payment-method selection, and a protected admin workspace.

## Highlights

- Responsive storefront with search, category filters, featured products, and product galleries.
- Interactive color swatches that switch the product image and preserve the selected variant in the cart.
- Cart and checkout flow with stock validation, shipping calculation, and order creation.
- Payment UI for Visa/card, Fawry, and Vodafone Cash. Payment processing is intentionally demo-only.
- JWT authentication with protected admin routes and bcrypt password hashing.
- Admin dashboard for products, image uploads, and order status management.
- Helmet, Mongo sanitization, scoped API rate limiting, validation, and upload restrictions.

## Stack

| Layer | Technology |
| --- | --- |
| Server | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Frontend | HTML, CSS, vanilla JavaScript |
| Authentication | JWT, bcryptjs |
| Uploads | Multer |
| Validation | express-validator |
| Hosting | Render-ready via `render.yaml` |

## Quick start

### Requirements

- Node.js 20 or newer
- MongoDB, or a MongoDB Atlas connection string

### Install and run

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

Open `http://localhost:3000`.

Default development admin credentials are `admin@nova.style` / `admin123`. Change them in `.env` before using a shared or production environment.

## Environment

Copy `.env.example` to `.env` and configure:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB or MongoDB Atlas connection string |
| `JWT_SECRET` | Strong secret used to sign authentication tokens |
| `PORT` | HTTP port, default `3000` |
| `BASE_URL` | Public base URL used for uploaded image URLs |
| `ADMIN_EMAIL` | Seed admin email |
| `ADMIN_PASSWORD` | Seed admin password |
| `ADMIN_NAME` | Seed admin display name |

Never commit `.env`. It is excluded by `.gitignore`.

## Deployment

The repository includes [render.yaml](render.yaml) for Render. Create a MongoDB Atlas database, connect the GitHub repository to Render, and set `MONGODB_URI`, `JWT_SECRET`, `BASE_URL`, and `ADMIN_PASSWORD` as Render environment variables. After the first deploy, run `npm run seed` once from the service shell.

Production refuses to fall back to an in-memory database, so missing database configuration fails fast instead of silently losing orders.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the production server |
| `npm run dev` | Start the server with Nodemon |
| `npm run seed` | Create the admin and missing sample products |
| `npm run check` | Run syntax checks across backend JavaScript |

## Project layout

```text
app.js              Express app and middleware
server.js           Database connection and server entry point
config/              Database configuration
controllers/        API controllers
middleware/         Authentication, validation, and uploads
models/              Mongoose models
public/              Storefront, admin pages, styles, and client scripts
routes/              API route definitions
scripts/             Seed utilities
utils/               Shared sample data and product helpers
```

## API surface

- `GET /api/products` - list and filter active products
- `GET /api/products/:id` - retrieve one product
- `POST /api/orders` - create a guest or authenticated order
- `POST /api/auth/register` - create an account
- `POST /api/auth/login` - authenticate a user
- `GET /api/admin/*` - protected admin operations

## Security notes

This project is ready for demonstration and further production integration. The checkout payment methods are UI selections only; connect a PCI-compliant payment provider before accepting real card data or money. Use HTTPS, MongoDB Atlas network restrictions, strong secrets, and persistent image storage in production.

## License

MIT
