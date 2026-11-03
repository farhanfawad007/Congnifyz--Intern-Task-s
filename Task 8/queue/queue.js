const Queue = require('bull');
const { redisOptions } = require('../config/redis');

const JOB_QUEUE_NAME = 'background-jobs';

let jobQueue = null;

function getJobQueue() {
  if (!jobQueue) {
    jobQueue = new Queue(JOB_QUEUE_NAME, { redis: redisOptions });
  }
  return jobQueue;
}

/**
 * Enqueue a background job by type.
 */
async function enqueueJob(type, data = {}, options = {}) {
  const queue = getJobQueue();
  const job = await queue.add(
    { type, ...data },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
      ...options,
    }
  );
  return { jobId: job.id, type, status: 'queued' };
}

module.exports = { getJobQueue, enqueueJob, JOB_QUEUE_NAME, redisOptions };
