const CSVFileValidator = require('csv-file-validator');
const config = require('../configs/test-config');

const dummyCSV = `order-id,item-price
205-12345,9.99
205-67890,15.50`;

CSVFileValidator(dummyCSV, config)
  .then(csvData => {
    if (!csvData) {
      console.log(csvData.inValidData);
    } else {
      console.log(csvData.data);
    }
  })
  .catch(err => console.log('Error occurred', err));

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

/* Backup just in case */
// const fileUploader = async job => {
//   const { jobId, platformId, filePath } = job.data;

//   console.log(`New worker has started`);

//   const selectedConfig = platformRegistry[platformId];

//   if (!selectedConfig) {
//     console.error("Selected platform config doesn't exist for the", platformId);
//     throw new Error(`Configuration missing for ${platformId}`);
//   }

//   let fileToBeUploaded = null;
//   /* Retrieve file, read it, parse with papa-parse --> store the parsed result */
//   fileToBeUploaded = filePath;
//   const fileContentToBeUploaded = await fs.readFile(fileToBeUploaded, { encoding: 'utf-8' });

//   /* Parse the file with Papa-parse */
//   const parsedResult = Papa.parse(fileContentToBeUploaded, { header: true, skipEmptyLines: true });
//   const parsedData = parsedResult.data;

//   /*  Ensuring correct config file is selected for the correct platform. */

//   if (platformId !== selectedConfig.platformName) {
//     console.log('Platform name mis-matched, insertion aborted');
//     throw new Error('Platform ID mismatch');
//   }

//   const mappedObjForDb = await dbCsvColumnMapper(selectedConfig, parsedData);
//   const dbReadyObject = dbOrderTransformer(mappedObjForDb);

//   try {
//     const userProvidedPlatformId = await prisma.platforms.findFirst({
//       where: {
//         platform_name: platformId,
//       },
//     });

//     if (!userProvidedPlatformId) {
//       // If the DB returns null, stop immediately.
//       throw new Error(`Platform '${platformId}' does not exist in the 'Platforms' database table.`);
//     }

//     const prismaRecordStatus = await prisma.$transaction(async tx => {
//       for (const orderData of dbReadyObject) {
//         /* Destructure the incoming object */
//         const { order_items, data_dump, ...headerDetails } = orderData;

//         await tx.masterOrders.upsert({
//           where: {
//             platform_order_id: headerDetails.platform_order_id,
//           },

//           create: {
//             ...headerDetails,
//             platform_id: parseInt(userProvidedPlatformId.id),
//             order_items: {
//               create: order_items,
//             },
//             data_dump: {
//               create: data_dump,
//             },
//           },

//           update: {
//             order_items: {
//               create: order_items,
//             },
//             data_dump: {
//               create: data_dump,
//             },
//           },
//         });
//       }
//     });

//     console.log('Success during database transaction testing');

//     currentJobStatus = await markJobCompleted(jobId, (resultMessage = 'File processed successfully'));
//     console.log('File processed successfully', currentJobStatus);
//     console.log(`Job status changed to completed for the job-id ${jobId}`);

//     updateCurrentJob(jobId, 'completed');

//     return { status: 'completed', timeStamp: new Date().toISOString() };
//   } catch (error) {
//     console.log('Error occured during database transaction testing', error);
//   } finally {
//     try {
//       if (fileToBeUploaded) {
//         await fs.unlink(fileToBeUploaded);
//         console.log('File deleted from the Uploads folder');
//       }
//     } catch (error) {
//       console.log(`Error occured during file deletion`);
//       return;
//     }
//   }
// };

// const orderProcessor2 = async job => {
//   try {
//     /* Destructure the incoming job data into various variables */
//     if (!job) {
//       throw new Error('Job id missing');
//     }
//     const { jobId, platformId, filePath } = job.data;

//     console.log(`New worker has started`);

//     const selectedConfig = platformRegistry[platformId];
//     if (!selectedConfig) {
//       console.error("Selected platform config doesn't exist for the", platformId);
//       throw new AppError(`Configuration missing for ${platformId}`);
//     }

//     /* Retrieve file, read it, parse with papa-parse --> store the parsed result */

//     let fileToBeUploaded = null;
//     fileToBeUploaded = filePath;
//     let fileContentToBeUploaded;
//     try {
//       fileContentToBeUploaded = await fs.readFile(fileToBeUploaded, { encoding: 'utf-8' });
//     } catch (error) {
//       if (error.code === 'ENOENT') {
//         throw new AppError(`File not found at the path ${filePath}`);
//       }
//       if (error.code === 'EISDIR') {
//         throw new AppError(`Expected to read the file, but found directory only`);
//       }
//       if (error.code === 'EACCES') {
//         throw new AppError(`In-sufficient credentials/access for the reading the file.`);
//       }
//       throw error;
//     }

//     /* Parse the file with Papa-parse */
//     const parsedResult = Papa.parse(fileContentToBeUploaded, { header: true, skipEmptyLines: true });
//     const parsedData = parsedResult.data;

//     /*  Ensuring correct config file is selected for the correct platform. */

//     if (platformId !== selectedConfig.platformName) {
//       console.log('Platform name mis-matched, insertion aborted');
//       throw new Error('Platform ID mismatch');
//     }

//     const mappedObjForDb = await dbCsvColumnMapper(selectedConfig, parsedData);
//     const dbReadyObject = dbOrderTransformer(mappedObjForDb);

//     try {
//       const userProvidedPlatformId = await prisma.platforms.findFirst({
//         where: {
//           platform_name: platformId,
//         },
//       });

//       if (!userProvidedPlatformId) {
//         /* If the DB returns null, stop immediately. */
//         throw new Error(`Platform '${platformId}' does not exist in the 'Platforms' database table.`);
//       }

//       const prismaRecordStatus = await prisma.$transaction(async tx => {
//         for (const orderData of dbReadyObject) {
//           /* Destructure the incoming object */
//           const { order_items, data_dump, ...headerDetails } = orderData;

//           await tx.masterOrders.upsert({
//             where: {
//               platform_order_id: headerDetails.platform_order_id,
//             },

//             create: {
//               ...headerDetails,
//               platform_id: parseInt(userProvidedPlatformId.id),
//               order_items: {
//                 create: order_items,
//               },
//               data_dump: {
//                 create: data_dump,
//               },
//             },

//             update: {
//               order_items: {
//                 create: order_items,
//               },
//               data_dump: {
//                 create: data_dump,
//               },
//             },
//           });
//         }
//       });

//       console.log('Success during database transaction testing');

//       currentJobStatus = await markJobCompleted(jobId, (resultMessage = 'File processed successfully'));
//       console.log('File processed successfully', currentJobStatus);

//       updateCurrentJob(jobId, 'completed');
//       console.log(`Job status changed to completed for the job-id ${jobId}`);

//       return { status: 'completed', timeStamp: new Date().toISOString() };
//     } catch (error) {}
//   } catch (error) {}
// };
