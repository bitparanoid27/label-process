/* External modules */

const multer = require('multer');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

/* Internal modules */
const AppError = require('../utils/appError.js');

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

const directoryMap = {
  orders: 'temp-orders',
  products: 'temp-products',
  boxes: 'temp-boxes',
  couriers: 'temp-couriers',
};

const file_organizer = (req, res, next) => {
  const incomingFilePath = req.file.path;
  const incomingFileLabel = req.body.file_category;

  console.log(incomingFilePath);
  console.log(incomingFileLabel);

  if (!incomingFileLabel) {
    return next(new AppError('File category must be provided'));
  }

  const cleanedFileLabel = incomingFileLabel.trim().toLowerCase();

  if (!directoryMap[cleanedFileLabel]) {
    return next(new AppError('Incorrect operation selected'));
  }

  if (directoryMap[cleanedFileLabel]) {
    const tempDirectory = path.join(process.cwd(), directoryMap[cleanedFileLabel]);
    const targetDirectoryAddress = path.join(tempDirectory, req.file.filename);

    if (!fs.existsSync(tempDirectory)) {
      fs.mkdirSync(tempDirectory, { recursive: true });
      console.log(`Directory ${tempDirectory} created successfully`);
    }

    fs.rename(incomingFilePath, targetDirectoryAddress, err => {
      if (err) {
        console.log(`Error occured during ${cleanedFileLabel} file movement ${err}`);
        return next(err);
      }
      console.log(`File moved successfully to the ${targetDirectoryAddress} folder`);
      req.file.path = targetDirectoryAddress;
      next();
    });
  }
};

module.exports = { upload_csv_middleware, file_organizer };
