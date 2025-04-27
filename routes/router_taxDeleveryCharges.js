const express = require("express");
const taxDeliveryChargesController = require("../controllers/taxDeliveryChargesController");

const router = express.Router();

router.post("/add", taxDeliveryChargesController.addTaxDeliveryCharges);

router.get("/fetch", taxDeliveryChargesController.fetchTaxDeliveryCharges);

router.put("/update/:id", taxDeliveryChargesController.updateTaxDeliveryCharges);

router.delete("/delete/:id", taxDeliveryChargesController.deleteTaxDeliveryCharges);

module.exports = router;
