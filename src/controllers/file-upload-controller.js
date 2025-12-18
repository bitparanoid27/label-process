/* External modules */
const fs = require('fs/promises');
const Papa = require('papaparse');

const prisma = require('../utils/prisma');
const { createNewJob, updateCurrentJob, markJobCompleted, markJobError } = require('../services/job-status-service.js');
const csvQueue = require('../queues/msgQ.js');

/* Internal modules */

// const csvUploader = async (req, res, next) => {
//   try {
//     /* Check if the file exists */

//     if (!req.file) {
//       return res.status(401).json({ message: 'No file was uploaded' });
//     }

//     let fileToBeUploadedToTheDb = req.file.path;

//     let fileContentToBeUploaded = await fs.readFile(fileToBeUploadedToTheDb, { encoding: 'utf-8' });

//     /* Converting string into structured data */

//     const parseResult = Papa.parse(fileContentToBeUploaded, {
//       header: true,
//       skipEmptyLines: true,
//     });

//     const parseData = parseResult.data;

//     const cleanParsedData = parseData.map(rawOrder => {
//       const cleanOrder = {
//         orderId: rawOrder['order-id'],
//         purchaseDate: new Date(rawOrder['purchase-date']),
//         buyerName: rawOrder['buyer-name'],
//         productName: rawOrder['product-name'],
//         sku: rawOrder['sku'],
//         quantityPurchased: parseInt(rawOrder['quantity-purchased']),
//         itemPrice: parseFloat(rawOrder['item-price']),
//         shippingPrice: parseFloat(rawOrder['shipping-price']),
//         itemTax: parseFloat(rawOrder['item-tax']),
//         orderTotal: parseFloat(rawOrder['order-total']),
//         shipToCity: rawOrder['ship-to-city'],
//         shipToState: rawOrder['ship-to-state'].toUpperCase(),
//         shipToPostalCode: parseInt(rawOrder['ship-to-postal-code']),
//         orderStatus: rawOrder['order-status'],
//       };

//       return cleanOrder;
//     });

//     console.log(cleanParsedData);

//     /* Insert orders into db */

//     try {
//       const dbInsertSuccess = await prisma.masterOrder.createMany({ data: cleanParsedData });

//       if (dbInsertSuccess) {
//         return res.status(201).json({
//           message: 'Records inserted successfully into the master database.',
//         });
//       }

//       console.log('File uploaded successfully', req.file);

//       if (req.file) {
//         return res.status(200).json({
//           message: 'File uploaded successfully',
//           filename: req.file.filename,
//           path: req.file.path,
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       return res.status(501).json({
//         message: 'Failed to import data.',
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

const csvUploader = async (req, res, next) => {
  /* csv uploader is just going to call various fns
  rest of the work will happen in background */

  console.log(`${req.file.path}`);

  try {
    /* file received on the end-point */
    const newJobCreated = await createNewJob({
      platformId: req.body.platformId,
      filePath: req.file.path,
    });

    console.log('Job created');

    const jobTicket = {
      jobId: newJobCreated.id,
      platformId: newJobCreated.platformId,
      filePath: newJobCreated.filePath,
    };

    const dbJobStatus = await csvQueue.add('process-csv', jobTicket);

    return res.status(200).json({
      message: 'File upload started wait until the upload is complete',
      jobId: newJobCreated.id,
    });
    /*
     */
  } catch (error) {
    console.error('Error in csvUploader:', error);
    res.status(500).json({ message: 'Failed to start file processing.' });
  }
};

module.exports = csvUploader;
