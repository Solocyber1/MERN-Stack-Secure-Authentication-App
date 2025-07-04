const express = require("express");
const csrf = require("csurf");

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/csrf-token", csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

module.exports = router;
