const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const upload = require('../middleware/upload');

// Admin Dashboard stats
router.get('/dashboard-stats', authenticate, authorizeAdmin, adminController.getDashboardStats);

// Image Upload endpoint for packages, banners, settings
router.post('/upload', authenticate, authorizeAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Image uploaded successfully!',
    fileUrl,
    filename: req.file.filename,
  });
});

// Multiple image upload endpoint
router.post('/upload-multiple', authenticate, authorizeAdmin, upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one image file.' });
  }

  const fileUrls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({
    success: true,
    message: 'Images uploaded successfully!',
    fileUrls,
  });
});

module.exports = router;
