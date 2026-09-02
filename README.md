# NOVA – Premium Streetwear E-commerce

Full-stack e-commerce platform for modern streetwear: shop, cart, checkout, user accounts, and admin panel.

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Auth:** JWT + bcrypt
- **Security:** Helmet, rate limiting, input validation, mongo sanitization

## Features

- Product catalog with search, categories, and featured items
- Shopping cart (localStorage)
- Guest and logged-in checkout
- Stock validation on order placement
- Admin dashboard: products CRUD, image upload, order management
- Responsive dark UI

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and adjust values:

```bash
copy .env.example .env
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (use a strong random string in production) |
| `PORT` | Server port (default `3000`) |
| `BASE_URL` | Public URL for uploaded images |
| `ADMIN_EMAIL` | Admin email for seed script (optional) |
| `ADMIN_PASSWORD` | Admin password for seed script (optional) |

### 3. Seed admin user and sample products

```bash
npm run seed
```

Default credentials (if not set in `.env`): `admin@nova.style` / `admin123`

### 4. Run the server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Development without MongoDB

If MongoDB is not running, the app will try local MongoDB, then fall back to an in-memory database automatically.

## Deploy on Render

1. Push this project to a GitHub repository.
2. Create a MongoDB Atlas database and copy its connection string.
3. In Render, choose **New + > Blueprint** and select the repository. Render will use `render.yaml`.
4. Set `MONGODB_URI`, `BASE_URL` (the deployed Render URL), and a strong `ADMIN_PASSWORD` in the Render environment settings.
5. After the first deploy, run `npm run seed` from the Render Shell to create the admin and sample products.

Never upload `.env` to GitHub. It is ignored by `.gitignore`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm run seed` | Create the admin user if needed and add sample products if they do not exist |

## Project structure

```
├── app.js              # Express app & routes
├── server.js           # Entry point
├── config/db.js        # MongoDB connection
├── controllers/        # Route handlers
├── middleware/         # Auth, upload, validation
├── models/             # Mongoose schemas
├── routes/             # API routes
├── public/             # Frontend (HTML, CSS, JS)
├── scripts/            # Seed scripts
└── utils/              # Shared helpers
```

## API overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register user |
| `POST /api/auth/login` | Login |
| `GET /api/products` | List products |
| `POST /api/orders` | Place order |
| `GET /api/admin/*` | Admin routes (requires admin JWT) |

## License

MIT
