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

module.exports = { addCustomProduct, fetchCustomProductList, fetchCustomProductById };
