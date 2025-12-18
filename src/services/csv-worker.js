/* External modules */

const { Worker, Job, tryCatch } = require('bullmq');
const Papa = require('papaparse');
const fs = require('fs/promises');

/* Internal modules */
const { updateCurrentJob, markJobCompleted, markJobError } = require('../services/job-status-service.js');
const prisma = require('../utils/prisma');

/* redis connection */

console.log('Checkpoint 1: Starting csv-worker.js file...');

const redisConnection = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
};

const fileUploader = async job => {
  /*  Destructure the incoming jobTicket from bullmq */
  const { jobId, platformId, filePath } = job.data;

  console.log(`Worker started`);

  let fileToBeUploaded = null;

  try {
    let currentJobStatus = await updateCurrentJob(jobId, 'processing');
    console.log(`Job status changed to processing for the job-id ${jobId}`);

    /* Retrieve file, read it, parse with papa-parse --> store the parsed result */
    fileToBeUploaded = filePath;
    const fileContentToBeUploaded = await fs.readFile(fileToBeUploaded, { encoding: 'utf-8' });

    /* Parse the file with Papa-parse */
    const parsedResult = Papa.parse(fileContentToBeUploaded, { header: true, skipEmptyLines: true });
    const parsedData = parsedResult.data;

    /* Prisma transaction */
    const dbJobStatus = await prisma.$transaction(async tx => {
      for (const row of parsedData) {
        let customer = await tx.customer.findUnique({ where: { buyerEmail: row['buyer-email'] } });
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              buyerEmail: row['buyer-email'] || null,
              buyerName: row['buyer-name'] || null,
              buyerPhoneNumber: row['buyer-phone-number'] || null,
            },
          });
        }

        let product = await tx.product.findUnique({ where: { sku: row['sku'] } });
        if (!product) {
          product = await tx.product.create({
            data: {
              sku: row['sku'] || null,
              productName: row['product-name'] || null,
              priceDesignation: row['price-designation'] || null,
            },
          });
        }

        const order = await tx.order.upsert({
          where: {
            channel_channelOrderId: {
              channel: platformId,
              channelOrderId: row['order-id'],
            },
          },
          update: {
            purchaseDate: new Date(row['purchase-date']) || null,
            currencyCode: row['currency'] || null,
            salesChannel: row['sales-channel'] || null,
            isBusinessOrder: row['is-business-order'] === 'TRUE',
            isPrime: row['is-prime'] === 'TRUE',
            isTransparency: row['is-transparency'] === 'TRUE',
            isIba: row['is_iba'] === 'TRUE',
            customerId: customer.id,
          },
          create: {
            channel: platformId,
            channelOrderId: row['order-id'] || null,
            purchaseDate: new Date(row['purchase-date']) || null,
            currencyCode: row['currency'] || null,
            salesChannel: row['sales-channel'] || null,
            orderChannel: row['order-channel'] || null,
            orderChannelInstance: row['order-channel-instance'] || null,
            // Corrected: Boolean conversion must be a direct string comparison.
            isBusinessOrder: row['is-business-order'] === 'TRUE',
            isPrime: row['is-prime'] === 'TRUE',
            isTransparency: row['is-transparency'] === 'TRUE',
            isIba: row['is_iba'] === 'TRUE',
            // This is the relation to the customer record.
            customerId: customer.id,
          },
        });

        const shipment = await tx.shipment.create({
          data: {
            recipientName: row['recipient-name'] || null,
            shipAddress1: row['ship-address-1'] || null,
            shipAddress2: row['ship-address-2'] || null,
            shipAddress3: row['ship-address-3'] || null,
            shipCity: row['ship-city'] || null,
            shipState: row['ship-state'] || null,
            shipPostalCode: row['ship-postal-code'] || null,
            shipCountry: row['ship-country'] || null,
            shipPhoneNumber: row['ship-phone-number'] || null,
            shipServiceLevel: row['ship-service-level'] || null,
            shippingPrice: parseFloat(row['shipping-price']) || null,
            shippingTax: parseFloat(row['shipping-tax']) || null,
            promotionDiscount: row['item-promotion-discount'] ? parseFloat(row['item-promotion-discount']) : null,
            promotionId: row['promotion-id'],
            deliveryStartDate: row['delivery_start-date'] ? new Date(row['delivery-start-date']) : null,
            deliveryEndDate: row['delivert-end-date'] ? new Date(row['delivery-end-date']) : null,
            deliveryTimeZone: row['delivery-time-zone'] || null,
            deliveryInstructions: row['delivery-instructions'] ? row['delivery-instructions'] : null,

            /* relations */
            orderId: order.id,
          },
        });

        const orderItems = await tx.orderItem.create({
          data: {
            channelOrderItemId: row['order-item-id'],
            quantityPurchased: parseInt(row['quantity-purchased']) || null,
            itemPrice: parseFloat(row['item-price']) || null,
            itemTax: row['item-tax'] ? parseFloat(row['item-tax']) : null,
            promotionDiscount: row['promotion-discount'] ? parseFloat(row['promotion-discount']) : null,
            promotionId: row['promotion-id'] || null,

            /* Relations */
            orderId: order.id,
            productSku: row['sku'],
          },
        });
      }
    });

    /* Post completion of db work update the fileUpload status */
    currentJobStatus = await markJobCompleted(jobId, (resultMessage = 'File processed successfully'));
    console.log('File processed successfully', currentJobStatus);
    console.log(`Job status changed to processing for the job-id ${jobId}`);

    return { status: 'completed', timeStamp: new Date().toISOString() };

    /*  */
  } catch (error) {
    /*  */
    let errorData = await markJobError(jobId, error);
    console.log(errorData);
    throw error;

    /*  */
  } finally {
    /* Delete the temp file */

    try {
      if (fileToBeUploaded) {
        await fs.unlink(fileToBeUploaded);
        console.log('File deleted from the Uploads folder');
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
