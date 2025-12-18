const express = require('express');
const router = express.Router();

const myQueue = require('../queues/msgQ.js');

// Create a POST route to act as our producer.
router.post('/test-job', async (req, res) => {
  try {
    const job = await myQueue.add('log-msg', {
      message: 'Hello from the API',
      timeStamp: new Date().toISOString(),
    });

    console.log(job);

    res.status(200).json({
      message: 'Job created successfully',
      jobId: job.id,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job.' });
  }
});

module.exports = router;
