const prisma = require('../utils/prisma');

// Create the first status in the db

async function createNewJob(data) {
  const newJob = await prisma.fileUpload.create({
    data: {
      platformId: data.platformId,
      filePath: data.filePath,
      status: 'pending',
    },
  });

  return newJob;
}

async function updateCurrentJob(jobId, status) {
  const updateJob = await prisma.fileUpload.update({
    where: { id: jobId },
    data: { status: status },
  });

  return updateJob;
}

async function markJobCompleted(jobId, resultMessage = 'File processed successfully') {
  const completeJob = await prisma.fileUpload.update({
    where: { id: jobId },
    data: {
      status: 'completed',
      result: resultMessage,
    },
  });
  return completeJob;
}

async function markJobError(jobId, error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  await prisma.fileUpload.update({
    where: { id: jobId },
    data: {
      status: 'failed',
      error: errorMessage,
    },
  });

  return errorMessage;
}

module.exports = {
  createNewJob,
  updateCurrentJob,
  markJobCompleted,
  markJobError,
};
