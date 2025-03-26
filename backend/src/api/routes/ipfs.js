const express = require('express');
const multer = require('multer');
const ipfsService = require('../../services/ipfsService');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload file to IPFS
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: true,
          message: 'No file uploaded'
        });
      }
      
      const ipfsHash = await ipfsService.uploadFile(req.file.buffer);
      
      res.status(201).json({
        success: true,
        ipfsHash,
        fileName: req.file.originalname
      });
    } catch (error) {
      res.status(400).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Upload JSON to IPFS
router.post(
  '/upload-json',
  authenticateToken,
  async (req, res) => {
    try {
      const { jsonData } = req.body;
      
      if (!jsonData) {
        return res.status(400).json({
          error: true,
          message: 'No JSON data provided'
        });
      }
      
      const ipfsHash = await ipfsService.uploadJSON(jsonData);
      
      res.status(201).json({
        success: true,
        ipfsHash
      });
    } catch (error) {
      res.status(400).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Pin file on IPFS
router.post(
  '/pin',
  authenticateToken,
  async (req, res) => {
    try {
      const { cid } = req.body;
      
      if (!cid) {
        return res.status(400).json({
          error: true,
          message: 'No CID provided'
        });
      }
      
      const result = await ipfsService.pinFile(cid);
      
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: true,
        message: error.message
      });
    }
  }
);

module.exports = router;