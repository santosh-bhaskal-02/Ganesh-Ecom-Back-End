const authService = require("../services/authService");

class AuthController {
  async register(req, res) {
    try {
      const { firstName, lastName, email, phone, password } = req.body;
      const result = await authService.register({ firstName, lastName, email, phone, password });
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async sendResetOTP(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.sendResetOTP(email);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async sendSignupOTP(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.sendSignupOTP(email);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOTP({ email, otp });
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.resetPassword({ email, password });
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await authService.deleteUser(id);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async userbyId(req, res) {
    try {
      const { id } = req.params;
      const result = await authService.userbyId(id);
      return res.status(result ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async userList(req, res) {
    try {
      const result = await authService.userList();
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
