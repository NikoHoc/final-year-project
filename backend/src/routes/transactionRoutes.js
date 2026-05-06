const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/notification", transactionController.midtransNotification);

router.use(authMiddleware);

router.post("/", transactionController.createTransaction);
router.post("/:id/items", roleMiddleware(["kasir", "pelayan"]), transactionController.addTransactionItems);

router.put("/:id/confirm", roleMiddleware(["admin", "kasir"]), transactionController.confirmTransaction);
router.put("/:id/reject", roleMiddleware(["admin", "kasir"]), transactionController.rejectTransaction);

router.put("/:id/status", roleMiddleware(["admin", "kasir", "pelayan"]), transactionController.updateTransactionStatus);

router.get("/depot/:depot_id", transactionController.getTransactions);
router.get("/:id", transactionController.getTransactionDetail);

router.put("/:id/print-items", roleMiddleware(["kasir", "pelayan"]), transactionController.updateItemsPrintStatus);
router.put('/:id/pay', transactionController.processPayment);

router.put("/:id/items/:itemId/serve-status", authMiddleware, roleMiddleware(["kasir", "pelayan"]), transactionController.updateServeStatus);
router.put("/:id/items/:itemId/quantity", authMiddleware, roleMiddleware(["kasir", "pelayan"]), transactionController.updateItemQuantity);
router.delete("/:id/items/:itemId", authMiddleware, roleMiddleware(["kasir", "pelayan"]), transactionController.deleteTransactionItem);

module.exports = router;