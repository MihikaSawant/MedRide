
const express = require("express");
const router = express.Router();

const {
createOrder,
getUserOrders,
getAllOrders,
updateOrderStatus
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/",authMiddleware,createOrder);

router.get("/my-orders",authMiddleware,getUserOrders);

router.get("/",getAllOrders);

router.put("/:id/status",updateOrderStatus);

module.exports = router;