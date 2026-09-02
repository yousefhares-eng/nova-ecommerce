/**
 * Order controller
 * Create order (from cart), get user orders
 */

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { normalizeProduct } = require('../utils/normalizeProduct');

/**
 * Aggregate line items by productId (same product may appear multiple times in cart).
 */
function aggregateQuantities(items) {
  const map = new Map();
  for (const it of items) {
    const id = String(it.productId);
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    map.set(id, (map.get(id) || 0) + qty);
  }
  return map;
}

/**
 * Atomically decrement stock; rolls back prior decrements on failure.
 */
async function decrementStock(quantityByProductId) {
  const decremented = [];

  for (const [productId, qty] of quantityByProductId) {
    const updated = await Product.findOneAndUpdate(
      { _id: productId, active: true, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!updated) {
      for (const { id, quantity } of decremented) {
        await Product.findByIdAndUpdate(id, { $inc: { stock: quantity } });
      }

      const product = await Product.findById(productId).select('name stock active').lean();
      if (!product) {
        return { ok: false, message: `Product ${productId} not found.` };
      }
      if (!product.active) {
        return { ok: false, message: `"${product.name}" is no longer available.` };
      }
      return {
        ok: false,
        message: `Not enough stock for "${product.name}". Only ${product.stock} left.`,
      };
    }

    decremented.push({ id: productId, quantity: qty });
  }

  return { ok: true };
}

/**
 * Restore stock when an order is cancelled.
 */
async function restoreStock(orderItems) {
  const quantityByProductId = aggregateQuantities(orderItems);
  for (const [productId, qty] of quantityByProductId) {
    await Product.findByIdAndUpdate(productId, { $inc: { stock: qty } });
  }
}

/**
 * POST /api/orders
 * Create order from cart payload. User optional (guest checkout).
 * Body: { items: [{ productId, quantity, size, color }], shippingAddress, email? }
 */
exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { items, shippingAddress, email: bodyEmail, notes, paymentMethod = 'card' } = req.body;
    const allowedPaymentMethods = ['card', 'fawry', 'vodafone_cash'];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method.' });
    }
    const email = (req.user && req.user.email) || bodyEmail;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for orders.' });
    }

    const quantityByProductId = aggregateQuantities(items);
    const productIds = [...quantityByProductId.keys()];

    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: 'Invalid product ID in cart.' });
    }

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    for (const productId of productIds) {
      if (!productMap.has(productId)) {
        return res.status(400).json({ success: false, message: `Product ${productId} not found.` });
      }
    }

    const stockResult = await decrementStock(quantityByProductId);
    if (!stockResult.ok) {
      return res.status(400).json({ success: false, message: stockResult.message });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const it of items) {
      const product = productMap.get(String(it.productId));
      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      const price = product.price;
      const normalized = normalizeProduct(product);
      const imageUrl = (normalized.images && normalized.images[0]) || '';

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: imageUrl,
        price,
        quantity: qty,
        size: it.size || '',
        color: it.color || '',
      });
      subtotal += price * qty;
    }

    const shipping = subtotal >= 100 ? 0 : 9.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const order = await Order.create({
      orderNumber: Order.generateOrderNumber(),
      userId: req.user ? req.user._id : null,
      email,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      paymentMethod,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
    });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
};

/**
 * GET /api/orders
 * List orders for current user (requires auth)
 */
exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (err) {
    console.error('My orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

/**
 * GET /api/orders/:id
 * Single order by id (owner or admin only — admin check in route)
 */
exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const isOwner = req.user && String(order.userId) === String(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error('Order get error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

exports.restoreStock = restoreStock;
