const express = require("express");
const bcrypt = require("bcryptjs");
const SignupUser = require("../models/model_user");

const router = express.Router();
const saltRounds = 10;

router.post("/", async (req, res) => {
  //console.log(req.body.name);
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    res
      .status(400)
      .json({ success: false, message: "All Fields are required" });
  }

  try {
    const existingUser = await SignupUser.findOne({ email: email });
   // console.log("User Exist :", checkUser);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists, Try logging in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    //console.log("Hashed Password:", hash);

    const newUser = new SignupUser({
      name: name,
      email: email,
      phone: phone,
      password: hashedPassword,
    });

    const createdUser = await newUser.save();

    if (!createdUser) {
      return res.json({
        success: false,
        message: "Error occured Registering User",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Signed Up Successfully...!",
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
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

module.exports = router;
