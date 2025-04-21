const CustomProduct = require("../models/model_customProduct");

const addCustomProduct = async (customProductData) => {
  return await new CustomProduct(customProductData).save();
};

const fetchCustomProductList = async () => {
  return await CustomProduct.find().populate("user");
};

const fetchCustomProductById = async (formId) => {
  return await CustomProduct.findById(formId).populate("user");
};

module.exports = { addCustomProduct, fetchCustomProductList, fetchCustomProductById };
