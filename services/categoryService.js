const mongoose = require("mongoose");
const categoryRepo = require("../repositories/categoryRepository");

const addCategory = async (name) => {
    const category = await categoryRepo.create(name);
    return category;
};

const getAllCategories = async () => {
    return await categoryRepo.findAll();
};

const getCategoryById = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return await categoryRepo.findById(id);
};

const updateCategory = async (id, name) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return await categoryRepo.updateById(id, name);
};

const deleteCategory = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return await categoryRepo.deleteById(id);
};

module.exports = {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
