export const generateOTP = () => {
  // random six-digit OTP
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  return otp;
};
