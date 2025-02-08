const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/model_user");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
const Admin = require("../models/model_admin");

const router = express.Router();
env.config();
const secret = process.env.JWT_SECRET;
const saltRounds = 10;
//console.log("SECRET", secret);

router.post("/", async (req, res) => {
  //console.log(req.body.name);
  const { firstName, lastName, email, phone, password } = req.body;

  if (!firstName || !lastName || !email || !phone || !password) {
    res.status(400).json({ success: false, message: "All Fields are required" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email: email });
    // console.log("User Exist :", checkUser);

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Email already exists, Try logging in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    //console.log("Hashed Password:", hash);

    const newAdmin = new Admin({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      password: hashedPassword,
    });

    const createdAdmin = await newAdmin.save();

    if (!createdAdmin) {
      return res.json({
        success: false,
        message: "Error occured Registering User",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Signed Up Successfully...!",
      admin: {
        id: createdAdmin._id,
        name: createdAdmin.firstName,
        email: createdAdmin.email,
        phone: createdAdmin.phone,
      },
    });
  } catch (err) {
    console.error("Error :", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
   console.log(email);
  try {
    const admin = await Admin.findOne({ email }).select("password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    //console.log(user);

    const token = jwt.sign({ userId: admin._id, isAdmin: admin.isadmin }, secret, {
      expiresIn: "1d",
    });

    //console.log("Token :", token);
    if (!token) {
      return res.status(401).json({ message: "Token not generated" });
    }
    return res.status(200).json({
      message: "Login successful",
      user: email,
      userId: admin._id,
      token,
      admin: admin.isadmin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
   
  }
});

router.put("/resetPassword", async (req, res) => {
  const { email, password } = req.body;
  console.log("Email :", email);

  try {
    const admin = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully!",
      email,
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

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

router.get("/userlist", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

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
