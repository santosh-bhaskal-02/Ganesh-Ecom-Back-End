const express = require("express");
const Order = require("../models/model_order");
const OrderItem = require("../models/model_orderItem");
const User = require("../models/model_user");
const Product = require("../models/model_product");
const orderController = require("../controllers/orderController");
const router = express.Router();
const mongoose = require("mongoose");

const sendEmail = require("../config/config_brevo");

router.get("/allorders", async (req, res) => {
  //console.log("Hii");
  try {
    const orders = await Order.find()
      .populate("user")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ orderDate: -1 });
    if (!orders) {
      return res.status(404).json({ success: false, message: "no orders placed" });
    }
    return res.status(200).send(orders);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/fetch_orders/:id", async (req, res) => {
  try {
    console.log("usecart ", req.params.id);
    const userId = req.params.id;
    const order = await Order.find({ user: userId })
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ orderDate: -1 });
    console.log("Order ", order);
    if (!order) {
      return res.status(404).json({ success: false, message: "order not found" });
    }
    return res.status(200).send(order);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/place_order", async (req, res) => {
  try {
    const { user, orderItem } = req.body;

    // Fetch user details (email & address)
    const userDetails = await User.findById(user).select("email address");
    if (!userDetails) throw new Error("User not found");

    const { email, address } = userDetails;

    // Process order items
    const orderItemDetails = await Promise.all(
      orderItem.map(async (item) => {
        const product = await Product.findById(item.productId).select(
          "title price stock thumbnail"
        );
        if (!product) throw new Error(`Product with ID ${item.productId} not found`);
        if (product.stock < item.quantity)
          throw new Error(`Insufficient stock for ${product.title}`);

        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });

        const newOrderItem = new OrderItem({
          product: item.productId,
          quantity: item.quantity,
        });
        const savedOrderItem = await newOrderItem.save();

        return {
          id: savedOrderItem.id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
          thumbnail: product.thumbnail,
          totalPrice: product.price * item.quantity,
        };
      })
    );

    // Calculate total price
    const totalPrice = orderItemDetails.reduce((sum, item) => sum + item.totalPrice, 0);

    // Save order in DB
    const order = new Order({
      orderItems: orderItemDetails.map((item) => item.id),
      shipAddress: address,
      status: "pending",
      totalPrice: totalPrice,
      user: user,
    });

    const placedOrder = await order.save();
    if (!placedOrder)
      return res.status(422).json({ success: false, message: "Order is not placed" });

    // Generate email template with order details
    const orderItemsHtml = orderItemDetails
      .map(
        (item) => `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <img src="${item.thumbnail.image_url}" style="width: 50px; height: 50px; border-radius: 5px;" alt="Product">
          <div>
            <p><strong>${item.title}</strong></p>
            <p>Price: ₹${item.price} x ${item.quantity} = ₹${item.totalPrice}</p>
          </div>
        </div>
      `
      )
      .join("");

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Order Confirmation</h2>
        <p>Thank you for your order! Here are your order details:</p>

        <h3>Order Items</h3>
        ${orderItemsHtml}

        <h3>Delivery Address</h3>
        <p>${address.address1}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}</p>

        <h3>Total Price</h3>
        <p><strong>₹${totalPrice}</strong></p>

        <p>We will notify you once your order is shipped.</p>
      </div>
    `;

    // Send confirmation email
    await sendEmail(email, "Order Placed Successfully", emailTemplate);

    return res.status(200).json({
      success: true,
      message: "Order Placed Successfully",
      order: placedOrder,
      orderDetails: orderItemDetails,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/place_order_cart", async (req, res) => {
  console.log("useId ", req.body.user);
  console.log(req.body.orderItem);

  try {
    const { user, orderItem } = req.body;

    const orderItemIds = await Promise.all(
      orderItem.map(async function (item) {
        const product = await Product.findById(item.product.id);
        // console.log(item)

        if (!product) {
          throw new Error(`Product with ID ${item.product.id} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }

        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });

        const newOrderItem = new OrderItem({
          product: item.product.id,
          quantity: item.quantity,
        });

        const savedOrderItem = await newOrderItem.save();
        return savedOrderItem.id;
      })
    );

    console.log("OrderItem IDs:", orderItemIds);

    if (orderItemIds.length === 0) {
      throw new Error("OrderItem Ids not created");
    }

    let calculatePrice = await Promise.all(
      orderItemIds.map(async (item) => {
        console.log("Item IDs:", item);
        //  console.log(item);
        const orderItem = await OrderItem.findById(item).populate("product", "price");

        if (!orderItem || !orderItem.product) {
          throw new Error(`Product details for OrderItem ID ${id} not found`);
        }

        console.log("1", orderItem.product.price);
        const total = orderItem.product.price * orderItem.quantity;
        return total;
      })
    );

    const totalPrice = calculatePrice.reduce((a, b) => a + b, 0);

    const shipAddress = await User.findById(user).select("address");
    console.log("address", shipAddress.address);
    if (!shipAddress) {
      throw new Error(`shipAddress not found`);
    }

    const order = new Order({
      orderItems: orderItemIds,
      shipAddress: shipAddress.address,

      status: "pending",
      totalPrice: totalPrice,
      user: user,
    });

    const placedOrder = await order.save();

    if (!placedOrder) {
      return res.status(422).json({ success: false, message: "Orders is not placed" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Order Placed Successfully", order: placedOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findByIdAndUpdate(
      id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({ success: false });
    }
    return res.status(200).send(order);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    //console.log(id);
    const response = await Order.findByIdAndDelete(id);
    //console.log(response);
    if (response) {
      await Promise.all(
        response.orderItems.map(async (item) => {
          // console.log("1",item);

          await OrderItem.findByIdAndDelete(item);
        })
      );
      return res.status(200).json({ Success: true, message: "order is Deleted..!" });
    } else {
      return res.status(404).json({ Success: false, message: "order is not Deleted..!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/get/total_sales", orderController.totalSales);

router.get("/get/total_orders", orderController.totalOrders);

router.get("/get/user_orders/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userOrderList = await Order.find({ user: id })
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ orderDate: -1 });

    if (!userOrderList) {
      return res.status(404).json({ success: false, message: "order not found" });
    }
    return res.status(200).send(userOrderList);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

/*
    let totalPrice = 0;

    await Promise.all(
      orderItem.map(async (item) => {
        let product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product with ID ${item.product} not found`);
        }

        // console.log("1","pr: ", product.price,"Q: " , item.quantity);

        //let price = item.quantity * product.price;
        //console.log("2", price);

        totalPrice += item.quantity * product.price;
        //  console.log("3", totalPrice);
      })
    );
    // console.log("4", totalPrice);
*/

/*
   router.get("/get/total_sales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    if (!totalSales) {
      res.status(404).json({
        success: false,
        message: "Total sales Cannot be generated",
      });
    }
    res.status(200).send({ totalSales: totalSales.pop().total });
    //console.log(productList);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});*/

/*router.get("/get/total_orders",async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    if (!totalOrders) {
      return res.status(404).json({ success: false });
    }
    console.log(totalOrders);

    res.status(200).json({ totalOrders: totalOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});*/
