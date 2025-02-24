const dashboardService = require("../services/dashboardService");
const productService = require("../services/productService");
const authService = require("../services/authService");
const orderService = require("../services/orderService");

class dashboardController {
  async fetch(req, res) {
    try {
      const [
        inventoryCount,
        productsCount,
        usersCount,
        totalSales,
        totalOrders,
        totalOrderItems,
      ] = await Promise.all([
        productService.inventoryCount(),
        productService.productsCount(),
        authService.usersCount(),
        orderService.totalSales(),
        orderService.totalOrders(),
        orderService.totalOrderItems(),
      ]);

      return res.json({
        success: true,
        message: "fetch dashboard successfully",
        inventoryCount,
        productsCount,
        usersCount,
        totalSales,
        totalOrders,
        totalOrderItems,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Failed to fetch dashboard data" });
    }
  }
}

module.exports = new dashboardController();
