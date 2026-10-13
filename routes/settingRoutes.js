const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Public
router.get('/', settingController.getPublicSettings);

// Admin
router.put('/admin', authenticate, authorizeAdmin, settingController.updateSettings);

module.exports = router;
