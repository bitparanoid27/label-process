/* External modules */

require('dotenv/config');
const express = require('express');
const router = require('./src/routes/csv-file-uploader-routes');
const router1 = require('./src/routes/test-job.js');

const app = express();
const PORT = process.env.PORT || 3650;

app.use('/api/v1', router);
app.use('/api/v1', router1);

app.listen(PORT, () => {
  console.log('Server listening on PORT', PORT);
});
