/**
 * Normalize product document for API responses (image URLs, etc.)
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

function normalizeProduct(product) {
  const doc = product.toObject ? product.toObject() : product;
  const images = (doc.images || []).map((img) =>
    img.startsWith('http') ? img : `${BASE}/uploads/products/${img.replace(/^.*[\\/]/, '')}`
  );
  return { ...doc, images };
}

module.exports = { normalizeProduct };
