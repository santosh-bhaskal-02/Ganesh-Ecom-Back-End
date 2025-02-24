const orderRepository = require("../repositories/orderRepository");

class orderService {
  async totalOrders() {
    const totalOrders = await orderRepository.totalOrders();
    if (!totalOrders) {
      return {
        success: false,
        message: "Total orders Cannot be generated",
      };
    }
    return totalOrders;
  }

  async totalSales() {
    const totalSales = await orderRepository.totalSales();
    //console.log(totalSales);
    if (!totalSales) {
      return {
        success: false,
        message: "Total sales Cannot be generated",
      };
    }
    return totalSales.pop().total;

    //console.log(productList);
  }

  async totalOrderItems() {
    const totalOrderItems = await orderRepository.totalOrderItems();
    //console.log(totalSales);
    if (!totalOrderItems) {
      return {
        success: false,
        message: "Total order items Cannot be generated",
      };
    }
    return totalOrderItems.pop().totalItems;
  }
}

module.exports = new orderService();
