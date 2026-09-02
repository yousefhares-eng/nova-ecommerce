/**
 * Product controller
 * Public: list, get by id. Cart logic is frontend + order creation.
 */

const Product = require('../models/Product');
const { normalizeProduct } = require('../utils/normalizeProduct');

/**
 * GET /api/products
 * List products with optional ?featured=true & ?category=...
 */
exports.list = async (req, res) => {
  try {
    const { featured, category, search, limit = 50, skip = 0 } = req.query;
    const filter = { active: true };

    if (featured === 'true') filter.featured = true;
    if (category) filter.category = category;
    if (search && search.trim()) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await Product.countDocuments(filter);
    const items = products.map(normalizeProduct);

    res.json({ success: true, products: items, total });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

/**
 * GET /api/products/featured
 * Featured products for homepage
 */
exports.featured = async (req, res) => {
  try {
    const products = await Product.find({ active: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    res.json({ success: true, products: products.map(normalizeProduct) });
  } catch (err) {
    console.error('Featured products error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products.' });
  }
};

/**
 * GET /api/products/:id
 * Single product by ID
 */
exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product: normalizeProduct(product) });
  } catch (err) {
    console.error('Product get error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};
