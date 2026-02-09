const express = require("express");
const router = express.Router();

const tableController = require("../controllers/tableController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/:depot_id", tableController.getTables);

router.post("/", roleMiddleware(["admin", "kasir"]), tableController.createTable);
router.put("/:id", roleMiddleware(["admin", "kasir"]), tableController.updateTable);
router.delete("/:id", roleMiddleware(["admin", "kasir"]), tableController.deleteTable);

module.exports = router;