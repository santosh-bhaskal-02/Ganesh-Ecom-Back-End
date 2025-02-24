const express = require("express");
const User = require("../models/model_user");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/", authController.register);

router.post("/send_otp", authController.sendSignupOTP);

router.post("/verify_otp", authController.verifyOTP);

router.post("/add_address/:id", async (req, res) => {
  const userId = req.params.id;
  // console.log( req.body.addressDetails.lastName);
  const {
    firstName,
    lastName,
    email,
    phone,
    address1,
    address2,
    city,
    state,
    zip,
    country,
  } = req.body.addressDetails;

  console.log(req.body.addressDetails.country);

  if (!userId) {
    return res.status(400).json({ success: false, message: "UserId Field is required" });
  }

  try {
    const existingUser = await User.find({ id: userId });
    // console.log(existingUser);
    if (!existingUser) {
      return res.status(409).json({
        success: false,
        message: "User not exists, Try logging in.",
      });
    }

    const addAddress = await User.findByIdAndUpdate(
      userId,
      {
        address: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          address1: address1,
          address2: address2,
          city: city,
          state: state,
          zip: zip,
          country: country,
        },
      },
      {
        new: true,
      }
    );

    //console.log(addAddress);

    if (!addAddress) {
      return res.json({
        success: false,
        message: "Error occured Adding address",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Address added Successfully..!", addAddress });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while adding the address.",
    });
  }
});

router.post("/address/:id", async (req, res) => {
  const userId = req.params.id;

  console.log(userId);

  if (!userId) {
    return res.status(400).json({ success: false, message: "UserId Field is required" });
  }

  try {
    const existingUser = await User.findById(userId);

    console.log(existingUser);

    if (!existingUser) {
      return res.status(409).json({
        success: false,
        message: "User not exists, Try logging in.",
      });
    }

    res.status(200).json({ success: true, address: existingUser.address });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
