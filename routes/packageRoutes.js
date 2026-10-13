const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Public endpoints
router.get('/', packageController.getAllPackages);
router.get('/featured', packageController.getFeaturedPackages);
router.get('/destinations', packageController.getDestinations);
router.get('/:identifier', packageController.getPackageBySlugOrId);

// Admin endpoints
router.get('/admin/all', authenticate, authorizeAdmin, packageController.adminGetAllPackages);
router.post('/admin', authenticate, authorizeAdmin, packageController.createPackage);
router.put('/admin/:id', authenticate, authorizeAdmin, packageController.updatePackage);
router.delete('/admin/:id', authenticate, authorizeAdmin, packageController.deletePackage);
router.patch('/admin/:id/toggle-publish', authenticate, authorizeAdmin, packageController.togglePublish);
router.patch('/admin/:id/toggle-featured', authenticate, authorizeAdmin, packageController.toggleFeatured);

module.exports = router;
