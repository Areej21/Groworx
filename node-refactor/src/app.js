/**
 * Express application setup.
 * Separated from server.js so the app can be imported by tests
 * without binding to a port.
 */
const express = require("express");
const orderRoutes = require("./routes/orders");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Parse JSON bodies; reject requests with wrong Content-Type gracefully
app.use(express.json());

// Mount routes
app.use("/", orderRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Centralised error handler must be last
app.use(errorHandler);

module.exports = app;
