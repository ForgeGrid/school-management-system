import express from "express";
import {
  inviteUser,
  acceptInvitation,
  getPendingInvitations,
  revokeInvitation,
  getInvitationDetails
} from "../controller/invitation.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js"

const router = express.Router();

const authManagement = [authMiddleware, requireRole("school_admin")];
const schoolManagement = [requireVerifiedSchool];

router.post("/invite", ...authManagement, ...schoolManagement, inviteUser);
router.get("/details/:token", authMiddleware, getInvitationDetails);
router.post("/accept", authMiddleware, acceptInvitation);

// Invitation Management
router.get("/pending", ...authManagement, getPendingInvitations);
router.delete("/:invitationId", ...authManagement, revokeInvitation);

export default router;