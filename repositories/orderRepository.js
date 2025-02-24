const Order = require("../models/model_order");

class orderRepository {
  async totalOrders() {
    return await Order.countDocuments();
  }

  async totalSales() {
    return await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
  }

  async totalOrderItems(){
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
}

module.exports = new orderRepository();
