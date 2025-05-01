const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const router = express.Router();

router.get("/fetch", dashboardController.fetch);

module.exports = router;
