const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Product = require("../models/model_product");
const dashboardController = require("../controllers/dashboardController");
const router = express.Router();

router.get("/product/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();

    if (!productCount) {
      return res.status(404).json({ success: false });
    }
    console.log(productCount);

    return res.status(200).json({ productCount: productCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/user/count", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    if (!usersCount) {
      return res.status(404).json({ success: false });
    }
    console.log(usersCount);

    return res.status(200).json({ usersCount: usersCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

router.get("/fetch", dashboardController.fetch);

module.exports = router;
