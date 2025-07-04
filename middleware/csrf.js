const csrf = require("csurf");

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: false,
    secure: false,
    sameSite: "lax"
  }
});

module.exports = csrfProtection;
