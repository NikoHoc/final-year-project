const express = require('express');
const router = express.Router();

const depotController = require("../controllers/depotController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/", roleMiddleware(["admin"]), depotController.createDepot);
router.put("/:id", roleMiddleware(["admin"]), depotController.updateDepot);
router.get("/", depotController.getDepots);
router.get("/:id", depotController.getDepotDetail);
router.post("/:id/payment-config", roleMiddleware(["admin"]), depotController.setupPayment);
router.put("/:id/status", roleMiddleware(["admin", "kasir"]), depotController.toggleStatus);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), depotController.deleteDepot);

module.exports = router;