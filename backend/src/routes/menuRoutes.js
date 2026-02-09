const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const menuController = require("../controllers/menuController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/categories", roleMiddleware(["admin"]), menuController.createCategory);
router.get("/categories/:depot_id", menuController.getCategories);
router.put("/categories/:id", roleMiddleware(["admin"]), menuController.updateCategory);
router.delete("/categories/:id", roleMiddleware(["admin"]), menuController.deleteCategory);

router.post("/", roleMiddleware(["admin"]), upload.single("image"), menuController.createMenu);
router.get("/:depot_id", menuController.getMenus);
router.put("/:id", roleMiddleware(["admin", "owner"]), upload.single("image"), menuController.updateMenu);
router.delete("/:id", roleMiddleware(["admin", "owner"]), menuController.deleteMenu);

module.exports = router;