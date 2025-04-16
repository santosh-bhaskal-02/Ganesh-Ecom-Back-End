const CustomProduct = require("../models/model_customProduct");

class customProductRepository {
  async addCustomProduct(customProductData) {
    return await new CustomProduct(customProductData).save();
  }
}

module.exports = new customProductRepository();
