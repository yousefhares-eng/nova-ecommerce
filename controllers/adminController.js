/**
 * Admin controller
 * Products CRUD, image upload, order management
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { normalizeProduct } = require('../utils/normalizeProduct');
const { restoreStock } = require('./orderController');
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products');

/**
 * GET /api/admin/dashboard
 * Stats for admin dashboard
 */
exports.dashboard = async (req, res) => {
  try {
    const [ordersCount, productsCount, usersCount, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = (revenue[0] && revenue[0].total) || 0;

    res.json({
      success: true,
      stats: {
        orders: ordersCount,
        products: productsCount,
        users: usersCount,
        revenue: Math.round(totalRevenue * 100) / 100,
      },
      recentOrders,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};

/**
 * GET /api/admin/products
 * List all products (including inactive)
 */
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, products: products.map(normalizeProduct) });
  } catch (err) {
    console.error('Admin products list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

/**
 * POST /api/admin/products
 * Create product
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, compareAtPrice, category, sizes, colors, stock, featured, active } = req.body;
    const images = (req.files || []).map((f) => f.filename);

    const product = await Product.create({
      name,
      description: description || '',
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      category: category || 'streetwear',
      images,
      sizes: Array.isArray(sizes) ? sizes : (sizes && String(sizes).split(',').map((s) => s.trim())) || [],
      colors: Array.isArray(colors) ? colors : (colors && String(colors).split(',').map((c) => c.trim())) || [],
      stock: parseInt(stock, 10) || 0,
      featured: !!featured,
      active: active !== 'false' && active !== false,
    });

    res.status(201).json({ success: true, product: normalizeProduct(product) });
  } catch (err) {
    console.error('Admin create product error:', err);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

/**
 * PUT /api/admin/products/:id
 * Update product
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      sizes,
      colors,
      stock,
      featured,
      active,
      images: bodyImages,
    } = req.body;

    if (name != null) product.name = name;
    if (description != null) product.description = description;
    if (price != null) product.price = parseFloat(price);
    if (compareAtPrice != null) product.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (category != null) product.category = category;
    if (sizes != null) {
      product.sizes = Array.isArray(sizes) ? sizes : String(sizes).split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (colors != null) {
      product.colors = Array.isArray(colors) ? colors : String(colors).split(',').map((c) => c.trim()).filter(Boolean);
    }
    if (stock != null) product.stock = parseInt(stock, 10);
    if (featured != null) product.featured = !!featured;
    if (active != null) product.active = active !== 'false' && active !== false;

    if (req.files && req.files.length) {
      const newFiles = req.files.map((f) => f.filename);
      product.images = [...(product.images || []), ...newFiles];
    }
    if (bodyImages !== undefined) {
      const arr = Array.isArray(bodyImages) ? bodyImages : [];
      product.images = arr;
    }

    await product.save();
    res.json({ success: true, product: normalizeProduct(product) });
  } catch (err) {
    console.error('Admin update product error:', err);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

/**
 * DELETE /api/admin/products/:id
 * Delete product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    // Optionally delete image files from disk
    (product.images || []).forEach((img) => {
      const filepath = path.join(uploadDir, img.replace(/^.*[\\/]/, ''));
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    });
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    console.error('Admin delete product error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

/**
 * POST /api/admin/products/:id/images
 * Add images to product
 */
exports.uploadProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const newFiles = (req.files || []).map((f) => f.filename);
    product.images = [...(product.images || []), ...newFiles];
    await product.save();
    res.json({ success: true, product: normalizeProduct(product) });
  } catch (err) {
    console.error('Upload images error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload images.' });
  }
};

/**
 * GET /api/admin/orders
 * List all orders
 */
exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Admin orders list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

/**
 * GET /api/admin/orders/:id
 * Single order
 */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error('Admin get order error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Update order status. Body: { status }
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const wasCancelled = existing.status === 'cancelled';
    const willCancel = status === 'cancelled';

    if (willCancel && !wasCancelled) {
      await restoreStock(existing.items);
    }

    existing.status = status;
    await existing.save();

    res.json({ success: true, order: existing.toObject() });
  } catch (err) {
    console.error('Admin update order status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};
