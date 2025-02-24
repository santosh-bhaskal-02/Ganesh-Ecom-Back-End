const orderService = require("../services/orderService");

class orderController {
  async totalOrders(req, res) {
    try {
      const totalOrders = await orderService.totalOrders();

      if (!totalOrders) {
        return res.status(404).json({ success: false });
      }
      console.log(totalOrders);

      res.status(200).json({ success: true, totalOrders: totalOrders });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  async totalSales(req, res) {
    try {
      const totalSales = await orderService.totalSales();
      if (!totalSales) {
        return res.status(404).json({
          success: false,
          message: "Total sales Cannot be generated",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Total sales generated",
        totalSales: totalSales,
      });
      //console.log(productList);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  async totalOrderItems(req, res) {
    try {
      const totalOrderItems = await orderService.totalOrderItems();
      if (!totalOrderItems) {
        return res.status(404).json({
          success: false,
          message: "Total sales Cannot be generated",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Total sales generated",
        totalOrderItems: totalOrderItems,
      });
      //console.log(productList);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
}

module.exports = new orderController();
