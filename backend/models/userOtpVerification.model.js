import mongoose from "mongoose";

const userOTPVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET", "TWO_FACTOR_AUTH"],
    default: "EMAIL_VERIFICATION",
    required: true,
  },
});

const UserOTPVerification = mongoose.model(
  "UserOTPVerification",
  userOTPVerificationSchema
);

export default UserOTPVerification;
