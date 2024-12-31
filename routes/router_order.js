const express = require("express");
const Order = require("../models/model_order");
const OrderItem = require("../models/model_orderItem");
//const Product = require("../models/model_product");
const router = express.Router();

router.get("/allorders", async (req, res) => {
  //console.log("Hii");
  try {
    const orders = await Order.find().populate("user", "name")
    .sort({ orderDate: -1 });
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "no orders placed" });
    }
    return res.status(200).send(orders);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const order = await Order.findOne({user:userId})
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ orderDate: -1 });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }
    return res.status(200).send(order);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/place_order", async (req, res) => {
  // console.log(req.body.orderItem);
  try {
    const orderItem = req.body.orderItem;

    const orderItemIds = await Promise.all(
      orderItem.map(async function (item) {
        const newOrderItem = new OrderItem({
          product: item.product,
          quantity: item.quantity,
        });

        const savedOrderItem = await newOrderItem.save();
        return savedOrderItem._id;
      })
    );

    if (orderItemIds.length === 0) {
      throw new Error("OrderItem Ids not created");
    }

    let calculatePrice = await Promise.all(
      orderItemIds.map(async (item) => {
        const orderItem = await OrderItem.findById(item).populate(
          "product",
          "price"
        );

        if (!orderItem) {
          throw new Error(`OrderItem with ID ${item} not found`);
        }
        if (!orderItem.product) {
          throw new Error(`Product details for OrderItem ID ${item} not found`);
        }
        //console.log("1", orderItem.product.price);
        const total = orderItem.product.price * orderItem.quantity;
        return total;
      })
    );

    const totalPrice = calculatePrice.reduce((a, b) => a + b, 0);

    const order = new Order({
      orderItems: orderItemIds,
      shipAddress: req.body.shipAddress,
      city: req.body.city,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });

    const placedOrder = await order.save();

    if (!placedOrder) {
      return res
        .status(422)
        .json({ success: false, message: "Orders is not placed" });
    }
    return res.status(200).send(placedOrder);
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
      return res
        .status(200)
        .json({ Success: true, message: "order is Deleted..!" });
    } else {
      return res
        .status(404)
        .json({ Success: false, message: "order is not Deleted..!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

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
});

router.get("/get/total_orders", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    if (!totalOrders) {
      return res.status(404).json({ success: false });
    }
    console.log(totalOrders);

    res.status(200).json({ totalOrders: totalOrders });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

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
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
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
