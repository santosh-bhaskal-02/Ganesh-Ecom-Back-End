const productService = require("../services/productService");

class ProductController {
  async fetch(req, res) {
    try {
      const productList = await productService.productList();

      return res.status(201).json({
        success: true,
        message: "Product List found Successfully..!",
        productList,
      });
    } catch (err) {
      console.log("Error :", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  async productById(req, res) {
    const id = req.params.id;
    // mongoose.isValidObjectId(id);
    //console.log(id);
    try {
      const product = await productService.productById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
        });
      }
      return res.status(200).send(product);
      //console.log(productList);
    } catch (err) {
      //console.log("Server error", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  async addProduct(req, res) {
    try {
      const createdProduct = await productService.addProduct(req.body, req.file);

      return res.status(201).json({
        success: true,
        message: "Product Saved Successfully..!",
        createdProduct,
      });
    } catch (err) {
      console.error("Error saving product:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async productsCount(req, res) {
    try {
      const productsCount = await productService.productsCount();

      if (!productsCount) {
        return res
          .status(404)
          .json({ success: false, message: "Failed fetch productcoumt" });
      }
      console.log(productsCount);

      return res.status(200).json({
        success: true,
        message: "fetch productcoumt successfully",
        productsCount: productsCount,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  async inventoryCount(req, res) {
    try {
      const inventoryCount = await Product.countDocuments();

      if (!inventoryCount) {
        return res.status(404).json({ success: false });
      }
      console.log(inventoryCount);

      return res.status(200).json({ inventoryCount: inventoryCount });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  async addCustomProduct(req, res) {
    try {
      const userId = req.params.id;
      const result = await productService.addCustomProduct(userId, req.body, req.file);
      return res.status(201).json({
        success: true,
        message: "Custom Product Suggestion Saved Successfully..!",
        result,
      });
    } catch (err) {
      console.error("Error saving product suggestion :", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new ProductController();
