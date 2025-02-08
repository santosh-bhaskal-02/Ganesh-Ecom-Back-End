const express = require("express");
const Category = require("../models/model_category");
const router = express.Router();

router.get("/fetch", async (req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList) {
      return res.status(400).json({ success: false });
    }
    return res.status(200).send(categoryList);
  } catch (error) {
    return res.status(500).json({ message: "internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);

    if (!category) {
      res.status(400).json({ success: false });
    }
    res.status(200).send(category);
  } catch (error) {
    res.status(500).json({ message: "internal Server Error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const catName = req.body.category;
    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: catName,
      },
      {
        new: true,
      }
    );

    if (!category) {
      return res.status(400).json({ success: false });
    }
    return res.status(200).send(category);
  } catch (error) {
    return res.status(500).json({ message: "internal Server Error" });
  }
});

router.post("/add", async (req, res) => {
  const catName = req.body.category;
  try {
    const category = new Category({
      name: catName,
    });

    const response = await category.save();
    if (!response) {
      return res.status(400).json({ error: err.message, success: false });
    }
    return res.status(200).send(response);
  } catch (err) {
    console.error("Error saving category:", err);
    return res.status(500).json({ error: err.message, success: false });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const response = await Category.findByIdAndDelete(id);
    console.log(response);
    if (!response) {
      res.status(400).json({ Success: false, message: "Category is not Deleted..!" });
    }
    res.status(200).json({ Success: true, message: "Category is Deleted..!" });
  } catch (err) {
    res.status(400).json({ Success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
