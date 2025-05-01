const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminRepo = require("../repositories/adminRepository");

const saltRounds = 10;
const secret = process.env.JWT_SECRET;

const register = async (data) => {
    const {firstName, lastName, email, phone, password} = data;
    const existing = await adminRepo.findByEmail(email);
    if (existing) return {error: "Email already exists, Try logging in."};

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return await adminRepo.registerAdmin({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
    });
};

const authenticate = async (email, password) => {
    const admin = await adminRepo.findByEmailWithPassword(email);
    if (!admin) return {error: "Invalid email"};

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return {error: "Invalid password"};

    const token = jwt.sign({userId: admin._id, isAdmin: admin.isAdmin}, secret, {
        expiresIn: "1d",
    });

    return {
        success: true,
        message: "Login successful",
        user: {
            email: admin.email,
            userId: admin._id,
            isAdmin: admin.isAdmin,
            token,
        },
    };
};

const resetPassword = async (email, password) => {
    const existing = await adminRepo.findByEmail(email);
    if (!existing) return null;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return await adminRepo.updatePassword(email, hashedPassword);
};

module.exports = {
    register,
    authenticate,
    resetPassword,
};
