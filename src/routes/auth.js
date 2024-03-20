import express from "express";
import {
  signUpUser,
  signInUser,
  getUser,
  updateUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";

import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// User Routes
router
  .route("/")
  .get(auth, getUser)
  .patch(auth, updateUser)
  .all(methodNotAllowed);
router.route("/signup").post(signUpUser).all(methodNotAllowed);
router.route("/signin").post(signInUser).all(methodNotAllowed);
router.route("/send-otp").post(sendOTP).all(methodNotAllowed);
router.route("/verify-otp").post(verifyOTP).all(methodNotAllowed);
router.route("/forgot-password").post(forgotPassword).all(methodNotAllowed);
router.route("/reset-password").post(resetPassword).all(methodNotAllowed);

export default router;
