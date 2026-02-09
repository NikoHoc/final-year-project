const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const depotRoutes = require('./depotRoutes');
const menuRoutes = require('./menuRoutes');

router.use('/auth', authRoutes);
router.use('/depots', depotRoutes);
router.use('/menus', menuRoutes);

module.exports = router;