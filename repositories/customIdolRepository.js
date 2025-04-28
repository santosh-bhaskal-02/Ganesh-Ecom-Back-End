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

const updateCustomProductStatus = async (formId, status) => {
  return await CustomProduct.findByIdAndUpdate(
    formId,
    { status },
    {
      new: true,
    }
  );
};

const fetchCustomProductByUserId = async (userId) => {
  //console.log("26", userId);
  return await CustomProduct.find({ user: userId }).populate("user");
};

module.exports = {
  addCustomProduct,
  fetchCustomProductList,
  fetchCustomProductById,
  updateCustomProductStatus,
  fetchCustomProductByUserId,
};
