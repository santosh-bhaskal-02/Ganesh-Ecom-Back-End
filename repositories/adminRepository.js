const Admin = require("../models/model_admin");

const findByEmail = async (email) => await Admin.findOne({email});

const findByEmailWithPassword = async (email) =>
    await Admin.findOne({email}).select("password isadmin");

const registerAdmin = async (adminData) => {
    const newAdmin = new Admin(adminData);
    return await newAdmin.save();
};

const updatePassword = async (email, hashedPassword) =>
    await Admin.findOneAndUpdate({email}, {password: hashedPassword});

module.exports = {
    findByEmail,
    findByEmailWithPassword,
    registerAdmin,
    updatePassword,
};
