const prisma = require('../utils/prisma');

// Create the first status in the db

async function createNewJob(data) {
  try {
    const newJob = await prisma.fileUpload.create({
      data: {
        platformId: data.platformId,
        filePath: data.filePath,
        status: 'pending',
      },
    });

    return newJob;
  } catch (error) {
    throw error;
  }
}

async function updateCurrentJob(jobId, status) {
  try {
    const updateJob = await prisma.fileUpload.update({
      where: { id: jobId },
      data: { status: status },
    });

    return updateJob;
  } catch (error) {
    throw error;
  }
}

async function markJobCompleted(jobId, resultMessage = 'File processed successfully') {
  try {
    const completeJob = await prisma.fileUpload.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        result: resultMessage,
      },
    });

    return completeJob;
  } catch (error) {
    throw error;
  }
}

async function markJobError(jobId, error) {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await prisma.fileUpload.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: errorMessage,
      },
    });

    return errorMessage;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createNewJob,
  updateCurrentJob,
  markJobCompleted,
  markJobError,
};
