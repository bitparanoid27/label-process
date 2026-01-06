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
  .catch(err => console.log('Error occured', err));
