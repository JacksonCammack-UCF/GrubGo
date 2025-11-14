import jwt from "jsonwebtoken";
import UserOTPVerification from "../models/userOtpVerification.model.js";
import User from "../models/user.model.js";

import { generateOTP } from "../utils/generateOTP.js";
import { hashData, verifyHashedData } from "../utils/hashData.js";
import { sendEmail } from "../utils/sendEmail.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// 1. Generic OTP sender used by signup, login, password reset
export const sendOTPVerificationEmail = async ({ _id, email, purpose = "EMAIL_VERIFICATION" }) => {
  try {
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

    const records = await UserOTPVerification.find({
      userId,
      purpose: "EMAIL_VERIFICATION",
    });

    if (!records.length) {
      throw new Error(
        "Account record doesn't exist or has been verified already. Please request again."
      );
    }

    const { expiresAt, otp: hashedOTP } = records[0];

    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({
        userId,
        purpose: "EMAIL_VERIFICATION",
      });
      throw new Error("OTP has expired. Please request a new one.");
    }

    const isMatch = await verifyHashedData(otp, hashedOTP);
    if (!isMatch) {
      throw new Error(
        "Invalid OTP. Please check your inbox and try again."
      );
    }

    await User.updateOne({ _id: userId }, { isEmailVerified: true });
    await UserOTPVerification.deleteMany({
      userId,
      purpose: "EMAIL_VERIFICATION",
    });

    return { message: "Email OTP verified successfully!" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 3. Verify 2FA OTP (after login)
export const verify2FAOTP = async ({ userId, otp }) => {
  try {
    if (!userId || !otp) {
      throw new Error("Empty OTP details are not allowed!");
    }

    const records = await UserOTPVerification.find({
      userId,
      purpose: "TWO_FACTOR_AUTH",
    });

    if (!records.length) {
      throw new Error(
        "Account record doesn't exist or has been verified already. Please request again."
      );
    }

    const { expiresAt, otp: hashedOTP } = records[0];

    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({
        userId,
        purpose: "TWO_FACTOR_AUTH",
      });
      throw new Error("OTP has expired. Please request a new one.");
    }

    const isMatch = await verifyHashedData(otp, hashedOTP);
    if (!isMatch) {
      throw new Error(
        "Invalid OTP. Please check your inbox and try again."
      );
    }

    await UserOTPVerification.deleteMany({
      userId,
      purpose: "TWO_FACTOR_AUTH",
    });

    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found!");
    }

    return { message: "2FA OTP verified successfully!", data: user };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 4. Request password reset OTP
export const requestPasswordResetOTP = async ({ email }) => {
  try {
    if (!email) {
      throw new Error("Email is required!");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User with given email doesn't exist!");
    }

    await sendOTPVerificationEmail({
      _id: user._id,
      email: user.email,
      purpose: "PASSWORD_RESET",
    });

    return {
      userId: user._id,
      email: user.email,
      purpose: "PASSWORD_RESET",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 5. Verify password reset OTP (returns reset token)
export const verifyPasswordResetOTP = async ({ userId, otp }) => {
  try {
    if (!userId || !otp) {
      throw new Error("Empty OTP details are not allowed!");
    }

    const records = await UserOTPVerification.find({
      userId,
      purpose: "PASSWORD_RESET",
    });

    if (!records.length) {
      throw new Error(
        "Account record doesn't exist or no reset request found or it has already been used. Please request a new password reset."
      );
    }

    const { expiresAt, otp: hashedOTP } = records[0];

    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({
        userId,
        purpose: "PASSWORD_RESET",
      });
      throw new Error("OTP has expired. Please request a new one.");
    }

    const isMatch = await verifyHashedData(otp, hashedOTP);
    if (!isMatch) {
      throw new Error(
        "Invalid OTP. Please check your inbox and try again."
      );
    }

    const resetToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    await UserOTPVerification.deleteMany({
      userId,
      purpose: "PASSWORD_RESET",
    });

    return {
      message: "Password-reset OTP verified successfully!",
      password_reset_token: resetToken,
    };
  } catch (error) {
    throw new Error(error.message);
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
      payload = jwt.verify(password_reset_token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired password reset token!");
    }

    const userId = payload.userId;
    const hashedNewPassword = await hashData(trimmed);

    await User.updateOne({ _id: userId }, { password: hashedNewPassword });

    return { message: "Password reset successfully!" };
  } catch (error) {
    throw new Error(error.message);
  }
};
