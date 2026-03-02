import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import indexRoutes from "./src/routes/index.js";

dotenv.config(); // ✅ Load environment variables

const app = express();

// Connect to DB
connectDB();

// CORS + Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",                    // keep for local development
    "https://komolafe-and-son.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,                            // important if using cookies / auth headers
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Test route
app.get("/", (req, res) => res.send("Grox backend is running 🚀"));

// Routes
app.use(indexRoutes);

// Start server
app.listen(process.env.PORT || 8080, () => {
  console.log(`✅ Server running on http://localhost:${process.env.PORT || 8080}`);
});
