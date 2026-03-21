
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

=======
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

>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
module.exports = router;