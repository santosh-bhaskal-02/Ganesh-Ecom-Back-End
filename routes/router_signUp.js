const express = require("express");
const User = require("../models/model_user");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/", authController.register);

router.post("/send_otp", authController.sendSignupOTP);

router.post("/verify_otp", authController.verifyOTP);

router.post("/add_address/:id", authController.addAddress);

router.post("/address/:id", authController.getAddress)

module.exports = router;
