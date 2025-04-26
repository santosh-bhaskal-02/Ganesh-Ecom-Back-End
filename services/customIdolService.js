const customIdolRepository = require("../repositories/customIdolRepository");
const uploadToCloudinary = require("../utils/utils_cloudinary_upload");

const addCustomProduct = async (userId, productData, file) => {
  const { suggestion, size, otherSpecifications } = productData;

  if (!file || !file.buffer) {
    throw new Error("No image uploaded");
  }

  const { img_url, public_id } = await uploadToCloudinary(file.buffer);

  const newProductSuggestion = {
    user: userId,
    suggestion,
    thumbnail: {
      image_url: img_url,
      public_id,
    },
    size,
    otherSpecifications,
  };

  return await customIdolRepository.addCustomProduct(newProductSuggestion);
};

const fetchCustomProductList = async () => {
  return await customIdolRepository.fetchCustomProductList();
};

const fetchCustomProductById = async (formId) => {
  return await customIdolRepository.fetchCustomProductById(formId);
};

const updateCustomProductStatus = async (formId, status) => {
  return await customIdolRepository.updateCustomProductStatus(formId, status);
};

const fetchCustomProductByUserId = async (userId) => {
  return await customIdolRepository.fetchCustomProductByUserId(userId);
};

module.exports = {
  addCustomProduct,
  fetchCustomProductList,
  fetchCustomProductById,
  updateCustomProductStatus,
  fetchCustomProductByUserId,
};
