
const express = require("express");
const router = express.Router();

const { bookSOS, getSOSBooking } = require("../controllers/sosController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/book", authMiddleware, bookSOS);
router.get("/:id", authMiddleware, getSOSBooking);

=======
const express = require("express");
const router = express.Router();

const { bookSOS, getSOSBooking } = require("../controllers/sosController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/book", authMiddleware, bookSOS);
router.get("/:id", authMiddleware, getSOSBooking);

>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
module.exports = router;