const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/model_user");
const sendEmail = require("../config/config_brevo");

dotenv.config();
const router = express.Router();
const secret = process.env.JWT_SECRET;
const saltRounds = 10;

router.post("/authenticate", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("password isadmin");
    if (!user) return res.status(401).json({ message: "Invalid email" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isadmin }, secret, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Login successful",
      user: email,
      userId: user._id,
      token,
      admin: user.isadmin,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});
const otpStore = {}; // Object to store OTPs temporarily

router.post("/send_otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Generate OTP and expiration time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

    // Store OTP locally
    otpStore[email] = { otp, otpExpires };

    console.log("Stored OTPs:", otpStore);

    // Send email
    const emailSent = await sendEmail(
      email,
      "Your OTP Code",
      `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    );

    if (emailSent) {
      return res.status(200).json({ message: "OTP sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/verify_otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOtpData = otpStore[email];

    // Check if OTP exists and has not expired
    if (
      !storedOtpData ||
      storedOtpData.otp !== otp ||
      Date.now() > storedOtpData.otpExpires
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Remove OTP after verification
    delete otpStore[email];

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/resetPassword", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and new password are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User with this email does not exist." });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/userlist/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/userlist", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const response = await User.findByIdAndDelete(req.params.id);
    if (!response)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
