const Category = require("../models/model_category");

const create = async (name) => await new Category({name}).save();

const findAll = async () => await Category.find();

const findById = async (id) => await Category.findById(id);

const updateById = async (id, name) =>
    await Category.findByIdAndUpdate(id, {name}, {new: true});

const deleteById = async (id) => await Category.findByIdAndDelete(id);

module.exports = {
    create,
    findAll,
    findById,
    updateById,
    deleteById,
};
