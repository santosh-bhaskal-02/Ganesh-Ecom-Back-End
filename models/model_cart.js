const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  cartItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CartItem",
      required: true,
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.virtual("id").get(function () {
  // console.log(this._id.toHexString());
  return this._id.toHexString();
});

cartSchema.set("toJSON", {
  virtuals: true,
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

module.exports = Cart;
