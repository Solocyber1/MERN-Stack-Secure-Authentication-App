
const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');
const csrfProtection = require('../middleware/csrf');

const router = express.Router();

// Apply CSRF protection to POST and PUT routes
router.route('/register').post(csrfProtection, register);
router.route('/login').post(csrfProtection, login);
router.route('/forgotPassword').post(csrfProtection, forgotPassword);
router.route('/resetPassword/:resetToken').put(csrfProtection, resetPassword);

module.exports = router;
