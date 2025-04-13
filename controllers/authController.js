const authService = require("../services/authService");

class AuthController {
  async register(req, res) {
    const { firstName, lastName, email, phone, password } = req.body;
    try {
      if (!firstName || !lastName || !email || !phone || !password) {
        return { success: false, message: "All fields are required" };
      }
      const response = await authService.register(
        firstName,
        lastName,
        email,
        phone,
        password
      );
      if (!response) {
        return res.status(404).json({ success: false, message: "User Not Created" });
      }
      return res.status(201).json(response);
    } catch {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const response = await authService.login(email, password);
    console.log(response);
    return res.status(response.success ? 200 : 401).json(response);
  }

  async sendResetOTP(req, res) {
    const { email } = req.body;
    const response = await authService.sendResetOTP(email);
    return res.status(response.success ? 200 : 400).json(response);
  }

  async sendSignupOTP(req, res) {
    const { email } = req.body;
    const response = await authService.sendSignupOTP(email);
    return res.status(response.success ? 200 : 400).json(response);
  }

  async verifyOTP(req, res) {
    const { email, otp } = req.body;
    const response = await authService.verifyOTP(email, otp);
    return res.status(response.success ? 200 : 400).json(response);
  }

  async resetPassword(req, res) {
    const { email, password } = req.body;
    const response = await authService.resetPassword(email, password);
    return res.status(response.success ? 200 : 400).json(response);
  }

  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const response = await authService.deleteUser(id);
      if (!response) {
        return res
          .status(404)
          .json({ success: true, message: "User deleted successfully" });
      }
      return res.status(200).json(response);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async userbyId(req, res) {
    const { id } = req.params;
    try {
      const response = await authService.userbyId(id);
      if (!response) {
        return res.status(404).json({ success: false, message: "User Not Found" });
      }
      return res.status(200).send(response);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async userList(req, res) {
    const response = await authService.userList();
    return res.status(response.success ? 200 : 404).json(response);
  }
}

module.exports = new AuthController();
