require('dotenv').config();

const express = require('express');
const path = require('path');
const { requestLogger, responseTimeTracker } = require('./middleware/logger');
const { cacheMiddleware } = require('./middleware/cache');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { enqueueJob } = require('./queue/queue');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Standard middleware: body parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Custom logging middleware ---
app.use(responseTimeTracker);
app.use(requestLogger);

// --- View engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Task 8 — Advanced Server-Side Functionality',
    port: PORT,
  });
});

/**
 * Heavy data route — cached in Redis for subsequent requests.
 */
app.get('/api/stats', cacheMiddleware(60), async (req, res, next) => {
  try {
    await simulateHeavyQuery();
    res.json({
      success: true,
      data: {
        users: 12847,
        orders: 9321,
        revenue: 458920.55,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Enqueue background jobs — email, report, or file generation.
 */
app.post('/api/jobs', async (req, res, next) => {
  try {
    const { type, ...data } = req.body;

    if (!['email', 'report', 'file'].includes(type)) {
      const err = new Error('Invalid job type. Use: email, report, or file');
      err.statusCode = 400;
      throw err;
    }

    const result = await enqueueJob(type, data);
    res.status(202).json({ success: true, message: 'Job queued for background processing', ...result });
  } catch (err) {
    next(err);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

function simulateHeavyQuery() {
  return new Promise((resolve) => setTimeout(resolve, 800));
}

// --- Global error handling (must be last) ---
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
