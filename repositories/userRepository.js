const User = require("../models/model_user");

class UserRepository {
    async createUser(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {
        return await User.findOne({email}).select("password isadmin");
    }

    async findById(id) {
        return await User.findById(id);
    }

    async updatePassword(email, newPassword) {
        return await User.updateOne({email}, {password: newPassword});
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }

    async userbyId(id) {
        return await User.findById(id)
            .select("-password")
            .populate({
                path: "orders",
                populate: {
                    path: "orderItems",
                    populate: {
                        path: "product",
                    },
                },
            });
    }

    async usersList() {
        return await User.find().select("-password");
    }

    async usersCount() {
        return await User.countDocuments();
    }

    async updateUserOrder(userId, orderId) {
        return await User.findByIdAndUpdate(
            userId,
            {$addToSet: {orders: orderId}},
            {new: true}
        );
    }

    async updateUserAddress(userId, addressData) {
        return await User.findByIdAndUpdate(
            userId,
            {address: addressData},
            {new: true}
        );
    };

}

module.exports = new UserRepository();
