import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import {
  createSchool,
  getPendingSchools,
  approveSchool,
  rejectSchool,
  reAppealSchool,
  getSchoolStaff,
  getAllSchools,
  getSchoolById,
  getSchoolStaffAdmin,
  removeUserFromSchool,
} from "../controller/school.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { cacheMiddleware, clearCacheMiddleware } from "../middleware/cache.js";


const router = express.Router();

const authSuperAdmin = [authMiddleware, requireSuperAdmin];
const authOwner = [authMiddleware, requireRole("owner", "school_admin")];
const authStandard = [authMiddleware];

// Create school 
router.post("/create", authMiddleware, clearCacheMiddleware("v0/tenant"), upload.single("schoolLogo"), createSchool);


// GET ALL schools (super-admin only)
router.get("/all", ...authSuperAdmin, cacheMiddleware(600), getAllSchools);


// GET single school details (authorized users only)
router.get("/detail/:schoolId", ...authStandard, cacheMiddleware(300), getSchoolById);


// GET targeted school staff (super-admin only)
router.get("/detail/:schoolId/staff", ...authSuperAdmin, getSchoolStaffAdmin);

// Get pending schools (super-admin only)
router.get("/pending", ...authSuperAdmin, getPendingSchools);

// Approve / reject school (super-admin only)
router.patch("/:schoolId/approve", ...authSuperAdmin, clearCacheMiddleware("v0/tenant"), approveSchool);
router.patch("/:schoolId/reject", ...authSuperAdmin, clearCacheMiddleware("v0/tenant"), rejectSchool);

// Re-appeal school (owner/admin)
router.patch("/re-appeal", ...authOwner, clearCacheMiddleware("v0/tenant"), reAppealSchool);


// Get school staff (owner and staff)
router.get("/staff", ...authStandard, requireRole("owner", "school_admin", "staff"), cacheMiddleware(300), getSchoolStaff);

// Remove user from school (owner/admin only)
router.patch("/:userId/remove", ...authOwner, clearCacheMiddleware("v0/tenant"), removeUserFromSchool);


export default router;
