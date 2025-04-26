const express = require("express");
const multer = require("multer");
const customIdolController = require("../controllers/customIdolController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/add/:id", upload.single("image"), customIdolController.addCustomProduct);

router.put("/update/status/:id", customIdolController.updateCustomProductStatus);

router.get("/fetch-list", customIdolController.fetchCustomProductList);

router.get("/fetch/user/:id", customIdolController.fetchCustomProductByUserId);

router.get("/fetch-list/:id", customIdolController.fetchCustomProductById);

router.post("/place_order", customIdolController.placedOrder);

router.post("/verify_payment", customIdolController.verifyPayment);

module.exports = router;
