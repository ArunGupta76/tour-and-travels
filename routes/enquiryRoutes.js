const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Public
router.post('/', enquiryController.submitEnquiry);

// Admin
router.get('/admin/all', authenticate, authorizeAdmin, enquiryController.adminGetAllEnquiries);
router.put('/admin/:id', authenticate, authorizeAdmin, enquiryController.adminUpdateEnquiry);
router.delete('/admin/:id', authenticate, authorizeAdmin, enquiryController.adminDeleteEnquiry);

module.exports = router;
