import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    updateProfile,
    requestPasswordOTP,
    verifyPasswordOTP,
    unlinkSchool,
    updateAvatar
} from "../controller/profile.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.put("/update", updateProfile);
router.patch("/avatar", upload.single("avatar"), updateAvatar);
router.post("/password/otp-request", requestPasswordOTP);
router.post("/password/otp-verify", verifyPasswordOTP);
router.delete("/unlink-school", unlinkSchool);

export default router;
