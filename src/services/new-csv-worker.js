/* External modules */

const { Worker, Job, tryCatch } = require('bullmq');
const Papa = require('papaparse');
const fs = require('fs/promises');

/* Internal modules */
const { updateCurrentJob, markJobCompleted, markJobError } = require('../services/job-status-service.js');
const prisma = require('../utils/prisma');

const orderProcessor = require('../services/order-processor.js');
const dbCsvColumnMapper = require('../utils/csvMapper.js');

const amznLavvMapperConfigFile = require('../configs/amzn-lavv.js');
const amznSterlingMapperConfigFile = require('../configs/amzn-sterling.js');
const ebayLavvMapperConfigFile = require('../configs/ebay-lavv.js');
const ebaySterlingMapperConfigFile = require('../configs/ebay-sterling.js');

/* Transformer to transform flat object to db insertion ready object  */

const dbOrderTransformer = require('../utils/dataTransformer.js');

/* Schema config files to map incoming data with db required format. */

const platformRegistry = {
  amzn_lavv: amznLavvMapperConfigFile,
  amzn_sterling: amznSterlingMapperConfigFile,
  ebay_lavv: ebayLavvMapperConfigFile,
  ebay_sterling: ebaySterlingMapperConfigFile,
};

/* redis connection */

console.log('Checkpoint 1: Starting csv-worker.js file...');

const redisConnection = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
};

/* Making the fn more efficient and remember to pass it to the worker*/

const fileUploader = async job => {
  const { jobId, platformId, filePath } = job.data;
  const fileToBeUploaded = filePath;
  try {
    const newOrderFnTester = await orderProcessor(job);
    if (newOrderFnTester) {
      console.log('Modular code running successfully');
    }
  } catch (error) {
    console.error(`Worker execution failed for Job ${jobId}:`, error.message);
    throw error;
  } finally {
    try {
      if (fileToBeUploaded) {
        await fs.unlink(fileToBeUploaded);
        console.log('File deleted from the temp-orders folder');
      }
    } catch (error) {
      console.log(`Error occured during file deletion`);
      return;
    }
  }
};

const worker = new Worker('process-csv', fileUploader, { connection: redisConnection });

worker.on('ready', () => {
  console.log('Worker is ready and connected to Redis.');
});

worker.on('error', err => {
  // This will report connection errors
  console.error('Worker encountered an error:', err);
});

worker.on('completed', job => {
  console.log(`File uploaded to the database, job id: ${job.id}`);
});

worker.on('failed', job => {
  console.log(`File upload to the database failed, job id: ${job.id}`);
});

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
