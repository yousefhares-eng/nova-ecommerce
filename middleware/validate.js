/**
 * Validation middleware – run after express-validator,
 * return 400 if validation failed
 */

const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = validate;
