// Enables global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// No route error handler
const noRouteHandler = (req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }
  // Handles the SequelizeValidationError or SequelizeUniqueConstraintError errors if either are thrown
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    const errors = err.errors.map((err) => err.message);
    res
    .status(400)
    .json({ errors });
  } else {
    res
    .status(err.status || 500)
    .json({
      message: err.message,
      error: {},
    });
  }
};

module.exports = { noRouteHandler, globalErrorHandler }