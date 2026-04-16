const Bull = require('bull');
const { getRedisConnection } = require('../config/redis');

const QUEUE_NAME = process.env.BULL_QUEUE_NAME || 'app_background_jobs';

const defaultJobOptions = {
  attempts: Number(process.env.JOB_ATTEMPTS) || 3,
  backoff: { type: 'exponential', delay: 5000 },
  timeout: Number(process.env.JOB_TIMEOUT_MS) || 30_000,
  removeOnComplete: 100,
  removeOnFail: 200,
};

const redisOpts = getRedisConnection();
const queue =
  typeof redisOpts === 'string'
    ? new Bull(QUEUE_NAME, redisOpts)
    : new Bull(QUEUE_NAME, redisOpts);

queue.on('error', (err) => {
  console.error('[queue]', err.message);
});

/**
 * Enqueue work. Safe to call from the API process — it does not register a processor.
 * @param {string} name - value from ./names
 * @param {object} data - payload for the processor
 */
function enqueue(name, data, options = {}) {
  return queue.add({ name, data }, { ...defaultJobOptions, ...options });
}

function getCounts() {
  return queue.getJobCounts();
}

module.exports = {
  queue,
  enqueue,
  getCounts,
};
