const express = require('express');
const csrf = require('csurf');
const logger = require('../config/winston');

const router = express.Router();

// Don't apply csrfProtection here — just use `req.csrfToken()` to generate a new one
router.get('/', (req, res, next) => {
  try {
    const token = req.csrfToken(); // Generates and sets the token in cookie
    res.status(200).json({ csrfToken: token });
  } catch (err) {
    logger.error(`CSRF token error: ${err.message}`);
    next(err);
  }
});

module.exports = router;
