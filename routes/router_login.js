const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/model_user");
const jwt = require("jsonwebtoken");
const env = require("dotenv");

const router = express.Router();
env.config();
const secret = process.env.secret;

// get particular User
router.get("/userlist/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  res.status(200).send(user);
});

//get User List
router.get("/userlist", async (req, res) => {
  const user = await User.find().select("-password");

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  res.status(200).send(user);
});

//login details
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  // console.log(email);
  try {
    const user = await User.findOne({ email: email });
    //console.log(user.password);
    if (!user) {
      return res.status(400).json({ message: "User Not Found !" });
    }

    const result = await bcrypt.compare(password, user.password);
    //console.log(user.isadmin);
    if (user && result) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isadmin,
        },
        secret,
        {
          expiresIn: "1d",
        }
      );
      return res.status(200).json({
        message: "Sign In Successful.....!",
        user: user.email,
        userId: user._id,
        token: token,
        admin: user.isadmin,
      });
    } else {
      return res.status(400).json({ message: "Password is incorrect !" });
    }
  } catch (error) {
    return res.status(401).json({ message: error });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const response = await User.findByIdAndDelete(id);
    console.log(response);
    if (!response) {
      return res.status(400).json({ Success: false, message: "User is not Deleted..!" });
    }
    return res.status(200).json({ Success: true, message: "User is Deleted..!" });
  } catch (err) {
    return res.status(400).json({ Success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
