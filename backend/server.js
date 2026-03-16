import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import urlRoutes from "./routes/url.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

console.log("✅ Environment loaded");
console.log("🔗 Attempting to connect to MongoDB...");

const app = express();

/* ---------------- CORS FIX ---------------- */
/* Allow all origins (safe for now until frontend deploy) */
app.use(cors());

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());

/* ---------------- HEALTH CHECK ROUTE ---------------- */
/* This lets Render know the API is running */
app.get("/", (req, res) => {
  res.send("🚀 URL Shortener API is running");
});

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/", urlRoutes);

console.log("📍 Routes registered");

/* ---------------- DATABASE CONNECTION ---------------- */
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });

console.log("⏳ Waiting for MongoDB connection...");