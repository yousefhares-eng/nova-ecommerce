const Product = require('../models/Product');
const sampleProducts = require('../utils/sampleProducts');

const legacySampleProducts = [
  {
    name: 'NOVA Classic Tee',
    description: 'Premium cotton t-shirt with classic fit.',
    price: 29.99,
    compareAtPrice: 39.99,
    category: 't-shirts',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1503341504253-dff48f6fbe6e?auto=format&fit=crop&w=900&q=85',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    stock: 50,
    featured: true,
  },
  {
    name: 'NOVA Hoodie',
    description: 'Cozy hoodie with front pocket and branded logo.',
    price: 59.99,
    category: 'hoodies',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=85',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Black'],
    stock: 30,
  },
  {
    name: 'NOVA Cargo Pants',
    description: 'Relaxed fit cargo pants with multiple pockets.',
    price: 69.99,
    category: 'pants',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Olive', 'Black'],
    stock: 20,
  },
  {
    name: 'NOVA Cap',
    description: 'Adjustable cotton cap with embroidered logo.',
    price: 19.99,
    category: 'accessories',
    images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85'],
    stock: 100,
  },
  {
    name: 'NOVA Bomber Jacket',
    description: 'Lightweight bomber jacket with ribbed cuffs.',
    price: 99.99,
    category: 'outerwear',
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
    stock: 10,
    featured: true,
  },
  {
    name: 'NOVA Socks (3-pack)',
    description: 'Comfortable crew socks in a 3-pack.',
    price: 12.99,
    category: 'accessories',
    images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=900&q=85'],
    stock: 200,
  },
  {
    name: 'NOVA Oversized Tee',
    description: 'Streetwear oversized tee with dropped shoulders.',
    price: 34.99,
    category: 't-shirts',
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85'],
    sizes: ['L', 'XL', 'XXL'],
    stock: 40,
  },
  {
    name: 'NOVA Track Pants',
    description: 'Slim tapered track pants with elastic waist.',
    price: 49.99,
    category: 'pants',
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85'],
    sizes: ['S', 'M', 'L'],
    stock: 25,
  },
  {
    name: 'NOVA Beanie',
    description: 'Knitted beanie with subtle logo tag.',
    price: 14.99,
    category: 'accessories',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85'],
    stock: 80,
  },
  {
    name: 'NOVA Denim Jacket',
    description: 'Classic denim jacket with modern cut.',
    price: 119.99,
    category: 'outerwear',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85'],
    sizes: ['M', 'L', 'XL'],
    stock: 8,
  },
];

exports.seedProducts = async (req, res) => {
  try {
    const operations = sampleProducts.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true,
      },
    }));
    const result = await Product.bulkWrite(operations);
    res.json({ success: true, created: result.upsertedCount || 0, updated: result.modifiedCount || 0 });
  } catch (err) {
    console.error('Seed products error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
