const express = require('express');
const router = express.Router();
const { TN_DISTRICTS, PRODUCT_CATEGORIES } = require('../config/constants');

router.get('/districts', (req, res) => res.json({ districts: TN_DISTRICTS }));
router.get('/categories', (req, res) => res.json({ categories: PRODUCT_CATEGORIES }));

module.exports = router;
