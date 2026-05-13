const express = require("express");
const router = express.Router();
const settlementController = require("../controllers/settlementController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/today/:depot_id", roleMiddleware(["admin", "kasir"]), settlementController.getTodaySummary);
router.post("/process", roleMiddleware(["admin", "kasir"]), settlementController.processSettlement);

router.get("/:depot_id", roleMiddleware(["admin", "kasir"]), settlementController.getSettlements);
router.get("/detail/:id/transactions", roleMiddleware(["admin", "kasir"]), settlementController.getSettlementTransactions);

module.exports = router;