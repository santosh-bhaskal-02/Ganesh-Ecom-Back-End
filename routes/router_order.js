const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();

const sendEmail = require("../config/config_brevo");

router.get("/allorders", orderController.allOrders);

router.get("/fetch_orders/:id", orderController.orderById);

router.post("/place_order", orderController.placedOrder);

router.post("/verify_payment", orderController.verifyPayment);

router.post("/place_order_cart", orderController.placedCartOrder);

router.put("/update/:id", orderController.updateOrderStatus);

router.put("/cancel_order/:id", orderController.updateOrderStatus);

router.delete("/delete/:id", orderController.deleteOrder);

router.get("/get/total_sales", orderController.totalSales);

router.get("/get/total_orders", orderController.totalOrders);

router.get("/get/user_orders/:id", orderController.userOrderById);

router.get("/fetch/status", orderController.fetchOrderStatus);

module.exports = router;
