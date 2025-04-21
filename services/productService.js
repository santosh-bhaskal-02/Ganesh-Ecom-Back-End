const productRepository = require("../repositories/productRepository");

const mongoose = require("mongoose");
const uploadToCloudinary = require("../utils/utils_cloudinary_upload");

class ProductService {
  async productList() {
    const productList = await productRepository.productList();
    if (!productList) throw new Error("Product List not found");

    return productList;
  }

  async productById(id) {
    const product = await productRepository.productById(id);
    if (!product) {
      return {
        success: false,
        message: "Product not found",
      };
    }
    return product;
  }

  async addProduct(productData, file) {
    const { title, price, stock, size, category, description } = productData;

    if (!mongoose.isValidObjectId(category)) {
      throw new Error("Invalid Category");
    }
    if (!file || !file.buffer) {
      throw new Error("No image uploaded");
    }

    const { img_url, public_id } = await uploadToCloudinary(file.buffer);

    const newProduct = {
      title,
      thumbnail: {
        image_url: img_url,
        public_id,
      },
      price,
      stock,
      size,
      category,
      reachDisciption: description,
    };

    return await productRepository.addProduct(newProduct);
  }

  async updateStock(productId, quantity) {
    try {
      // console.log("101", productId);
      const updateStock = await productRepository.updateStock(productId, quantity);
      // console.log("updateStock", updateStock);
      if (!updateStock) throw new Error("Order stock is  not suffficient");
      return updateStock;
    } catch (error) {
      console.log("productService", error);
    }
  }

  async productsCount() {
    const productsCount = await productRepository.productsCount();
    if (!productsCount) return 0;

    return productsCount;
  }

  async inventoryCount() {
    const inventoryCount = await productRepository.inventoryCount();
    if (inventoryCount.length == 0) return 0;

    return inventoryCount.pop().totalStock;
  }
}

module.exports = new ProductService();
