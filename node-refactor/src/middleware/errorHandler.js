/**
 * Central error-handling middleware.
 * Must be registered last (after all routes) in app.js.
 * Catches any error passed via next(err) and returns a clean JSON response.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  // Avoid leaking internal details to callers in production
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message;

  res.status(err.status || 500).json({ error: message });
}

module.exports = errorHandler;
