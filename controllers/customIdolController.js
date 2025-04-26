const customIdolService = require("../services/customIdolService");
const orderService = require("../services/orderService");
const authService = require("../services/authService");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const addCustomProduct = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await customIdolService.addCustomProduct(userId, req.body, req.file);
    return res.status(201).json({
      success: true,
      message: "Custom Product Suggestion Saved Successfully..!",
      result,
    });
  } catch (err) {
    console.error("Error saving product suggestion :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const fetchCustomProductList = async (req, res) => {
  try {
    const result = await customIdolService.fetchCustomProductList();
    return res.status(201).json({
      success: true,
      message: "Custom Product List fetched Successfully..!",
      result,
    });
  } catch (err) {
    console.error("Error fetching product List :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const fetchCustomProductById = async (req, res) => {
  try {
    const formId = req.params.id;
    const result = await customIdolService.fetchCustomProductById(formId);
    return res.status(201).json({
      success: true,
      message: "Custom Product fetched Successfully..!",
      result,
    });
  } catch (err) {
    console.error("Error fetching product :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const updateCustomProductStatus = async (req, res) => {
  try {
    const formId = req.params.id;
    const { status } = req.body;
    const result = await customIdolService.updateCustomProductStatus(formId, status);
    return res.status(201).json({
      success: true,
      message: "Successfully updated..!",
      result,
    });
  } catch (err) {
    console.error("Error updating status :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const fetchCustomProductByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    //console.log("66", userId, req.params.id);
    const result = await customIdolService.fetchCustomProductByUserId(userId);
    // console.log("67", result);
    return res.status(201).json({
      success: true,
      message: "Custom Product fetched Successfully..!",
      result,
    });
  } catch (err) {
    console.error("Error fetching product :", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const placedOrder = async (req, res) => {
  console.log("Payment start");
  try {
    const { user, orderItem, taxCharge, shippingCharge, subTotal, totalPrice } = req.body;

    const userDetails = await authService.userbyId(user);

    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { email, address } = userDetails;

    const orderItemIds = await Promise.all(
      orderItem.map(async function (item) {
        const customProduct = await customIdolService.fetchCustomProductById(
          item.productId
        );

        if (!customProduct) {
          throw new Error(`Product with ID ${item.productIid} not found`);
        }

        // console.log("100", item.product.id);

        const createOrderItem = await orderService.createOrderItem(
          item.productId,
          item.quantity
        );

        if (!createOrderItem) {
          throw new Error("Order item not created");
        }
        return createOrderItem.id;
      })
    );

    //console.log("OrderItem IDs:", orderItemIds);

    if (orderItemIds.length === 0) {
      throw new Error("OrderItem Ids not created");
    }

    const placedOrder = await orderService.placedOrder(
      orderItemIds,
      user,
      address,
      taxCharge,
      shippingCharge,
      subTotal,
      totalPrice
    );

    if (!placedOrder) {
      return res.status(422).json({ success: false, message: "Orders is not placed" });
    }
    // console.log("218", orderItem);

    const updateUserOrder = await authService.updateUserOrder(user, placedOrder._id);
    if (!updateUserOrder) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to Update order in User Schema" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: totalPrice * 100,
      currency: "INR",
      receipt: `order_${placedOrder._id}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create payment order" });
    }

    return res.status(200).json({
      success: true,
      message: "Order Placed Successfully",
      order: placedOrder,
      razorpayOrder: razorpayOrder,
    });
  } catch (err) {
    console.log("279 In OrderConntroller", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      const updateOrderStatus = orderService.updateOrderStatus(
        orderId,
        "Payment Successful"
      );

      if (!updateOrderStatus) {
        throw error("Status not updated");
      }
      return res.status(200).json({ success: true, message: "Payment successful" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addCustomProduct,
  fetchCustomProductList,
  fetchCustomProductById,
  updateCustomProductStatus,
  fetchCustomProductByUserId,
  placedOrder,
  verifyPayment,
};
