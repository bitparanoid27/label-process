/* External modules */

const express = require('express');
const csvUploader = require('../controllers/file-upload-controller');
const { upload_csv_middleware, file_organizer } = require('../services/file-upload-multer');

const router = express.Router();

router.post('/uploads', upload_csv_middleware.single('file'), file_organizer, csvUploader);

module.exports = router;
