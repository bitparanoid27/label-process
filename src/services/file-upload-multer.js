/* External modules */

const multer = require('multer');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const destination_folder = path.join(process.cwd(), 'uploads');

console.log(destination_folder);

const storage_options = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, destination_folder);
  },
  filename: function (req, file, cb) {
    const file_extension = path.extname(file.originalname);
    const generated_filename = uuidv4();
    cb(null, `${generated_filename}${file_extension}`);
  },
});

const file_filter_options = (req, file, cb) => {
  if (file.mimetype == 'text/csv' || file.originalname.toLowerCase().endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file submitted'));
  }
};

const upload_csv_middleware = multer({
  storage: storage_options,
  fileFilter: file_filter_options,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload_csv_middleware;
