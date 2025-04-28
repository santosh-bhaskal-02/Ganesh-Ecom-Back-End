const Order = require("../models/model_order");
const OrderItem = require("../models/model_orderItem");

class orderRepository {
  async allOrders() {
    return await Order.find()
      .populate("user")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ orderDate: -1 });
  }

  async orderById(userId) {
    return await Order.find({ user: userId })
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: [
          { path: "product", populate: { path: "category" } },
          { path: "customProduct" },
        ],
      })
      .sort({ orderDate: -1 });
  }

  async createCustomOrderItem(productId, quantity) {
    const newOrderItem = new OrderItem({
      customProduct: productId,
      quantity: quantity,
    });
    return await newOrderItem.save();
  }

  async createOrderItem(productId, quantity) {
    const newOrderItem = new OrderItem({
      product: productId,
      quantity: quantity,
    });
    return await newOrderItem.save();
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
    //console.log("address", address);
    const order = await new Order({
      orderItems: orderItems,
      shipAddress: address,
      user,
      taxCharge,
      shippingCharge,
      subTotal,
      totalPrice: totalPrice,
      deliveredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return await order.save().then((savedOrder) => savedOrder.populate("user"));
  }

  async updateOrderStatus(orderId, status) {
    return await Order.findByIdAndUpdate(
      orderId,
      {
        status: status,
      },
      {
        new: true,
      }
    );
  }

  async deleteOrder(orderId) {
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    return await Promise.all(
      deletedOrder.orderItems.map(async (item) => {
        // console.log("1",item);
        await OrderItem.findByIdAndDelete(item);
      })
    );
  }

  async orderItemById(itemId) {
    return await OrderItem.findById(itemId).populate("product", "price");
  }

  async totalOrders() {
    return await Order.countDocuments();
  }

  async userOrderList(orderId) {
    return Order.findById(orderId)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
        populate: { path: "customProduct" },
      })
      .sort({ orderDate: -1 });
  }

  async totalSales() {
    return await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
  }

  async totalOrderItems() {
    return await Order.aggregate([
      {
        $lookup: {
          from: "orderitems",
          localField: "orderItems",
          foreignField: "_id",
          as: "orderItemsDetails",
        },
      },
      {
        $unwind: "$orderItemsDetails",
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: "$orderItemsDetails.quantity" },
        },
      },
    ]);
  }

  async fetchOrderStatus() {
    return Order.schema.path("status").enumValues;
  }
}

module.exports = new orderRepository();
