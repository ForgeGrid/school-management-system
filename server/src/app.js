import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";

import authRoutes from "./routes/auth.routes.js";
import schoolRoutes from "./routes/school.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";

// import profileRoutes from "./routes/profile.routes.js";
import staffProfileRoutes from "./routes/staffProfile.routes.js";
import studentRoutes from "./routes/student.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";
import busRouteRoutes from "./routes/busRoute.routes.js";
import transportFeeStructureRoutes from "./routes/transportFeeStructure.routes.js";
import studentFeePlanRoutes from "./routes/studentFeePlan.routes.js";
import academicFeeStructureRoutes from "./routes/academicFeeStructure.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import classSectionRoutes from "./routes/classSection.routes.js";
import studentEnrollmentRoutes from "./routes/studentEnrollment.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(compression());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cookieParser());

// ─── CORS ─────────────────────────────────────────────────────────────────
// All origins are configured via environment variables — no hardcoded URLs.
// Set FRONTEND_URL on Vercel dashboard to your deployed frontend origin.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  "https://school-management-system-alpha-two.vercel.app/",
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Clean the origin (remove trailing slash)
    const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
    const cleanAllowed = allowedOrigins.map((o) => (o.endsWith("/") ? o.slice(0, -1) : o));

    if (
      cleanAllowed.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Handle OPTIONS preflight explicitly (required for Vercel serverless)
// Note: Express 5 requires explicit wildcard syntax — bare * is not valid.
app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
// Note: /uploads static route removed — all files are served from Cloudinary.

app.use("/api/v0/auth", authRoutes);
app.use("/api/v0/school", schoolRoutes);
app.use("/api/v0/invitation", invitationRoutes);
app.use("/api/v0/staff-profile", staffProfileRoutes);
app.use("/api/v0/student-profile", studentRoutes);
app.use("/api/v0/notifications", notificationRoutes);
app.use("/api/v0/superadmin", superAdminRoutes);
app.use("/api/v0/bus-route", busRouteRoutes);
app.use("/api/v0/transport-fee-structure", transportFeeStructureRoutes);
app.use("/api/v0/student-fee-plan", studentFeePlanRoutes);
app.use("/api/v0/academic-fee-structure", academicFeeStructureRoutes);
app.use("/api/v0/attendance", attendanceRoutes);
app.use("/api/v0/class-section", classSectionRoutes);
app.use("/api/v0/student-enrollment", studentEnrollmentRoutes);



app.get("/api/v0/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
