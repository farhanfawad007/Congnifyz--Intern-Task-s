const morgan = require('morgan');

/**
 * Custom token: response time in milliseconds with 2 decimal places.
 */
morgan.token('response-time-ms', (req, res) => {
  const time = res._responseTime;
  return time != null ? `${time.toFixed(2)}ms` : '-';
});

/**
 * Custom format: timestamp, method, url, status, response time.
 */
const customFormat =
  ':date[iso] :method :url :status :res[content-length] - :response-time-ms';

/**
 * Morgan middleware with timestamps and response times.
 */
const requestLogger = morgan(customFormat);

/**
 * Tracks response time for the custom morgan token.
 */
function responseTimeTracker(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    res._responseTime = Number(end - start) / 1e6;
  });
  next();
}

module.exports = { requestLogger, responseTimeTracker };
