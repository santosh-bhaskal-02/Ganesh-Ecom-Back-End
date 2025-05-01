const adminService = require("../services/adminService");
const userService = require("../services/authService");

const register = async (req, res) => {
    try {
        const admin = await adminService.register(req.body);
        if (!admin) return res.status(409).json({success: false, message: "Email already exists"});

        res.status(201).json({
            success: true,
            message: "Signed Up Successfully",
            admin: {
                id: admin._id,
                name: admin.firstName,
                email: admin.email,
                phone: admin.phone,
            },
        });
    } catch (err) {
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

const login = async (req, res) => {
    console.log(req.body);
    try {
        const {email, password} = req.body;
        const result = await adminService.authenticate(email, password);
        if (result.error) return res.status(401).json({message: result.error});

        res.status(200).json({
            message: "Login successful",
            user: result.email,
            userId: result.adminId,
            token: result.token,
            admin: result.isAdmin,
        });
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

const resetPassword = async (req, res) => {
    try {
        const updated = await adminService.resetPassword(req.body.email, req.body.password);
        if (!updated)
            return res.status(404).json({message: "Admin with this email does not exist."});

        res.status(200).json({message: "Password updated successfully!"});
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

// USER MANAGEMENT
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({message: "User not found"});
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

const deleteUser = async (req, res) => {
    try {
        const deleted = await userService.deleteUser(req.params.id);
        if (!deleted) return res.status(404).json({success: false, message: "User not found"});
        res.status(200).json({success: true, message: "User deleted"});
    } catch (err) {
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
};

module.exports = {
    register,
    login,
    resetPassword,
    getAllUsers,
    getUserById,
    deleteUser,
};
