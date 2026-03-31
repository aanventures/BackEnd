const express = require("express");
const cors = require("cors");
// Routes
const userRoutes = require("./routes/user.route");
const propertyRoutes = require("./routes/property.route");
const blogRoutes = require("./routes/blog.route");
const FlightRoutes = require("./routes/flight.route")
const cookieParser = require("cookie-parser");
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://tripaango-frontend.netlify.app",
];


const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};

// 2. Use CORS middleware before your routes
app.use(cors(corsOptions)); 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/flight", FlightRoutes)


// 4. 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  // If it's a CORS error, we might want a specific status
  const statusCode = err.message.includes("CORS") ? 403 : err.status || 500;

  console.error(`[Error]: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
