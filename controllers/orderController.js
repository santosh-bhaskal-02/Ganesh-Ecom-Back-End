const authService = require("../services/authService");
const orderService = require("../services/orderService");
const productService = require("../services/productService");
const cartService = require("../services/cartService");
const Razorpay = require("razorpay");
const crypto = require("crypto");

class orderController {
  async allOrders(req, res) {
    try {
      const orders = await orderService.allOrders();
      if (!orders) {
        return res.status(404).json({ success: false, message: "no orders placed" });
      }
      return res.status(200).send(orders);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async orderById(req, res) {
    try {
      console.log("23 ", req.params.id);
      const orderId = req.params.id;
      const order = await orderService.orderById(orderId);
      //console.log("Order ", order);
      if (!order) {
        return res.status(404).json({ success: false, message: "order not found" });
      }
      return res.status(200).send(order);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async placedOrder(req, res) {
    try {
      const { user, orderItem, taxCharge, shippingCharge, subTotal, totalPrice } =
        req.body;
      console.log("101", req.body);
      const userDetails = await authService.userbyId(user);

      if (!userDetails) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const { email, address } = userDetails;

      // console.log("User Address:", address);

      const orderItemDetails = await Promise.all(
        orderItem.map(async (item) => {
          const product = await productService.productById(item.productId);
          // Product.findById(item.productId).select("title price stock thumbnail");
          if (!product) throw new Error(`Product with ID ${item.productId} not found`);
          if (product.stock < item.quantity)
            throw new Error(`Insufficient stock for ${product.title}`);

          const updateStock = await productService.updateStock(
            item.productId,
            item.quantity
          );

          if (!updateStock) throw new Error("Product stock not updated");

          const createOrderItem = await orderService.createOrderItem(
            item.productId,
            item.quantity
          );

          if (!createOrderItem) {
            throw new Error("Order item not created");
          }

          return {
            id: createOrderItem.id,
            title: product.title,
            price: product.price,
            quantity: item.quantity,
            thumbnail: product.thumbnail,
            totalPrice: product.price * item.quantity,
          };
        })
      );

      if (orderItemDetails.length === 0) {
        throw new Error("OrderItem Ids not created");
      }

      //  const totalPrice = orderItemDetails.reduce((sum, item) => sum + item.totalPrice, 0);
      const orderItems = orderItemDetails.map((item) => item.id);

      const placedOrder = await orderService.placedOrder(
        orderItems,
        user,
        address,
        taxCharge,
        shippingCharge,
        subTotal,
        totalPrice
      );

      if (!placedOrder)
        return res.status(422).json({ success: false, message: "Order is not placed" });

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
        orderDetails: orderItemDetails,
        razorpayOrder: razorpayOrder,
        user: userDetails,
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async placedCartOrder(req, res) {
    try {
      const { user, orderItem, taxCharge, shippingCharge, subTotal, totalPrice } =
        req.body;

      const userDetails = await authService.userbyId(user);

      if (!userDetails) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const { email, address } = userDetails;

      const orderItemIds = await Promise.all(
        orderItem.map(async function (item) {
          const product = await productService.productById(item.product.id);

          if (!product) {
            throw new Error(`Product with ID ${item.product.id} not found`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.title}`);
          }

          // console.log("100", item.product.id);

          const updateStock = await productService.updateStock(
            item.product.id,
            item.quantity
          );

          if (!updateStock) throw new Error("Product stock not updated");

          const createOrderItem = await orderService.createOrderItem(
            item.product.id,
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

      // let calculatePrice = await Promise.all(
      //   orderItemIds.map(async (item) => {
      //     console.log("Item IDs:", item);
      //     //  console.log(item);
      //     const orderItem = await orderService.orderItemById(item);

      //     if (!orderItem || !orderItem.product) {
      //       throw new Error(`Product details for OrderItem ID ${id} not found`);
      //     }

      //     //console.log("1", orderItem.product.price);
      //     const total = orderItem.product.price * orderItem.quantity;
      //     return total;
      //   })
      // );

      // const totalPrice = calculatePrice.reduce((a, b) => a + b, 0);

      //const shipAddress = await authService.userbyId(user);

      //console.log("address", shipAddress.address);

      // if (!shipAddress) {
      //   throw new Error(`shipAddress not found`);
      // }

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

      const deleteOrderItemIds = await Promise.all(
        orderItem.map(async function (item) {
          await cartService.deleteCartItem(item._id);
        })
      );

      if (!deleteOrderItemIds) {
        return res.status(422).json({ success: false, message: "Cart is not Cleared" });
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
  }

  async verifyPayment(req, res) {
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
  }

  async updateOrderStatus(req, res) {
    try {
      const id = req.params.id;
      const updateOrderStatus = await orderService.updateOrderStatus(id, req.body.status);
      //console.log(updateOrderStatus);
      if (!updateOrderStatus) {
        return res.status(404).json({ success: false });
      }
      return res.status(200).send(updateOrderStatus);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteOrder(req, res) {
    try {
      const orderId = req.params.id;
      //console.log(id);
      const response = await orderService.deleteOrder(orderId);
      //console.log(response);
      if (response) {
        return res.status(200).json({ Success: true, message: "order is Deleted..!" });
      } else {
        return res
          .status(404)
          .json({ Success: false, message: "order is not Deleted..!" });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async userOrderById(req, res) {
    try {
      const userId = req.params.id;

      const userOrderList = await orderService.userOrderList(userId);
      // console.log(userOrderList);
      if (!userOrderList) {
        return res.status(404).json({ success: false, message: "order not found" });
      }
      return res.status(200).send(userOrderList);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async totalOrders(req, res) {
    try {
      const totalOrders = await orderService.totalOrders();

      if (!totalOrders) {
        return res.status(404).json({ success: false });
      }
      console.log(totalOrders);

      res.status(200).json({ success: true, totalOrders: totalOrders });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  async totalSales(req, res) {
    try {
      const totalSales = await orderService.totalSales();
      if (!totalSales) {
        return res.status(404).json({
          success: false,
          message: "Total sales Cannot be generated",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Total sales generated",
        totalSales: totalSales,
      });
      //console.log(productList);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  async totalOrderItems(req, res) {
    try {
      const totalOrderItems = await orderService.totalOrderItems();
      if (!totalOrderItems) {
        return res.status(404).json({
          success: false,
          message: "Total sales Cannot be generated",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Total sales generated",
        totalOrderItems: totalOrderItems,
      });
      //console.log(productList);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  async fetchOrderStatus(req, res) {
    try {
      const response = await orderService.fetchOrderStatus();
      if (!response) {
        return res.status(404).json({
          success: false,
          message: "order status fetch failed",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Order status fetched Successfully",
        orderStatus: response,
      });
      //console.log(productList);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
}

module.exports = new orderController();
