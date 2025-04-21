const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taxDeliveryChargesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      default: "default",
    },
    taxRate: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

taxDeliveryChargesSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

taxDeliveryChargesSchema.set("toJSON", {
  virtuals: true,
});

const TaxDeliveryCharges = mongoose.model("TaxDeliveryCharges", taxDeliveryChargesSchema);

module.exports = TaxDeliveryCharges;
