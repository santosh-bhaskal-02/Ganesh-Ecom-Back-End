const categoryService = require("../services/categoryService");

const fetchAll = async (req, res) => {
    try {
        const result = await categoryService.getAllCategories();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
};

const fetchById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        if (!category)
            return res.status(400).json({success: false, message: "Invalid or missing category"});
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
};

const addCategory = async (req, res) => {
    try {
        const {category} = req.body;
        const result = await categoryService.addCategory(category);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};

const removeCategory = async (req, res) => {
    try {
        const deleted = await categoryService.deleteCategory(req.params.id);
        if (!deleted)
            return res.status(400).json({success: false, message: "Deletion failed or invalid ID"});
        res.status(200).json({success: true, message: "Category deleted successfully"});
    } catch (err) {
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
};

const updateCategory = async (req, res) => {
    try {
        const updated = await categoryService.updateCategory(req.params.id, req.body.category);
        if (!updated)
            return res.status(400).json({success: false, message: "Update failed or invalid ID"});
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};


module.exports = {addCategory, fetchAll, fetchById, updateCategory, removeCategory};
