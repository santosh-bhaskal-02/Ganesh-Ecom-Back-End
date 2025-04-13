const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP, verifyOTP } = require("../utils/otpService");

const secret = process.env.JWT_SECRET;
const saltRounds = 10;

class AuthService {
  async register({ firstName, lastName, email, phone, password }) {
    if (!firstName || !lastName || !email || !phone || !password) {
      return { success: false, message: "All fields are required" };
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await userRepository.createUser({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    return {
      success: true,
      message: "Signed up successfully!",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) return { success: false, message: "User not found" };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return { success: false, message: "Invalid password" };

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, secret, {
      expiresIn: "1d",
    });

    return {
      success: true,
      message: "Login successful",
      user: {
        email: user.email,
        userId: user._id,
        isAdmin: user.isAdmin,
        token,
      },
    };
  }

  async sendResetOTP(email) {
    const user = await userRepository.findByEmail(email);
    if (!user)
      return { success: false, message: "Email does not exist, try signing up." };

    const sent = await sendOTP(email);
    return {
      success: !!sent,
      message: sent ? "OTP sent successfully" : "Failed to send OTP",
    };
  }

  async sendSignupOTP(email) {
    const user = await userRepository.findByEmail(email);
    if (user) return { success: false, message: "Email already exists, try logging in." };

    const sent = await sendOTP(email);
    return {
      success: !!sent,
      message: sent ? "OTP sent successfully" : "Failed to send OTP",
    };
  }

  async verifyOTP({ email, otp }) {
    const isValid = await verifyOTP(email, otp);
    return {
      success: !!isValid,
      message: isValid ? "OTP verified successfully" : "Invalid or expired OTP",
    };
  }

  async resetPassword({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) return { success: false, message: "User not found" };

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const updated = await userRepository.updatePassword(email, hashedPassword);
    return {
      success: !!updated,
      message: updated ? "Password updated successfully!" : "Error during password reset",
    };
  }

  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) return { success: false, message: "User not found" };

    await userRepository.deleteUser(userId);
    return { success: true, message: "User deleted successfully" };
  }

  async userbyId(id) {
    const user = await userRepository.userbyId(id);
    if (!user) return { success: false, message: "User not found" };
    return user;
  }

  async userList() {
    const usersList = await userRepository.usersList();
    return {
      success: !!usersList,
      message: usersList ? "User list retrieved" : "User list not found",
      usersList,
    };
  }

  async usersCount() {
    const count = await userRepository.usersCount();
    return {
      success: !!count,
      message: count ? "User count retrieved" : "User count not found",
      count,
    };
  }
}

module.exports = new AuthService();
