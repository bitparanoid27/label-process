/* External modules  */
const fs = require('fs/promises');
const Papa = require('papaparse');
const prisma = require('../utils/prisma');
const { Prisma } = require('@prisma/client');
const PATHS = require('../configs/paths');

/* Internal modules */
const AppError2 = require('../utils/appError2');

const orderFileReaderRefData = async receivedFilePath => {
  /* Retrieve file, read it, parse with papa-parse --> store the parsed result */
  let fileToBeUploaded = receivedFilePath;
  let fileContentToBeUploaded = null;

  try {
    fileContentToBeUploaded = await fs.readFile(fileToBeUploaded, { encoding: 'utf-8' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new AppError2(`File not found at the path ${fileToBeUploaded}`, 400);
    }
    if (error.code === 'EISDIR') {
      throw new AppError2(`Expected to read the file, but found directory only`, 400);
    }
    if (error.code === 'EACCES') {
      throw new AppError2(`In-sufficient credentials/access for the reading the file.`, 500);
    }
    throw error;
  }

  return fileContentToBeUploaded;
};

const orderFileParserRefData = async fileContentToBeUploaded => {
  /* Parse the file with Papa-parse */
  try {
    // If empty file recieved for parsing,exit early.
    if (!fileContentToBeUploaded) {
      throw new AppError2("Empty file read, can't parse it. Exiting early.", 400);
    }

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

const productFileTransformerRefData = parsedData => {
  const transformedData = parsedData.map(parsedDataRow => {
    /* Adding the guard clause */
    if (
      !parsedDataRow['length_cm'] ||
      !parsedDataRow['width_cm'] ||
      !parsedDataRow['height_cm'] ||
      !parsedDataRow['weight_kg'] ||
      !parsedDataRow['sku'] ||
      !parsedDataRow['product'] ||
      !parsedDataRow['cost_price'] ||
      !parsedDataRow['wholesale_price'] ||
      !parsedDataRow['retail_price'] ||
      !parsedDataRow['projected_price']
    ) {
      throw new AppError2(`Missing data or incomplete product information received`, 400);
    }

    /* converting L, W, H into mm */

    const parsedLengthMM = parseFloat(parsedDataRow['length_cm']) * 10;
    const parsedWidthMM = parseFloat(parsedDataRow['width_cm']) * 10;
    const parsedHeightMM = parseFloat(parsedDataRow['height_cm']) * 10;

    parsedDataRow['length_mm'] = parsedLengthMM;
    parsedDataRow['width_mm'] = parsedWidthMM;
    parsedDataRow['height_mm'] = parsedHeightMM;

    /* converting weight from kg to gms */

    const parsedWeightGM = parseFloat(parsedDataRow['weight_kg']) * 1000;
    parsedDataRow['weight_gm'] = parsedWeightGM;

    parsedDataRow['volume_cm3'] =
      parseFloat(parsedDataRow['length_cm']) * parseFloat(parsedDataRow['width_cm']) * parseFloat(parsedDataRow['height_cm']);

    return {
      sku: String(parsedDataRow['sku'].trim()),
      product_name: String(parsedDataRow['product'].trim()),

      /* Removing special characters such as $ or £ or € before prices */
      cost_price: parseFloat(String(parsedDataRow['cost_price']).replace(/[^0-9.]/g, '')),
      wholesale_price: parseFloat(String(parsedDataRow['wholesale_price']).replace(/[^0-9.]/g, '')),
      projected_price: parseFloat(String(parsedDataRow['projected_price']).replace(/[^0-9.]/g, '')),
      retail_price: parseFloat(String(parsedDataRow['retail_price']).replace(/[^0-9.]/g, '')),

      length_cm: parseFloat(parsedDataRow['length_cm']),
      width_cm: parseFloat(parsedDataRow['width_cm']),
      height_cm: parseFloat(parsedDataRow['height_cm']),

      length_mm: parsedLengthMM,
      width_mm: parsedWidthMM,
      height_mm: parsedHeightMM,

      weight_kg: parseFloat(parsedDataRow['weight_kg']),
      weight_gm: parsedWeightGM,

      volume_cm3: parsedDataRow['volume_cm3'],

      packaging_strategy: 'Standard',
    };
  });

  return transformedData;
};

const productUploaderToDb = async transformedData => {
  try {
    const prismaProductRecordStatus = await prisma.$transaction(async prodTxn => {
      for (const row of transformedData) {
        await prodTxn.products.upsert({
          where: { sku: row.sku },
          create: { ...row },
          update: { ...row },
        });
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2000') {
        throw new AppError2(`The provided value for the column is too long for the column type`, 400);
      }
    }
    throw error;
  }
};

const boxFileTransformerRefData = parsedData => {
  const transformedBoxData = parsedData.map(parsedDataBoxRow => {
    /* Adding the guard clause */
    if (
      !parsedDataBoxRow['length_cm'] ||
      !parsedDataBoxRow['width_cm'] ||
      !parsedDataBoxRow['height_cm'] ||
      !parsedDataBoxRow['box_name'] ||
      !parsedDataBoxRow['cost_price']
    ) {
      throw new AppError2(`Missing data or incomplete box information received`, 400);
    }

    const lengthMM = parseFloat(parsedDataBoxRow['length_cm']) * 10;
    const widthMM = parseFloat(parsedDataBoxRow['width_cm']) * 10;
    const heightMM = parseFloat(parsedDataBoxRow['height_cm']) * 10;

    const lengthCM = parseFloat(parsedDataBoxRow['length_cm']);
    const widthCM = parseFloat(parsedDataBoxRow['width_cm']);
    const heightCM = parseFloat(parsedDataBoxRow['height_cm']);

    parsedDataBoxRow['length_mm'] = lengthMM;
    parsedDataBoxRow['width_mm'] = widthMM;
    parsedDataBoxRow['height_mm'] = heightMM;

    const volume_cm =
      parseFloat(parsedDataBoxRow['length_cm']) * parseFloat(parsedDataBoxRow['width_cm']) * parseFloat(parsedDataBoxRow['height_cm']);

    parsedDataBoxRow['box_volume_cm3'] = volume_cm;

    const box_girth = (heightCM + widthCM) * 2 + lengthCM;
    parsedDataBoxRow['box_girth'] = box_girth;

    return {
      box_name: String(parsedDataBoxRow['box_name'].trim()),
      length_cm: parseFloat(parsedDataBoxRow['length_cm']),
      width_cm: parseFloat(parsedDataBoxRow['width_cm']),
      height_cm: parseFloat(parsedDataBoxRow['height_cm']),

      length_mm: lengthMM,
      width_mm: widthMM,
      height_mm: heightMM,

      box_volume_cm3: volume_cm,
      box_girth: box_girth,

      cost_price: parseFloat(String(parsedDataBoxRow['cost_price']).replace(/[^0-9.]/g, '')),
    };
  });

  return transformedBoxData;
};

const boxUploaderToDb = async transformedBoxData => {
  try {
    const prismaBoxRecordStatus = await prisma.$transaction(async boxTxn => {
      for (const boxDataRow of transformedBoxData) {
        await boxTxn.boxes.upsert({
          where: { box_name: boxDataRow.box_name },
          create: { ...boxDataRow },
          update: { ...boxDataRow },
        });
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2000') {
        throw new AppError2(`The provided value for the column is too long for the column type`);
      }
    }

    throw error;
  }
};

const courierFileTransformerRefData = parsedData => {
  const transformedCourierData = parsedData.map(parsedDataCourierRow => {
    /* Adding the guard clause */
    if (
      !parsedDataCourierRow['courier_name'] ||
      !parsedDataCourierRow['service_name'] ||
      !parsedDataCourierRow['price_24'] ||
      !parsedDataCourierRow['price_48'] ||
      !parsedDataCourierRow['length_cm'] ||
      !parsedDataCourierRow['width_cm'] ||
      !parsedDataCourierRow['height_cm'] ||
      !parsedDataCourierRow['max_weight_kg']
    ) {
      throw new AppError2(`Missing data or incomplete courier information received`, 400);
    }

    const lengthMM = parseFloat(parsedDataCourierRow['length_cm']) * 10;
    const widthMM = parseFloat(parsedDataCourierRow['width_cm']) * 10;
    const heightMM = parseFloat(parsedDataCourierRow['height_cm']) * 10;

    parsedDataCourierRow['length_mm'] = lengthMM;
    parsedDataCourierRow['width_mm'] = widthMM;
    parsedDataCourierRow['height_mm'] = heightMM;

    const lengthCM = parseFloat(parsedDataCourierRow['length_cm']);
    const widthCM = parseFloat(parsedDataCourierRow['width_cm']);
    const heightCM = parseFloat(parsedDataCourierRow['height_cm']);

    const box_girth = (heightCM + widthCM) * 2 + lengthCM;
    parsedDataCourierRow['box_girth'] = box_girth;

    const volume_cm =
      parseFloat(parsedDataCourierRow['length_cm']) * parseFloat(parsedDataCourierRow['width_cm']) * parseFloat(parsedDataCourierRow['height_cm']);
    parsedDataCourierRow['box_volume_cm3'] = volume_cm;

    const weight_gm = parseFloat(parsedDataCourierRow['max_weight_kg']) * 1000;
    parsedDataCourierRow['max_weight_gm'] = weight_gm;

    return {
      courier_name: String(parsedDataCourierRow['courier_name'].trim()),
      service_name: String(parsedDataCourierRow['service_name'].trim()),

      price_24: parseFloat(String(parsedDataCourierRow['price_24']).replace(/[^0-9.]/g, '')),
      price_48: parseFloat(String(parsedDataCourierRow['price_48']).replace(/[^0-9.]/g, '')),

      length_cm: parseFloat(parsedDataCourierRow['length_cm']),
      width_cm: parseFloat(parsedDataCourierRow['width_cm']),
      height_cm: parseFloat(parsedDataCourierRow['height_cm']),

      length_mm: lengthMM,
      width_mm: widthMM,
      height_mm: heightMM,

      max_girth_cm: box_girth,
      max_volume_cm3: volume_cm,

      max_weight_kg: parseFloat(parsedDataCourierRow['max_weight_kg']),
      max_weight_gm: weight_gm,

      is_active: true,
    };
  });

  return transformedCourierData;
};

const courierUploaderToDb = async transformedCourierData => {
  try {
    const prismaCourierRecordStatus = await prisma.$transaction(async courierTxn => {
      for (const courierDataRow of transformedCourierData) {
        await courierTxn.couriers.upsert({
          where: {
            courier_name_service_name: { courier_name: courierDataRow.courier_name, service_name: courierDataRow.service_name },
          },
          create: { ...courierDataRow },
          update: { ...courierDataRow },
        });
      }
    });
  } catch (error) {
    console.log('Error occured during database transaction while uploading courier data to the db', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2000') {
        throw new AppError2(`The provided value for the column is too long for the column type`, 400);
      }
      if (error.code === 'P2002') {
        throw new AppError2(`Unique constraint i.e. composite key which is acting like unique identifier failed`, 500);
      }
    }
    throw error;
  }
};

const refDataProcessor = async (receivedFilePath, receivedFileCategory) => {
  try {
    console.log(`Reference data i.e. ${receivedFileCategory} upload started`);

    /* Call the file reading function */

    const fileContentToBeUploaded = await orderFileReaderRefData(receivedFilePath);
    const parsedData = await orderFileParserRefData(fileContentToBeUploaded);

    if (receivedFileCategory === 'products') {
      const transformedData = productFileTransformerRefData(parsedData);
      await productUploaderToDb(transformedData);
      return { status: 'Products data uploaded to the database successfully' };
    }

    if (receivedFileCategory === 'boxes') {
      const transformedBoxData = boxFileTransformerRefData(parsedData);
      await boxUploaderToDb(transformedBoxData);
      return { status: 'Boxes data uploaded to the database successfully' };
    }

    if (receivedFileCategory === 'couriers') {
      const transformedCourierData = courierFileTransformerRefData(parsedData);
      await courierUploaderToDb(transformedCourierData);
      return { status: 'Couriers data uploaded to the database successfully' };
    }
  } catch (error) {
    throw error;
  }
};

module.exports = refDataProcessor;
