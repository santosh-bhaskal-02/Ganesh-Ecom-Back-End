const customIdolService = require("../services/customIdolService");

const addCustomProduct = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await customIdolService.addCustomProduct(userId, req.body, req.file);
    return res.status(201).json({
      success: true,
      message: "Custom Product Suggestion Saved Successfully..!",
      result,
    });
  } catch (err) {
    console.error("Error saving product suggestion :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const fetchCustomProductList = async (req, res) => {
  try {
    const result = await customIdolService.fetchCustomProductList();
    return res.status(201).json({
      success: true,
      message: "Custom Product List fetched Successfully..!",
      result,
    });
  } catch (err) {
    console.error("Error fetching product List :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const fetchCustomProductById = async (req, res) => {
  try {
    const formId = req.params.id;
    const result = await customIdolService.fetchCustomProductById(formId);
    return res.status(201).json({
      success: true,
      message: "Custom Product fetched Successfully..!",
      result,
    });
  } catch (err) {
    console.error("Error fetching product :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { addCustomProduct, fetchCustomProductList, fetchCustomProductById };
