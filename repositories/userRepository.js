const User = require("../models/model_user");

class UserRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select("password isadmin");
  }

  async findById(id) {
    return await User.findById(id);
  }

  async updatePassword(email, newPassword) {
    return await User.updateOne({ email }, { password: newPassword });
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async userbyId(id) {
    return await User.findById(id).select("-password");
  }

  async usersList() {
    return await User.find().select("-password");
  }

  async usersCount() {
    return await User.countDocuments();
  }
}

module.exports = new UserRepository();
