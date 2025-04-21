const express = require("express");
const multer = require("multer");
const customIdolController = require("../controllers/customIdolController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();
router.post("/add/:id", upload.single("image"), customIdolController.addCustomProduct);

router.get("/fetch-list", customIdolController.fetchCustomProductList);

router.get("/fetch-list/:id", customIdolController.fetchCustomProductById);

module.exports = router;
