const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customProductSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  suggestion: {
    type: String,
    default: "",
  },

  size: {
    type: Number,
    default: 1,
  },

  otherSpecifications: {
    type: String,
    default: "",
  },

  thumbnail: {
    image_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

customProductSchema.virtual("id").get(function () {
  // console.log(this._id.toHexString());
  return this._id.toHexString();
});

customProductSchema.set("toJSON", {
  virtuals: true,
});

const CustomProduct = mongoose.model("CustomProduct", customProductSchema);

module.exports = CustomProduct;
