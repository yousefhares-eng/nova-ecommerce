/**
 * Admin routes: dashboard, products CRUD, orders management
 * All require protect + adminOnly
 */

const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', adminController.dashboard);

// Products
router.get('/products', adminController.listProducts);
router.post(
  '/products',
  upload.array('images', 10),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  ],
  validate,
  adminController.createProduct
);
router.put(
  '/products/:id',
  upload.array('images', 10),
  [
    body('name').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  adminController.updateProduct
);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/:id/images', upload.array('images', 10), adminController.uploadProductImages);

// Orders
router.get('/orders', adminController.listOrders);
router.get('/orders/:id', adminController.getOrder);
router.patch(
  '/orders/:id/status',
  [body('status').trim().notEmpty().withMessage('Status is required')],
  validate,
  adminController.updateOrderStatus
);

module.exports = router;
