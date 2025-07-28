require('dotenv').config();
const mongoose = require('mongoose');
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

const app = express();
app.set('trust proxy', 1);
app.disable("x-powered-by");

// ✅ Remove "Server" header
app.use((req, res, next) => {
  res.removeHeader("Server");
  next();
});

// ✅ Prevent caching of sensitive routes
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS Config
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "https://yourdomain.com",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

// ✅ Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://apis.google.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "http://localhost:3000"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(helmet.noSniff());

// ✅ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", apiLimiter);

// ✅ Connect DB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!!"))
  .catch((err) => console.error("MongoDB error:", err));

// ✅ CSRF Middleware Setup (must come AFTER cookieParser)
const csrfProtection = csrf({ cookie: true });

// ✅ Route to get CSRF token (apply csrfProtection middleware here)
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

// ✅ Apply routes
app.use("/api/auth", require("./routes/auth")); // These routes apply csrf individually inside auth.js
const { protect } = require("./middleware/auth");
app.use("/api/private", protect, require("./routes/private"));

app.use("/api/soap", (req, res) => {
  res.status(404).json({ error: "Not found" });
});


// ✅ Production Deployment
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet.hsts({
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    })
  );

  app.use(express.static(path.join(__dirname, "./client/build")));

  app.get("*", (req, res) => {
    return res.sendFile(
      path.resolve(__dirname, "client", "build", "index.html")
    );
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}

// ✅ Error Handler
app.use(errorHandler);

// ✅ Start Server
const server = app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}`)
);

// ✅ Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err.message}`);
  server.close(() => process.exit(1));
});
