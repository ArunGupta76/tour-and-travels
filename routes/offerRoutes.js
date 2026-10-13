const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Public
router.get('/', offerController.getActiveOffers);

// Admin
router.get('/admin/all', authenticate, authorizeAdmin, offerController.adminGetAllOffers);
router.post('/admin', authenticate, authorizeAdmin, offerController.createOffer);
router.put('/admin/:id', authenticate, authorizeAdmin, offerController.updateOffer);
router.delete('/admin/:id', authenticate, authorizeAdmin, offerController.deleteOffer);
router.patch('/admin/:id/toggle-status', authenticate, authorizeAdmin, offerController.toggleOfferStatus);

module.exports = router;
