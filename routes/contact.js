const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validate,
  contactController.submit
);

module.exports = router;
