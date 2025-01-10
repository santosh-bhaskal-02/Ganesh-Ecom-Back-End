const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/model_user");
const jwt = require("jsonwebtoken");
const env = require("dotenv");

const router = express.Router();
env.config();
const secret = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isadmin },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: user.email,
      userId: user._id,
      token,
      admin: user.isadmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get a particular user
router.get("/userlist/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get all users
router.get("/userlist", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Login user


// Delete user
router.delete("/delete/:id", async (req, res) => {
  try {
    const response = await User.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
});

module.exports = router;
