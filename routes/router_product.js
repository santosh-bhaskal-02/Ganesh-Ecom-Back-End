const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Product = require("../models/model_product");
const uploadtoCloudinary = require("../utils/utils_cloudinary_upload");
const deletetoCloudinary = require("../utils/utils_cloudinary_delete");

//multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title, price, stock, category, description } = req.body;

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({ message: "Invalid Category" });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const { img_url, public_id } = await uploadtoCloudinary(req.file.buffer);
    console.log(public_id);
    const product = new Product({
      title,
      thumbnail: {
        image_url: img_url,
        public_id: public_id,
      },
      price,
      stock,
      category,
      reachDisciption: description,
    });

    const createdProduct = await product.save();
    if (!createdProduct) {
      return res.status(400).json({
        success: false,
        message: "product is not added",
      });
    }
    return res.status(201).json(createdProduct);
  } catch (err) {
    console.error("Error saving product:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    console.log(deletedProduct);
    //console.log(deletedProduct.thumbnail.public_id);
    if (!deletedProduct) {
      return res
        .status(400)
        .json({ Success: false, message: "Product is not Deleted..!" });
    }

    const response = await deletetoCloudinary(
      deletedProduct.thumbnail.public_id
    );
    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: "Product is not Deleted..!" });
    }
    return res
      .status(200)
      .json({ Success: true, message: "Product is Deleted..!" });
  } catch (err) {
    res.status(400).json({ Success: false, message: err.message });
  }
});

router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const { title, price, stock, category, description } = req.body;
    //console.log("Request body:", req.body.title);

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const oldProduct = await Product.findById(productId);
    const response = await deletetoCloudinary(oldProduct.thumbnail.public_id);
    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: "Product is not Deleted..!" });
    }

    const { img_url, public_id } = await uploadtoCloudinary(req.file.buffer);
    //console.log(public_id);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        thumbnail: {
          image_url: img_url,
          public_id: public_id,
        },
        price,
        stock,
        category,
        reachDisciption: description,
      },
      {
        new: true,
      }
    );

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: "product is not added",
      });
    }
    return res.status(201).json(updatedProduct);
  } catch (err) {
    console.error("Error saving product:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const productList = await Product.find().populate("category");
    if (!productList) {
      res.status(500).json({
        success: false,
      });
    }
    res.send(productList);
    //console.log(productList);
  } catch (err) {
    console.log("Server error", err);
    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    mongoose.isValidObjectId(id);
    //console.log(id);
    const product = await Product.findById(id).populate("category", "name");
    if (!product) {
      return res.status(404).json({
        success: false,
      });
    }
    return res.status(400).send(product);
    //console.log(productList);
  } catch (err) {
    //console.log("Server error", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();

    if (!productCount) {
      return res.status(404).json({ success: false });
    }
    console.log(productCount);

    return res.status(200).json({ productCount: productCount });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/get/featured", async (req, res) => {
  try {
    const productList = await Product.find({ isFeatured: "true" });
    console.log(productList);
    if (!productList) {
      return res.status(500).json({ success: false });
    }
    return res.status(200).send(productList);
  } catch (err) {
    console.log("Server error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/get/by_category", async (req, res) => {
  try {
    const categoryId = req.query.category;
    //console.log(categoryId);

    const productList = await Product.find({ category: categoryId });
    //console.log(productList);
    if (!productList) {
      return res.status(500).json({ success: false });
    }
    return res.status(200).send(productList);
  } catch (err) {
    console.log("Server error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

/*
router.put("/update/:id", async (req, res) => {
  const productId = req.params.id;
  mongoose.isValidObjectId(id);

  const { title, thumbnail, price, stock, category, description } = req.body;
  console.log("Request body:", req.body.title);

  const validcategory = await Category.findById(category);
  if (!validcategory) {
    return res
      .status(400)
      .json({ success: false, message: "Incorrect category" });
  }

  const response = await deletetoCloudinary(deletedProduct.thumbnail.public_id);
  if (!response) {
    return res
      .status(400)
      .json({ success: false, message: "Product is not Deleted..!" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        thumbnail: {
          image_url: thumbnail,
        },
        price,
        stock,
        category,
        reachDisciption: description,
      },
      {
        new: true,
      }
    );
    if (!updatedProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product is not updated" });
    }
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("Error saving product:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});*/
