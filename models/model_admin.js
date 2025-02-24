const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: Number },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  password: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  isAdmin: {
    type: Boolean,
    default: true,
  },
});

adminSchema.virtual("id").get(function () {
  // console.log(this._id.toHexString());
  return this._id.toHexString();
});

adminSchema.set("toJSON", {
  virtuals: true,
});

const Admin = mongoose.models.signupAdmin || mongoose.model("Admin", adminSchema);

module.exports = Admin;
