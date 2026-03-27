import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import patientRoutes from "./routes/patients";
import doctorRoutes from "./routes/doctors";
import appointmentRoutes from "./routes/appointments";
import xrayRoutes from "./routes/xrays";
import serviceRoutes from "./routes/services";
import adminRoutes from "./routes/admin";
import { errorHandler, notFound } from "./middleware/error";
import { ensureBuckets } from "./lib/supabase";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:7407",
    /\.runable\.site$/,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Rate limiting ────────────────────────────────────────────────────────
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: "Too many auth requests, please try again later" },
}));
app.use("/api", rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 200,
}));

// ─── Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "andreasyan-dental-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/xrays", xrayRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 + Error handling ─────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────
async function start() {
  try {
    // Ensure Supabase storage buckets exist
    await ensureBuckets();
    app.listen(PORT, () => {
      console.log(`\n🦷 Andreasyan Dental API`);
      console.log(`✅ Running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🗄️  Database: Neon PostgreSQL`);
      console.log(`🪣  Storage: Supabase\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err);
    process.exit(1);
  }
}

start();
