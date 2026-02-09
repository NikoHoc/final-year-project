const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/", roleMiddleware(["admin"]), categoryController.createCategory);
router.put("/:id", roleMiddleware(["admin"]), categoryController.updateCategory);
router.delete("/:id", roleMiddleware(["admin"]), categoryController.deleteCategory);
router.get("/:depot_id", categoryController.getCategories);

module.exports = router;