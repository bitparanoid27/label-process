/* External modules */
const { Worker, Job, tryCatch } = require('bullmq');
const fs = require('fs/promises');

/* Internal modules */
const orderProcessor = require('../services/order-processor.js');

/* redis connection */
console.log('Checkpoint 1: Starting csv-worker.js file...');
const redisConnection = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
};

/* Making the fn more efficient and remember to pass it to the worker*/
const fileUploader = async job => {
  let fileToBeUploaded = null;
  try {
    const { jobId, platformId, filePath } = job.data;
    fileToBeUploaded = filePath;
    const newOrderFnTester = await orderProcessor(job);
  } catch (error) {
    console.error(`Worker execution failed for Job ${jobId}:`, error.message);
    throw error;
  } finally {
    await cleanUpFiles(fileToBeUploaded);
  }
};

const cleanUpFiles = async fileToBeUploaded => {
  try {
    if (fileToBeUploaded) {
      await fs.unlink(fileToBeUploaded);
      console.log('File deleted from the temp-orders folder');
    }
  } catch (error) {
    console.log('Error occurred during file deletion in the fileUploader fn.');
    throw error;
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
