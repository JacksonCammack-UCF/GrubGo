import jwt from "jsonwebtoken";
import UserOTPVerification from "../models/userOtpVerification.model.js";
import User from "../models/user.model.js";

import { generateOTP } from "../utils/generateOTP.js";
import { hashData, verifyHashedData } from "../utils/hashData.js";
import { sendEmail } from "../utils/sendEmail.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const validateOtpRecord = async ({ record, plainOtp }) => {
  if (!record) {
    throw new Error("OTP record not found. Please request a new code.");
  }

  const attempts = record.attempts ?? 0;
  // Too many failed attempts → lock this OTP
  if (attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many incorrect attempts. Please request a new OTP.");
  }

  const isMatch = await verifyHashedData(plainOtp, record.otp);

  if (!isMatch) {
    record.attempts = attempts + 1;
    await record.save();
    throw new Error("Invalid OTP. Please check your inbox and try again.");
  }

  // If we get here, OTP is valid and attempts stay as-is
};

// 1. Generic OTP sender used by signup, login, password reset
export const sendOTPVerificationEmail = async ({ _id, email, purpose = "EMAIL_VERIFICATION" }) => {
  try {
    const now = Date.now();
    const windowStart = now - OTP_TTL_MS; // 10-minute window

    // Check how many OTPs have been sent in the last 10 minutes
    const recentOtpCount = await UserOTPVerification.countDocuments({userId: _id, purpose, createdAt: { $gte: windowStart }});
    // Limit to 3 OTPs per 10 minutes
    if (recentOtpCount >= 3) {
      throw new Error("Too many OTP requests. Please try again later.");
    }

    const otp = await generateOTP();
    const hashedOTP = await hashData(otp);

    const otpRecord = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + OTP_TTL_MS,
      purpose,
    });

    await otpRecord.save();

    let subject = "Verify Your Email Address";
    let title = "Welcome to GrubGo!";
    let intro = "Your OTP for email verification is:";
    let actionLine = "Use this code to verify your email address.";

    if (purpose === "TWO_FACTOR_AUTH") {
      subject = "Your GrubGo 2FA Code";
      title = "Sign-in Verification";
      intro = "Your 2FA code is:";
      actionLine = "Use this code to complete your sign-in.";
    } else if (purpose === "PASSWORD_RESET") {
      subject = "Reset Your Password";
      title = "Password Reset Request";
      intro = "Your password reset OTP is:";
      actionLine = "Use this code to reset your password.";
    }

    const html = `
      <h2>${title}</h2>
      <h3>${intro} <b>${otp}</b></h3>
      <p>${actionLine}</p>
      <p>This OTP is valid for ${OTP_TTL_MS / 60000} minutes.</p>
      <p style="color: #b22222; font-weight: bold;">Never share this code with anyone. GrubGo will never ask for this code.</p>
    `;

    await sendEmail({ to: email, subject, html });

    return { userId: _id, email, purpose };
  } catch (error) {
    throw new Error("Error sending OTP email verification: " + error.message);
  }
};

// 2. Verify email OTP (after signup)
export const verifyEmailOTP = async ({ userId, otp }) => {
  try {
    if (!userId || !otp) {
      throw new Error("Empty OTP details are not allowed!");
    }

    const record = await UserOTPVerification.findOne({userId, purpose: "EMAIL_VERIFICATION"}).sort({createdAt: -1});

    if (!record) {
      throw new Error("Account record doesn't exist or has been verified already. Please request again.");
    }

    if (record.expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({userId, purpose: "EMAIL_VERIFICATION"});
      const user = await User.findById(userId).select("email");
      if (!user) {
        throw new Error("User not found for resending OTP.");
      }
      const emailData = await sendOTPVerificationEmail({_id: userId, email: user.email, purpose: "EMAIL_VERIFICATION"});
      return { status: "RESEND", message: "OTP has expired. A new OTP has been sent to your email.", data: emailData };
    }

    if(record.attempts >= MAX_OTP_ATTEMPTS){
      await UserOTPVerification.deleteMany({userId, purpose: "EMAIL_VERIFICATION"});
      const user = await User.findById(userId).select("email");
      if (!user) {
        throw new Error("User not found for resending OTP.");
      }
      const emailData = await sendOTPVerificationEmail({_id: userId, email: user.email, purpose: "EMAIL_VERIFICATION"});
      return { status: "RESEND", message: "Too many incorrect attempts. A new OTP has been sent to your email.", data: emailData };
    }
    await validateOtpRecord({ record: record, plainOtp: otp });
    await User.updateOne({ _id: userId }, { isEmailVerified: true });
    await UserOTPVerification.deleteMany({userId, purpose: "EMAIL_VERIFICATION"});
    
    return { message: "Email OTP verified successfully!" };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// 3. Verify 2FA OTP (after login)
export const verify2FAOTP = async ({ userId, otp }) => {
  try {
    if (!userId || !otp) {
      throw new Error("Empty OTP details are not allowed!");
    }

    const record = await UserOTPVerification.findOne({userId,purpose: "TWO_FACTOR_AUTH"}).sort({createdAt: -1});
    if (!record) {
      throw new Error( "Account record doesn't exist or has been verified already. Please request again." );
    }

    if (record.expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({ userId, purpose: "TWO_FACTOR_AUTH" });
      const user = await User.findById(userId).select("email");
      if (!user) {
        throw new Error("User not found for resending OTP.");
      }
      const emailData = await sendOTPVerificationEmail({_id: userId, email: user.email, purpose: "TWO_FACTOR_AUTH"});
      return { status: "RESEND", message: "OTP has expired. A new OTP has been sent to your email.", data: emailData };
    }

    if(record.attempts >= MAX_OTP_ATTEMPTS){
      await UserOTPVerification.deleteMany({userId, purpose: "TWO_FACTOR_AUTH"});
      const user = await User.findById(userId).select("email");
      if (!user) {
        throw new Error("User not found for resending OTP.");
      }      
      const emailData = await sendOTPVerificationEmail({_id: userId, email: user.email, purpose: "TWO_FACTOR_AUTH"});
      return { status: "RESEND", message: "Too many incorrect attempts. A new OTP has been sent to your email.", data: emailData };
    }
    await validateOtpRecord({ record: record, plainOtp: otp });
    await UserOTPVerification.deleteMany({ userId, purpose: "TWO_FACTOR_AUTH"});

    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found!");
    }

    return { message: "2FA OTP verified successfully!", data: user };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// 4. Request password reset OTP
export const requestPasswordResetOTP = async ({ email }) => {
  try {
    if (!email) {
      throw new Error("Email is required!");
    }

    const user = await User.findOne({ email });
    if (user) {
      try{
        await sendOTPVerificationEmail({_id: user._id, email: user.email, purpose: "PASSWORD_RESET"});
      } catch (error) {
        console.error("Error sending password reset OTP:", error);
      }
    }

    // Always return a generic response to prevent user enumeration
    return { message: "If an account with that email exists, a password reset code has been sent." };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// 5. Verify password reset OTP (returns reset token)
export const verifyPasswordResetOTP = async ({ userId, otp }) => {
  try {
    if (!userId || !otp) {
      throw new Error("Empty OTP details are not allowed!");
    }

    const record = await UserOTPVerification.findOne({userId, purpose: "PASSWORD_RESET"}).sort({createdAt: -1});

    if (!record) {
      throw new Error("Account record doesn't exist or no reset request found or it has already been used. Please request a new password reset.");
    }
    if (record.expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({userId, purpose: "PASSWORD_RESET"});
      const user = await User.findById(userId).select("email");
      if (!user) {
        throw new Error("User not found for resending OTP.");
      }
      const emailData = await sendOTPVerificationEmail({_id: userId, email: user.email, purpose: "PASSWORD_RESET"});
      return { status: "RESEND", message: "OTP has expired. A new OTP has been sent to your email.", data: emailData };
    }

    if(record.attempts >= MAX_OTP_ATTEMPTS){
      await UserOTPVerification.deleteMany({userId, purpose: "PASSWORD_RESET"});
      const user = await User.findById(userId).select("email");
      if (!user) {
        throw new Error("User not found for resending OTP.");
      }      
      const emailData = await sendOTPVerificationEmail({_id: userId, email: user.email, purpose: "PASSWORD_RESET"});
      return { status: "RESEND", message: "Too many incorrect attempts. A new OTP has been sent to your email.", data: emailData };
    }
    await validateOtpRecord({ record: record, plainOtp: otp });

    const resetToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "10m" });

    await UserOTPVerification.deleteMany({userId, purpose: "PASSWORD_RESET"});

    return { message: "Password-reset OTP verified successfully!", password_reset_token: resetToken };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// 6. Reset password using reset token
export const resetPassword = async ({ password_reset_token, newPassword }) => {
  try {
    if (!password_reset_token || !newPassword) {
      throw new Error("Empty password details are not allowed!");
    }

    const trimmed = newPassword.trim();
    if (trimmed.length < 8) {
      throw new Error("Password must be at least 8 characters long!");
    }

    let payload;
    try {
      payload = jwt.verify(password_reset_token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired password reset token!");
    }

    const userId = payload.userId;
    const hashedNewPassword = await hashData(trimmed);

    await User.updateOne({ _id: userId }, { password: hashedNewPassword });

    return { message: "Password reset successfully!" };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
