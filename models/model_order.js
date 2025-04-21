const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],

  shipAddress: {
    type: Object,
    required: true,
  },
  taxCharge: {
    type: Number,
    required: true,
  },

  shippingCharge: {
    type: Number,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: [
      "Awaiting for Payment",
      "Payment Successful",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ],
    default: "Awaiting for Payment",
  },
  orderDate: { type: Date, default: Date.now },
  deliveredAt: Date,
});

orderSchema.virtual("id").get(function () {
  // console.log(this._id.toHexString());
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

const Order = mongoose.models.orderSchema || mongoose.model("Order", orderSchema);

//const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
