/**
 * Order routes: create, my orders, get by id
 */

const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const shippingAddressValidation = [
  body('shippingAddress.name').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zip').trim().notEmpty().withMessage('ZIP code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
];

const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  ...shippingAddressValidation,
];

// Create order: optional auth (guest checkout). Email required if not logged in.
router.post('/', optionalAuth, createOrderValidation, orderController.create);

// My orders & get by id require auth
router.get('/', protect, orderController.myOrders);
router.get('/:id', protect, orderController.getById);

module.exports = router;
