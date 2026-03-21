
const express = require("express");
const router = express.Router();

const {
addMedicine,
getMedicines,
deleteMedicine
} = require("../controllers/medicineController");

router.post("/", addMedicine);

router.get("/", getMedicines);

router.delete("/:id", deleteMedicine);

=======
const express = require("express");
const router = express.Router();

const {
addMedicine,
getMedicines,
deleteMedicine
} = require("../controllers/medicineController");

router.post("/", addMedicine);

router.get("/", getMedicines);

router.delete("/:id", deleteMedicine);

>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
module.exports = router;