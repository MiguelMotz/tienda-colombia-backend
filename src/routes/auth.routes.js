import { Router } from "express";

import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  updateAddress,
  changePassword
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", requestPasswordReset);

router.post("/reset-password", resetPassword);

/* =========================
   PROFILE
========================= */

router.put("/profile", updateProfile);

router.put("/address", updateAddress);

router.put("/password", changePassword);

export default router;