/* External modules */

require('dotenv/config');
const express = require('express');
const fileUploadRouter = require('./src/routes/csv-file-uploader-routes');

const app = express();
const PORT = process.env.PORT || 3650;

app.use('/api/v1', fileUploadRouter);

// Application error handler that sends custom msg to the client. Instead of stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal error something went, wrong.',
  });
});

app.listen(PORT, () => {
  console.log('Server listening on PORT', PORT);
});
