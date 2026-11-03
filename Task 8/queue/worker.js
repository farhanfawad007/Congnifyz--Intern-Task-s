require('dotenv').config();

const Queue = require('bull');
const fs = require('fs/promises');
const path = require('path');
const { JOB_QUEUE_NAME, redisOptions } = require('./queue');

const REPORTS_DIR = path.join(__dirname, '..', 'generated', 'reports');

async function processEmailJob(data) {
  const { to, subject, body } = data;
  await simulateDelay(1500);
  console.log(`[Worker] Email sent to ${to} | Subject: ${subject}`);
  return { sent: true, to, subject, preview: body?.slice(0, 80) };
}

async function processReportJob(data) {
  const { reportName = 'sales-report', rows = 100 } = data;
  await simulateDelay(2000);

  await fs.mkdir(REPORTS_DIR, { recursive: true });

  const lines = [`Report: ${reportName}`, `Generated: ${new Date().toISOString()}`, ''];
  for (let i = 1; i <= rows; i++) {
    lines.push(`Row ${i}, Value ${Math.floor(Math.random() * 1000)}`);
  }

  const filename = `${reportName}-${Date.now()}.txt`;
  const filePath = path.join(REPORTS_DIR, filename);
  await fs.writeFile(filePath, lines.join('\n'), 'utf8');

  console.log(`[Worker] Report generated: ${filename}`);
  return { reportName, filename, path: filePath, rowCount: rows };
}

async function processFileJob(data) {
  const { fileName = 'export.json', content } = data;
  await simulateDelay(1200);

  const exportsDir = path.join(__dirname, '..', 'generated', 'exports');
  await fs.mkdir(exportsDir, { recursive: true });

  const filePath = path.join(exportsDir, fileName);
  const payload =
    content ?? JSON.stringify({ exportedAt: new Date().toISOString(), items: [] }, null, 2);
  await fs.writeFile(filePath, payload, 'utf8');

  console.log(`[Worker] File generated: ${fileName}`);
  return { fileName, path: filePath };
}

function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processJob(job) {
  const { type } = job.data;

  switch (type) {
    case 'email':
      return processEmailJob(job.data);
    case 'report':
      return processReportJob(job.data);
    case 'file':
      return processFileJob(job.data);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

const queue = new Queue(JOB_QUEUE_NAME, { redis: redisOptions });

queue.process(3, processJob);

queue.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} (${job.data.type}) completed`);
});

queue.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

queue.on('error', (err) => {
  console.error('[Worker] Queue error:', err.message);
});

console.log('[Worker] Background job processor started. Waiting for jobs...');

async function shutdown() {
  await queue.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
