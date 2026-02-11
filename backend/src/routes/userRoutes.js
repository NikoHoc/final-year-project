const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.get('/profile', userController.getMyProfile);
router.put('/profile', userController.updateMyProfile);

router.post('/employees', roleMiddleware(['admin']), userController.createEmployee);
router.get('/employees/:depot_id', roleMiddleware(['admin']), userController.getEmployees);
router.delete('/employees/:id', roleMiddleware(['admin']), userController.deleteEmployee);

module.exports = router;