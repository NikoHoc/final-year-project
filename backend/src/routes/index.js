const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const depotRoutes = require('./depotRoutes');

router.use('/auth', authRoutes);
router.use('/depots', depotRoutes);

module.exports = router;