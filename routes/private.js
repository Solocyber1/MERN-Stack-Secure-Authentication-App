const express = require("express");
const { getPrivateData, updateProfile } = require("../controllers/private");
const { protect } = require("../middleware/auth");
const csrfProtection = require("../middleware/csrf");

const router = express.Router();

router.route("/").get(protect, getPrivateData);

// ✅ Add this for profile update
router.post("/update-profile", protect, csrfProtection, updateProfile);

module.exports = router;
