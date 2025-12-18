/* External modules */

const express = require('express');
const csvUploader = require('../controllers/file-upload-controller');
const upload_csv_middleware = require('../services/file-upload-multer');

const router = express.Router();

router.post('/uploads', upload_csv_middleware.single('file'), csvUploader);

module.exports = router;
