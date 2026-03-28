/**
 * Order routes.
 * Keeps route definitions separate from controller logic.
 */
const express = require("express");
const router = express.Router();
const { postValidate, getOrders, getOrderById } = require("../controllers/orderController");

router.post("/validate", postValidate);
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);

module.exports = router;
