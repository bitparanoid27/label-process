/* External modules */
const multer = require('multer');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('node:fs/promises');

/* Internal modules */
const AppError2 = require('../utils/appError2');
const PATHS = require('../configs/paths');
const errorHandler = require('../utils/utils');

const destination_folder = path.join(PATHS.uploads);

const storageOptions = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, destination_folder);
  },
  filename: function (req, file, cb) {
    const file_extension = path.extname(file.originalname);
    const generated_filename = uuidv4();
    cb(null, `${generated_filename}${file_extension}`);
  },
});

const fileFilterOptions = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new AppError2('Invalid file submitted'));
  }
};

const uploadCsv = multer({
  storage: storageOptions,
  fileFilter: fileFilterOptions,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const supportedOperations = Object.keys(PATHS);
const fileValidator = errorHandler(async (req, res, next) => {
  if (req.file === undefined) {
    return next(new AppError2('File not received. File missing or corrupted', 400));
  }
  if (req.body.file_category === undefined) {
    return next(new AppError2('File category not provided', 400));
  }

  const receivedFilePath = req?.file.path;
  const receivedFileLabel = req?.body?.file_category;
  const cleanedFileLabel = receivedFileLabel.trim().toLowerCase();

  // If unsupported operation, remove file from the uploads folder, pass error to Express and exit.
  if (!supportedOperations.includes(cleanedFileLabel)) {
    // Async operation, call next after completion of async operation.
    await fs.unlink(receivedFilePath);
    return next(new AppError2('Un-supported operation', 400));
  }

  next();
});
const fileMover = errorHandler(async (req, res, next) => {
  // Read the incoming file's meta-data.
  const receivedLabel = req?.body?.file_category;
  const cleanedFileLabel = receivedLabel.trim().toLowerCase();

  const destinationPath = path?.join(PATHS[cleanedFileLabel], req.file.filename);
  const sourcePath = path?.join(PATHS['uploads'], req.file.filename);

  //   Move the file to the temporary folder.
  await fs.rename(sourcePath, destinationPath);
  console.log(`File move successfully to the ${cleanedFileLabel} directory`);

  req.file.path = destinationPath;
  next();
});

module.exports = { uploadCsv, fileValidator, fileMover };
