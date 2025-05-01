const productRepository = require("../repositories/productRepository");

const mongoose = require("mongoose");
const uploadToCloudinary = require("../utils/utils_cloudinary_upload");
const deletetoCloudinary = require("../utils/utils_cloudinary_delete");

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
        const {title, price, stock, size, category, description} = productData;

        if (!mongoose.isValidObjectId(category)) {
            throw new Error("Invalid Category");
        }
        if (!file || !file.buffer) {
            throw new Error("No image uploaded");
        }

        const {img_url, public_id} = await uploadToCloudinary(file.buffer);

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

    async deleteProduct(productId) {
        if (!mongoose.isValidObjectId(productId)) {
            return {status: 400, success: false, message: "Invalid product"};
        }

        const deletedProduct = await productRepository.deleteById(productId);
        if (!deletedProduct) {
            return {status: 400, success: false, message: "Product not found or already deleted"};
        }

        const cloudResponse = await deletetoCloudinary(deletedProduct.thumbnail.public_id);
        if (!cloudResponse) {
            return {status: 500, success: false, message: "Image not deleted from Cloudinary"};
        }

        return {status: 200, success: true, message: "Product deleted successfully"};
    };

    async updateProduct(productId, body, file) {
        if (!mongoose.isValidObjectId(productId)) {
            return {status: 400, success: false, message: "Invalid product"};
        }

        const {title, price, stock, size, category, description} = body;
        if (!mongoose.isValidObjectId(category)) {
            return {status: 400, success: false, message: "Invalid Category"};
        }

        let updatedProduct;

        if (!file || !file.buffer) {
            updatedProduct = await productRepository.updateById(productId, {
                title,
                price,
                stock,
                size,
                category,
                reachDisciption: description,
            });
        } else {
            const oldProduct = await productRepository.productById(productId);
            if (!oldProduct) return {status: 404, success: false, message: "Product not found"};

            await deletetoCloudinary(oldProduct.thumbnail.public_id);
            const {img_url, public_id} = await uploadToCloudinary(file.buffer);

            updatedProduct = await productRepository.updateById(productId, {
                title,
                thumbnail: {image_url: img_url, public_id},
                price,
                stock,
                size,
                category,
                reachDisciption: description,
            });
        }

        if (!updatedProduct) {
            return {status: 400, success: false, message: "Product is not Updated"};
        }

        return {status: 201, success: true, message: "Product Updated Successfully..!", data: updatedProduct};
    };

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

        return {status: 200, success: true, productsCount};
    }

    async inventoryCount() {
        const inventoryCount = await productRepository.inventoryCount();
        if (inventoryCount.length == 0) return 0;

        return inventoryCount.pop().totalStock;
    }


    async getFeaturedProducts() {
        const products = await productRepository.findFeatured();
        return {status: 200, success: true, data: products};
    };

    async getProductsByCategory(categoryId) {
        const products = await productRepository.findByCategory(categoryId);
        return {status: 200, success: true, data: products};
    };


}

module.exports = new ProductService();
