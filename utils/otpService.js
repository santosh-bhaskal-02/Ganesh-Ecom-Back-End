const dotenv = require("dotenv");
const sendEmail = require("../config/config_brevo");

dotenv.config();
const otpStore = {}; // Consider replacing with a DB like Redis for persistence.

async function sendOTP(email) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    otpStore[email] = { otp, otpExpires };

    console.log("Stored OTPs:", otpStore);

    // const emailSent = await sendEmail(
    //   email,
    //   "Your OTP Code",
    //   `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    // );

    // if (!emailSent) {
    //   return { success: false, message: "Failed to send OTP" };
    // }

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Internal Server Error" };
  }
}

async function verifyOTP(email, otp) {
  try {
    const storedOtpData = otpStore[email];

    if (!storedOtpData) {
      return { success: false, message: "OTP not found or expired" };
    }

    if (storedOtpData.otp !== otp) {
      return { success: false, message: "Invalid OTP" };
    }

    if (Date.now() > storedOtpData.otpExpires) {
      delete otpStore[email]; // Remove expired OTP
      return { success: false, message: "OTP expired" };
    }

    delete otpStore[email]; // Remove OTP after successful verification
    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, message: "Internal Server Error" };
  }
}

module.exports = { sendOTP, verifyOTP };
