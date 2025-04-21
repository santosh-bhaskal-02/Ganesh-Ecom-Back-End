const dotenv = require("dotenv");
const sendEmail = require("../config/config_brevo");

dotenv.config();
const otpStore = {};

async function sendOTP(email) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    otpStore[email] = { otp, otpExpires };

    console.log("Stored OTPs:", otpStore);

    const emailSent = await sendEmail(
      email,
      "Your OTP Code",
      `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    );

    if (!emailSent) {
      return { success: false, message: "Failed to send OTP" };
    }

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Internal Server Error" };
  }
}

async function verifyOTP(email, otp) {
  try {
    if (!email || !otp) {
      return { success: false, message: "OTP not found or expired" };
    }
    const storedOtpData = otpStore[email];
    console.log("Received OTP verification request:", email, otp);

    //console.log("36", otp, storedOtpData.otp);
    if (!storedOtpData) {
      return { success: false, message: "OTP not found or expired" };
    }
    // console.log("40", storedOtpData.otp !== otp);
    // console.log("41", String(storedOtpData.otp) !== String(otp));
    if (String(storedOtpData.otp) !== String(otp)) {
      return { success: false, message: "Invalid OTP" };
    }

    if (Date.now() > storedOtpData.otpExpires) {
      delete otpStore[email];
      return { success: false, message: "OTP expired" };
    }

    delete otpStore[email];
    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, message: "Internal Server Error" };
  }
}

module.exports = { sendOTP, verifyOTP };
