const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],

    shipAddress:{
        type: Object,
        required: true
    },

    status: {
        type: String,
        default: "pending",
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now,
    }
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
