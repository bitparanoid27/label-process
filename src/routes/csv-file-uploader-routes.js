/* External modules */

const express = require('express');
const { uploadOperationalData, orderUploader } = require('../controllers/file-upload-controller');
const { uploadCsv, fileValidator, fileMover } = require('../services/file-upload-multer');

const router = express.Router();

router.post('/uploads', uploadCsv.single('file'), fileValidator, fileMover, uploadOperationalData, orderUploader);

module.exports = router;
