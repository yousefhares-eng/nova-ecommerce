/**
 * Seed script: create an admin user and sample products if they do not exist.
 * Run: node scripts/seed-admin.js
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, or use defaults below.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nova.style';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

const SAMPLE_PRODUCTS = [
  {
    name: 'NOVA Essential Hoodie',
    description: 'Heavyweight cotton hoodie with a relaxed fit and embroidered NOVA mark.',
    price: 64.99,
    compareAtPrice: 79.99,
    category: 'hoodies',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Stone'],
    stock: 24,
    featured: true,
    active: true,
  },
  {
    name: 'Signal Box Tee',
    description: 'Soft heavyweight t-shirt with a bold back graphic and ribbed collar.',
    price: 29.99,
    category: 't-shirts',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Charcoal'],
    stock: 48,
    featured: true,
    active: true,
  },
  {
    name: 'Transit Cargo Pant',
    description: 'Tapered utility pants with articulated knees and six practical pockets.',
    price: 74.5,
    category: 'pants',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'],
    sizes: ['30', '32', '34', '36'],
    colors: ['Olive', 'Black'],
    stock: 17,
    featured: false,
    active: true,
  },
  {
    name: 'Orbit Coach Jacket',
    description: 'Lightweight water-resistant jacket made for changing city weather.',
    price: 94.99,
    compareAtPrice: 119.99,
    category: 'outerwear',
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Rust'],
    stock: 9,
    featured: true,
    active: true,
  },
  {
    name: 'NOVA Everyday Cap',
    description: 'Six-panel cotton cap with an adjustable strap and subtle front embroidery.',
    price: 24,
    category: 'accessories',
    images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80'],
    sizes: ['OS'],
    colors: ['Black', 'Cream'],
    stock: 31,
    featured: false,
    active: true,
  },
  {
    name: 'Afterdark Crewneck',
    description: 'Clean everyday crewneck with brushed fleece lining and tonal branding.',
    price: 54,
    category: 'streetwear',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Graphite'],
    stock: 0,
    featured: false,
    active: true,
  },
  {
    name: 'Studio Tote',
    description: 'Durable canvas tote with an interior laptop sleeve and screen-printed logo.',
    price: 19.5,
    category: 'other',
    images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80'],
    sizes: ['OS'],
    colors: ['Natural'],
    stock: 13,
    featured: false,
    active: true,
  },
  {
    name: 'Archive Track Top',
    description: 'Sample archived track top retained for testing inactive products in admin.',
    price: 44.99,
    category: 'outerwear',
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80'],
    sizes: ['M', 'L'],
    colors: ['Red'],
    stock: 6,
    featured: false,
    active: false,
  },
];

async function run() {
  try {
    await connectDB();
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin user already exists:', existing.email);
    } else {
      const admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('Admin user created:', admin.email);
    }

    let createdProducts = 0;
    for (const productData of SAMPLE_PRODUCTS) {
      const productExists = await Product.exists({ name: productData.name });
      if (!productExists) {
        await Product.create(productData);
        createdProducts += 1;
      }
    }
    console.log(`Sample products ready: ${createdProducts} created, ${SAMPLE_PRODUCTS.length - createdProducts} already existed.`);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
