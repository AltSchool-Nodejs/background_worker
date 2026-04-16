const { queue } = require('./jobs/queue');
const processors = require('./jobs/processors');

const concurrency = Number(process.env.WORKER_CONCURRENCY) || 5;

queue.process(concurrency, async (job) => {
  const { name, data } = job.data;
  const run = processors[name];
  if (typeof run !== 'function') {
    throw new Error(`No processor for job "${name}"`);
  }
  return run(data);
});

queue.on('completed', (job) => {
  console.log(`[worker] done job ${job.id} (${job.data.name})`);
});

queue.on('failed', (job, err) => {
  console.error(`[worker] failed job ${job && job.id}: ${err.message}`);
});

async function shutdown(signal) {
  console.log(`[worker] ${signal} — closing queue…`);
  try {
    await queue.close();
  } catch (e) {
    console.error('[worker] queue.close error', e.message);
  }
  process.exit(0);
}

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});

queue.isReady().then(() => {
  console.log(`[worker] ready (concurrency=${concurrency})`);
});
