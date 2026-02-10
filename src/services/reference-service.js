/* External modules  */
const fs = require('fs/promises');
const Papa = require('papaparse');
const prisma = require('../utils/prisma');
const { Prisma } = require('@prisma/client');

/* Internal modules */
const AppError = require('../utils/appError.js');

const orderFileReaderRefData = async req => {
  if (!req.file || !req.file.path) {
    throw new AppError('No file path found on request', 500);
  }
  /* Retrieve file, read it, parse with papa-parse --> store the parsed result */
  let fileToBeUploaded = req.file.path;
  let fileContentToBeUploaded;
  try {
    fileContentToBeUploaded = await fs.readFile(fileToBeUploaded, { encoding: 'utf-8' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new AppError(`File not found at the path ${fileToBeUploaded}`);
    }
    if (error.code === 'EISDIR') {
      throw new AppError(`Expected to read the file, but found directory only`);
    }
    if (error.code === 'EACCES') {
      throw new AppError(`In-sufficient credentials/access for the reading the file.`);
    }
    throw error;
  }
  return fileContentToBeUploaded;
};

const orderFileParserRefData = async fileContentToBeUploaded => {
  /* Parse the file with Papa-parse */
  try {
    const parsedResult = Papa.parse(fileContentToBeUploaded, { header: true, skipEmptyLines: true });

    if (parsedResult.errors.length > 0) {
      const fatalError = parsedResult.errors.find(err =>
        ['MissingQuotes', 'UndetectableDelimiter', 'TooFewFields', 'TooManyFields'].includes(err.code),
      );
      if (fatalError) {
        throw new AppError(`Error in parsing the csv-file ${fatalError}`);
      }

      if (!parsedResult.data || parsedResult.data.length === 0) {
        throw new AppError(`The uploaded csv is empty`);
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
      throw new AppError(`Missing data or incomplete product information received`);
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

    // console.log(parsedDataRow);
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
  console.log(transformedData);
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
    console.log('Database transaction successful.');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2000') {
        throw new AppError(`The provided value for the column is too long for the column type`);
      }
    }
    console.log('Error occured during database transaction', error);
    throw error;
  }
};

/* Create separate functions to process boxes and couriers data independently and later in the refDataProcessor function we can worry about how and which function will get called depending upon the label. Need to update the prisma schema*/

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
      throw new AppError(`Missing data or incomplete box information received`);
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
  console.log(transformedBoxData);
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
    console.log('Box data inserted in the database successfully.');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2000') {
        throw new AppError(`The provided value for the column is too long for the column type`);
      }
    }
    console.log('Error occured during database transaction while uploading box data to the db', error);
    throw error;
  }
};

/* Testing code ignore and delete before pushing to the repo */
/* const data = [
  {
    sku: 'ST1023',
    product: 'Coco brush',
    length_cm: '10.5',
    width_cm: '12.5',
    height_cm: '14.5',
    cost_price: '4.5',
    wholesale_price: '5.5',
    projected_price: '3.5',
    retail_price: '6.5',
    weight_kg: '1.5',
  },
];
const objectReadyForDBTransformation = productFileTransformerRefData(data);
productUploaderToDb(objectReadyForDBTransformation); */

/* const data = [
  {
    box_name: 'Amazon small',
    length_cm: '50',
    width_cm: '40',
    height_cm: '30',
    cost_price: '3',
  },
];
const result1 = boxFileTransformerRefData(data);
boxUploaderToDb(result1); */
/* Testing code ignore and delete before pushing to the repo */

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
      throw new AppError(`Missing data or incomplete courier information received`);
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
  console.log(transformedCourierData);
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
      console.log('Courier insertion in the database was successful');
    });
  } catch (error) {
    console.log('Error occured during database transaction while uploading courier data to the db', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2000') {
        throw new AppError(`The provided value for the column is too long for the column type`);
      }
      if (error.code === 'P2002') {
        throw new AppError(`Unique constraint i.e. composite key which is acting like unique identifier failed`);
      }
    }
    throw error;
  }
};

// Testing data
/* const data = [
  {
    courier_name: 'Evri',
    service_name: 'Standard',
    price_24: '2.99',
    price_48: '2.49',
    length_cm: '20',
    width_cm: '40',
    height_cm: '50',
    max_weight_kg: '2',
  },
];
const fileDataReadyForDbUpload = courierFileTransformerRefData(data);
courierUploaderToDb(fileDataReadyForDbUpload); */

const refDataProcessor = async req => {
  console.log('Testing the switchboard implementation');

  /* Call the file reading function */

  const fileContentToBeUploaded = await orderFileReaderRefData(req);
  const parsedData = await orderFileParserRefData(fileContentToBeUploaded);

  if (req.body.file_category === 'products') {
    const transformedData = productFileTransformerRefData(parsedData);
    await productUploaderToDb(transformedData);
    return { status: 'Products data uploaded to the database successfully' };
  }

  if (req.body.file_category === 'boxes') {
    const transformedBoxData = boxFileTransformerRefData(parsedData);
    await boxUploaderToDb(transformedBoxData);
    return { status: 'Boxes data uploaded to the database successfully' };
  }

  if (req.body.file_category === 'couriers') {
    const transformedCourierData = courierFileTransformerRefData(parsedData);
    await courierUploaderToDb(transformedCourierData);
    return { status: 'Couriers data uploaded to the database successfully' };
  }

  throw new AppError(`Unknown file category: ${req.body.file_category}`, 400);
};

module.exports = refDataProcessor;
