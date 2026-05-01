const { Worker, Job, tryCatch } = require('bullmq');
const Papa = require('papaparse');
const fs = require('fs/promises');
const prisma = require('../utils/prisma');

/* Internal modules */
const AppError2 = require('../utils/appError2');
const { updateCurrentJob, markJobCompleted, markJobError } = require('../services/job-status-service.js');
const dbCsvColumnMapper = require('../utils/csvMapper.js');

const amznLavvMapperConfigFile = require('../configs/amzn-lavv.js');
const amznSterlingMapperConfigFile = require('../configs/amzn-sterling.js');
const ebayLavvMapperConfigFile = require('../configs/ebay-lavv.js');
const ebaySterlingMapperConfigFile = require('../configs/ebay-sterling.js');

/* Transformer to transform flat object to db insertion ready object  */
const dbOrderTransformer = require('../utils/dataTransformer.js');
const { error } = require('console');
const { Prisma } = require('@prisma/client');

/* Schema config files to map incoming data with db required format. */
const platformRegistry = {
  amzn_lavv: amznLavvMapperConfigFile,
  amzn_sterling: amznSterlingMapperConfigFile,
  ebay_lavv: ebayLavvMapperConfigFile,
  ebay_sterling: ebaySterlingMapperConfigFile,
};

const orderFileReader = async job => {
  if (!job) throw new AppError2('Job id missing', 500);

  /* Destructure incoming job object */
  const { jobId, platformId, filePath } = job.data;
  console.log(`New worker has started`);

  /* Retrieve file, read it, parse with papa-parse --> store the parsed result */

  let fileToBeUploaded = filePath;
  let fileContentToBeUploaded;

  try {
    fileContentToBeUploaded = await fs.readFile(fileToBeUploaded, { encoding: 'utf-8' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new AppError2(`File not found at the path ${filePath}`);
    }
    if (error.code === 'EISDIR') {
      throw new AppError2(`Expected to read the file, but found directory only`);
    }
    if (error.code === 'EACCES') {
      throw new AppError2(`In-sufficient credentials/access for the reading the file.`);
    }
    throw error;
  }

  return fileContentToBeUploaded;
};

const orderFileParser = async fileContentToBeUploaded => {
  /* Parse the file with Papa-parse */
  try {
    const parsedResult = Papa.parse(fileContentToBeUploaded, { header: true, skipEmptyLines: true });

    if (parsedResult.errors.length > 0) {
      const fatalError = parsedResult.errors.find(err =>
        ['MissingQuotes', 'UndetectableDelimiter', 'TooFewFields', 'TooManyFields'].includes(err.code),
      );
      if (fatalError) {
        throw new AppError2(`Error in parsing the csv-file ${fatalError}`);
      }

      if (!parsedResult.data || parsedResult.data.length === 0) {
        throw new AppError2(`The uploaded csv is empty`);
      }
    }

    const parsedData = parsedResult.data;
    return parsedData;
  } catch (error) {
    throw error;
  }
};

const orderFileUploaderToDb = async (dbReadyObject, platformId) => {
  try {
    const userProvidedPlatformId = await prisma.platforms.findFirst({
      where: {
        platform_name: platformId,
      },
    });

    if (!userProvidedPlatformId) {
      /* If the DB returns null, stop immediately. */
      throw new AppError2(`Platform '${platformId}' does not exist in the 'Platforms' database table.`);
    }

    const prismaRecordStatus = await prisma.$transaction(async tx => {
      for (const orderData of dbReadyObject) {
        /* Destructure the incoming object */
        const { order_items, data_dump, ...headerDetails } = orderData;

        await tx.masterOrders.upsert({
          where: {
            platform_order_id: headerDetails.platform_order_id,
          },

          create: {
            ...headerDetails,
            platform_id: parseInt(userProvidedPlatformId.id),
            order_items: {
              create: order_items,
            },
            data_dump: {
              create: data_dump,
            },
          },

          update: {
            order_items: {
              create: order_items,
            },
            data_dump: {
              create: data_dump,
            },
          },
        });
      }
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        const field = error.meta?.field_name || 'Database relation';
        throw new AppError2(`Data integrity error. Value for ${field} does not exist`);
      }
      if (error.code === 'P2002') {
        const field = error.meta?.target || 'Field';
        throw new AppError2(`Duplicate data. The value for the ${field} already exists`);
      }
      if (error.code === 'P2000') {
        throw new AppError2(`Data too long for database column.`, 400);
      }
    }
    throw error;
  }
};

const orderProcessor = async job => {
  try {
    /* Destructure the incoming job data into various variables */
    if (!job) {
      throw new AppError2('Job id missing', 500);
    }
    const { jobId, platformId, filePath } = job.data;

    const selectedConfig = platformRegistry[platformId];
    if (!selectedConfig) {
      console.error("Selected platform config doesn't exist for the", platformId);
      throw new AppError2(`Configuration missing for ${platformId}`);
    }

    if (platformId !== selectedConfig.platformName) {
      console.log('Platform name mis-matched, insertion aborted');
      throw new AppError2('Platform ID mismatch');
    }

    /* Read the file from the uploads folder */
    const fileContentToBeUploaded = await orderFileReader(job);

    /* Retrieve file, and parse with papa-parse --> store the parsed result */
    const parsedData = await orderFileParser(fileContentToBeUploaded);

    const mappedObjForDb = await dbCsvColumnMapper(selectedConfig, parsedData);
    const dbReadyObject = dbOrderTransformer(mappedObjForDb);

    /* Database transaction call */
    const dbTransactionStatus = await orderFileUploaderToDb(dbReadyObject, platformId);

    if (dbTransactionStatus) {
      console.log('Orders added to database successfully.');

      const currentJobStatus = await markJobCompleted(jobId, (resultMessage = 'File processed successfully'));
      console.log('File processed successfully', currentJobStatus);

      updateCurrentJob(jobId, 'completed');
      console.log(`Job status changed to completed for the job-id ${jobId}`);

      return { status: 'completed', timeStamp: new Date().toISOString() };
    }
  } catch (error) {
    console.log('Error occurred during orders upload process');
    throw error;
  }
};

module.exports = orderProcessor;
