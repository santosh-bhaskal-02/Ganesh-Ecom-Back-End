const express = require("express");
const dotenv = require("dotenv");

const authController = require("../controllers/authController");

dotenv.config();
const router = express.Router();

router.post("/authenticate", authController.login);

router.post("/send_otp", authController.sendResetOTP);

router.post("/verify_otp", authController.verifyOTP);

router.put("/resetPassword", authController.resetPassword);

router.delete("/delete/:id", authController.deleteUser);

router.get("/userlist/:id", authController.userbyId);

router.get("/userlist", authController.userList);

module.exports = router;
