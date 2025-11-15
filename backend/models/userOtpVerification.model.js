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
    index: { expireAfterSeconds: 0 }
  },
  purpose: {
    type: String,
    enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET", "TWO_FACTOR_AUTH"],
    default: "EMAIL_VERIFICATION",
    required: true,
  },
  attempts: {
    type: Number,
    required: false,
    default: 0,
  },
});

userOTPVerificationSchema.index({ userId: 1, purpose: 1 });

const UserOTPVerification = mongoose.model(
  "UserOTPVerification",
  userOTPVerificationSchema
);

export default UserOTPVerification;
