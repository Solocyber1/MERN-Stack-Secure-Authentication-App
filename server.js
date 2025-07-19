require('dotenv').config();
const mongoose = require('mongoose');
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit"); 

dotenv.config({ path: "./.env" });

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

const app = express();
app.set('trust proxy', 1);
app.disable("x-powered-by");

//  Remove "Server" header
app.use((req, res, next) => {
  res.removeHeader("Server");
  next();
});

//  Prevent caching of sensitive routes
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const PORT = process.env.PORT || 5000;

//  Rate Limiting Middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // 100 requests per 15 minutes per IP
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", apiLimiter);  //  Apply limiter to all /api routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!!"))
  .catch((err) => console.error("MongoDB error:", err));

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",        // dev frontend
  "http://127.0.0.1:3000",
  "http://localhost:5000",	
  "https://yourdomain.com",       // production frontend
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

// ✅ Security Headers via Helmet
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

connectDB();

// ✅ CSRF Token Route
app.use("/api", require("./routes/csrf"));

// API Routes
app.use("/api/auth", require("./routes/auth"));

const { protect } = require("./middleware/auth");
app.use("/api/private", protect, require("./routes/private"));

// ✅ Deployment (with HSTS in production)
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

// Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err.message}`);
  server.close(() => process.exit(1));
});
