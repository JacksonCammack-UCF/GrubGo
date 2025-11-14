import express from "express";
import { verifyEmailOTP, verify2FAOTP, requestPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

// Verify email after signup
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const result = await verifyEmailOTP({ userId, otp });
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Error verifying email OTP." });
  }
});

// Verify 2FA OTP after login
router.post("/verify-2fa-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const result = await verify2FAOTP({ userId, otp });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Error verifying 2FA OTP." });
  }
});

// Request password reset OTP
router.post("/request-password-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const data = await requestPasswordResetOTP({ email });
    return res.status(200).json({
      success: true,
      message: "Password reset OTP email sent!",
      data: { userId: data.userId, email: data.email },
    });
  } catch (error) {
    return res.status(400).json({success: false,message: error.message || "Error requesting password reset OTP."});
  }
});

// Verify password reset OTP (get reset token)
router.post("/verify-password-reset-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const result = await verifyPasswordResetOTP({ userId, otp });
    return res.status(200).json({
      success: true,
      message: result.message,
      data: { password_reset_token: result.password_reset_token },
    });
  } catch (error) {
    return res.status(400).json({success: false, message: error.message || "Error verifying password reset OTP."});
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { password_reset_token, newPassword } = req.body;
    const result = await resetPassword({ password_reset_token, newPassword });
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({success: false, message: error.message || "Error resetting password."});
  }
});

export default router;
