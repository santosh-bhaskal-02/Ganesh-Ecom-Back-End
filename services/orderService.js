const orderRepository = require("../repositories/orderRepository");

class orderService {
  async allOrders() {
    return await orderRepository.allOrders();
  }

  async createOrderItem(productId, quantity) {
    return await orderRepository.createOrderItem(productId, quantity);
  }

  async createCustomOrderItem(productId, quantity) {
    return await orderRepository.createCustomOrderItem(productId, quantity);
  }

  async placedOrder(
    orderItems,
    user,
    address,
    taxCharge,
    shippingCharge,
    subTotal,
    totalPrice
  ) {
    return await orderRepository.placedOrder(
      orderItems,
      user,
      address,
      taxCharge,
      shippingCharge,
      subTotal,
      totalPrice
    );
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
      return 0;
    }
    return totalOrders;
  }

  async totalSales() {
    const totalSales = await orderRepository.totalSales();
    //  console.log("totalSales", totalSales);
    // if (!totalSales) {
    //   return {
    //     success: false,
    //     message: "Total sales Cannot be generated",
    //   };
    // }
    if (totalSales.length === 0) {
      return 0;
    }

    return totalSales.pop().total;
  }

  async totalOrderItems() {
    const totalOrderItems = await orderRepository.totalOrderItems();
    //console.log(totalOrderItems);
    if (!totalOrderItems) {
      return {
        success: false,
        message: "Total order items Cannot be generated",
      };
    }

    if (totalOrderItems.length === 0) {
      return 0;
    }

    return totalOrderItems.pop().totalItems;
  }

  async fetchOrderStatus() {
    return await orderRepository.fetchOrderStatus();
  }
}

module.exports = new orderService();
