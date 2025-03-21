const orderRepository = require("../repositories/orderRepository");

class orderService {
  async createOrderItem(productId, quantity) {
    return await orderRepository.createOrderItem(productId, quantity);
  }

  async placedOrder(orderItems, address, totalPrice, user) {
    return await orderRepository.placedOrder(orderItems, address, totalPrice, user);
  }

  async orderById(userId) {
    return await orderRepository.orderById(userId);
  }

  async updateOrderStatus(orderId, status) {
    return await orderRepository.updateOrderStatus(orderId, status);
  }

  async deleteOrder(orderId) {
    return orderRepository.deleteOrder(orderId);
  }

  async orderItemById(itemId) {
    return await orderRepository.orderItemById(itemId);
  }

  async userOrderList(userId) {
    return await orderRepository.userOrderList(userId);
  }

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
