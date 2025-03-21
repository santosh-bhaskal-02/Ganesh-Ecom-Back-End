const Product = require("../models/model_product");

class ProductRepository {
  async productList() {
    return await Product.find().populate("category");
  }

  async productById(id) {
    return await Product.findById(id).populate("category", "name");
  }

  async addProduct(productData) {
    return await new Product(productData).save();
  }

  async productsCount() {
    return await Product.countDocuments();
  }

  async updateStock(productId, quantity) {
    return await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity },
    });
  }

  async inventoryCount() {
    return await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
        },
      },
    ]);
  }
}
module.exports = new ProductRepository();
