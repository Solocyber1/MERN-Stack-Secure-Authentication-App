require('dotenv').config();
const mongoose = require('mongoose');
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

const app = express();
app.disable("x-powered-by");
// ✅ Remove the "Server" header completely
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!!"))
  .catch((err) => console.error("MongoDB error:", err));

// Middleware
app.use(express.json());
app.use(cookieParser());
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",        // ✅ dev frontend
  "https://yourdomain.com",       // ✅ production frontend (replace this!)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman or whitelisted origins
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://apis.google.com"], // Add others as needed
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

connectDB(); // Connect to database

// ✅ CSRF Token Route
app.use("/api", require("./routes/csrf"));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));

// --------------------------DEPLOYMENT------------------------------
if (process.env.NODE_ENV === "production") {
  // ✅ Enforce HSTS in production only
  app.use(
    helmet.hsts({
      maxAge: 63072000, // 2 years
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

// --------------------------DEPLOYMENT------------------------------

// Error Handler Middleware
app.use(errorHandler);

const server = app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}`)
);

// Graceful error handling
process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err.message}`);
  server.close(() => process.exit(1));
});
