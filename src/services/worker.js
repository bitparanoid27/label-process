const { Worker } = require('bullmq');

// Need same redis connection as producer

const redisConnection = {
  host: 'localhost',
  port: 6379,
};

const processorFn = async job => {
  console.log('Worker received the work');
  console.log('Job name', job.name);
  console.log('Job id', job.id);
  console.log('Job data', job.data);

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Work processing finished');

  return { status: 'completed', timeStamp: new Date().toISOString() };
};

const worker = new Worker('log-q', processorFn, { connection: redisConnection });

// listen for success

worker.on('completed', (job, result) => {
  console.log(`Job completed: ${job.id} & result is ${result}`);
});

worker.on('failed', (job, error) => {
  console.log(`Job failed ${job.id} and the error is ${error}`);
});
