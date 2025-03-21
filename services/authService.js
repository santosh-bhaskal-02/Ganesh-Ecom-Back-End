const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP, verifyOTP } = require("../utils/otpService");

const secret = process.env.JWT_SECRET;
const saltRounds = 10;

class AuthService {
  async register(userData) {
    try {
      const { firstName, lastName, email, phone, password } = userData;
      if (!firstName || !lastName || !email || !phone || !password) {
        return { success: false, message: "All fields are required" };
      }

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return { success: false, message: "User already exists" };
      }

      userData.password = await bcrypt.hash(password, saltRounds);
      const user = await userRepository.createUser(userData);
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
    } catch (error) {
      console.error("Error in register:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async login(email, password) {
    try {
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
    } catch (error) {
      console.error("Error in login:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async sendResetOTP(email) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user)
        return { success: false, message: "Email does not exist, try signing up." };

      const sent = await sendOTP(email);
      if (!sent) return { success: false, message: "Failed to send OTP" };

      return { success: true, message: "OTP sent successfully" };
    } catch (error) {
      console.error("Error in sendResetOTP:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async sendSignupOTP(email) {
    try {
      const user = await userRepository.findByEmail(email);
      if (user)
        return { success: false, message: "Email already exists, try logging in." };

      const sent = await sendOTP(email);
      if (!sent) return { success: false, message: "Failed to send OTP" };

      return { success: true, message: "OTP sent successfully" };
    } catch (error) {
      console.error("Error in sendSignupOTP:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async verifyOTP(email, otp) {
    try {
      const isValid = await verifyOTP(email, otp);
      if (!isValid) return { success: false, message: "Invalid or expired OTP" };

      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async resetPassword(email, newPassword) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) return { success: false, message: "User not found" };

      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const updated = await userRepository.updatePassword(email, hashedPassword);
      if (!updated) return { success: false, message: "Error during password reset" };

      return { success: true, message: "Password updated successfully!" };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async deleteUser(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) return { success: false, message: "User not found" };

      await userRepository.deleteUser(userId);
      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async userbyId(id) {
    try {
      const user = await userRepository.userbyId(id);
      if (!user) return { success: false, message: "User not found" };
      return user;
    } catch (error) {
      return { success: false, message: "Internal Server Error", error };
    }
  }

  async userList() {
    try {
      const usersList = await userRepository.usersList();
      if (!usersList) return { success: false, message: "User List not found" };
      return { success: true, message: "User List Found successfully", usersList };
    } catch (error) {
      return { success: false, message: "Internal Server Error" };
    }
  }

  async usersCount() {
    try {
      const usersCount = await userRepository.usersCount();
      if (!usersCount) {
        return { success: false, message: "User count not found" };
      }
      //console.log(usersCount);

      return usersCount;
    } catch (error) {
      return { success: false, message: "Internal Server Error", error };
    }
  }
}

module.exports = new AuthService();
