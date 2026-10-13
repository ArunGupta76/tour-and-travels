const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

router.get('/admin/all', authenticate, authorizeAdmin, userController.getAllUsers);
router.get('/admin/:id', authenticate, authorizeAdmin, userController.getUserDetails);
router.patch('/admin/:id/toggle-status', authenticate, authorizeAdmin, userController.toggleUserStatus);

module.exports = router;
