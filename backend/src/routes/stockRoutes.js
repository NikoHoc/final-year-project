const express = require("express");
const router = express.Router();

const stockController = require("../controllers/stockController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/:depot_id", stockController.getMutations);
router.post("/", roleMiddleware(["admin", "kasir"]), stockController.createMutation);
router.put("/:id/status", roleMiddleware(["admin", "kasir"]), stockController.updateMutationStatus);
router.put("/:id", roleMiddleware(["admin", "kasir"]), stockController.updateMutation);
router.delete("/:id", roleMiddleware(["admin", "kasir"]), stockController.deleteMutation);

module.exports = router;