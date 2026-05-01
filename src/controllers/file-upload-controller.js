/* External modules */
const { createNewJob, updateCurrentJob, markJobCompleted, markJobError } = require('../services/job-status-service.js');
const csvQueue = require('../queues/msgQ.js');

/* Internal modules */
const errorhandler = require('../utils/utils');
const refDataProcessor = require('../services/reference-service.js');

const uploadOperationalData = errorhandler(async (req, res, next) => {
  const receivedFilePath = req.file.path;
  const receivedFileCategory = req.body.file_category;
  if (req.body.file_category !== 'orders') {
    const returnedOpsUploadResult = await refDataProcessor(receivedFilePath, receivedFileCategory);

    if (returnedOpsUploadResult) {
      return res.status(200).json({
        status: `${req.body.file_category}'s data successfully uploaded to the database.`,
      });
    } else {
      return res.status(500).json({
        status: `${req.body.file_category}'s data upload failed due to an internal error.`,
      });
    }
  }
  next();
});

const orderUploader = errorhandler(async (req, res, next) => {
  if (req.body.file_category === 'orders') {
    console.log('Working with orders');

    const uploadJobDetails = await createNewJob({
      platformId: req.body.platformId,
      filePath: req.file.path,
    });

    const jobTicket = {
      jobId: uploadJobDetails.id,
      platformId: uploadJobDetails.platformId,
      filePath: uploadJobDetails.filePath,
    };

    await csvQueue.add('process-csv', jobTicket);
    return res.status(200).json({
      message: 'File upload started, wait for the upload to be completed',
      jobId: uploadJobDetails.id,
    });
  }
});

module.exports = { uploadOperationalData, orderUploader };

// const csvUploader = errorhandler(async (req, res, next) => {
//   //  If orders file is uploaded by the user. Then create a background job and start uploading asynchoronously.
//   // If file is not of orders then invoke refDataProcessor start upload synchoronously as data it contains little data.
//
//   /* file received on the end-point */
//   if (req.body.file_category !== 'orders') {
//     let returnedRefResult = await refDataProcessor2(req);
//     console.log(returnedRefResult);
//
//     return res.status(200).json({
//       status: 'success',
//       message: 'Reference data upload started.',
//     });
//   }
//
//   const newJobCreated = await createNewJob({
//     platformId: req.body.platformId,
//     filePath: req.file.path,
//   });
//
//   console.log('Job created');
//
//   const jobTicket = {
//     jobId: newJobCreated.id,
//     platformId: newJobCreated.platformId,
//     filePath: newJobCreated.filePath,
//   };
//
//   const dbJobStatus = await csvQueue.add('process-csv', jobTicket);
//   return res.status(200).json({
//     message: 'File upload started wait until the upload is complete',
//     jobId: newJobCreated.id,
//   });
// });
