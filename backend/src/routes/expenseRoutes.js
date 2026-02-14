const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/:depot_id", expenseController.getExpenses);
router.post("/", roleMiddleware(["admin", "kasir"]), expenseController.createExpense);
router.put("/:id", roleMiddleware(["admin"]), expenseController.updateExpense);
router.delete("/:id", roleMiddleware(["admin"]), expenseController.deleteExpense);

module.exports = router;