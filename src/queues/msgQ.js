const { Queue } = require('bullmq');

const redisConnection = {
  host: 'localhost',
  port: 6379,
};

// const myQueue = new Queue('log-q', redisConnection);
const csvQueue = new Queue('process-csv', redisConnection);

// module.exports = myQueue;
module.exports = csvQueue;
