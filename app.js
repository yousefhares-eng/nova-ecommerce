/**
 * Express app setup
 * API routes, static files, security middleware
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const devController = require('./controllers/devController');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ success: false, message: 'Too many requests. Try again later.' });
    },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static assets
const publicPath = path.join(__dirname, 'public');
app.use('/css', express.static(path.join(publicPath, 'css')));
app.use('/js', express.static(path.join(publicPath, 'js')));
app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/uploads', express.static(path.join(publicPath, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Page routes – serve HTML
const sendPage = (name) => (req, res) => {
  res.sendFile(path.join(publicPath, name), (err) => {
    if (err) res.status(404).send('Not found');
  });
};

app.get('/', sendPage('index.html'));
app.get('/shop', sendPage('shop.html'));
app.get('/product', sendPage('product.html'));
app.get('/cart', sendPage('cart.html'));
app.get('/checkout', sendPage('checkout.html'));
app.get('/login', sendPage('login.html'));
app.get('/register', sendPage('register.html'));
app.get('/contact', sendPage('contact.html'));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin', 'index.html'), (err) => {
    if (err) res.status(404).send('Not found');
  });
});
app.get('/admin/products', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin', 'products.html'), (err) => {
    if (err) res.status(404).send('Not found');
  });
});
app.get('/admin/orders', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin', 'orders.html'), (err) => {
    if (err) res.status(404).send('Not found');
  });
});

// Development-only helper routes
if (process.env.NODE_ENV !== 'production') {
  // Seed sample products into the running DB (only when DB is connected)
  app.post('/__dev/seed-products', devController.seedProducts);
}

// 404 – catch-all for unmatched routes (API → JSON, else HTML)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API not found' });
  }
  res.status(404);
  res.sendFile(path.join(publicPath, '404.html'), (err) => {
    if (err && !res.headersSent) res.send('Not found');
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = app;
