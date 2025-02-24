const Product = require("../models/model_product");

class ProductRepository {
  async productList() {
    return await Product.find().populate("category");
  }

  async addProduct(productData) {
    return await new Product(productData).save();
  }

  async productsCount() {
    return await Product.countDocuments();
  }

  async inventoryCount() {
    return await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" } 
        }
      }
    ]);
  }
}
module.exports = new ProductRepository();
