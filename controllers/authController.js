const authService = require("../services/authService");

class AuthController {
  async register(req, res) {
    const response = await authService.register(req.body);
    return res.status(response.success ? 201 : 400).json(response);
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
    const response = await authService.deleteUser(id);
    return res.status(response.success ? 200 : 404).json(response);
  }

  async userbyId(req, res) {
    const { id } = req.params;
    const response = await authService.userbyId(id);
    return res.status(response.success ? 200 : 404).json(response);
  }

  async userList(req, res) {
    const response = await authService.userList();
    return res.status(response.success ? 200 : 404).json(response);
  }
}

module.exports = new AuthController();
