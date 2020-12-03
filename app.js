'use strict';

// Load modules
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const { sequelize } = require('./models');
const { noRouteHandler, globalErrorHandler } = require('./middleware/errorHandlers');

// Create the Express app
const app = express();

// JSON parsing setup for req.body usage
app.use(express.json());

// morgan setup for http request logging
app.use(morgan('dev'));

// Checks for database connection and follows up with synchronizing models with database
(async () => {
  try {
    // database connection tester
    await sequelize.authenticate();
    console.log("Database connection established");
    // model syncing
    await sequelize.sync();
    console.log("Synchronizing models with database");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// Friendly greeting for root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Routes
app.use('/api', routes);

// 404 error handler
app.use(noRouteHandler);

// Global error handler
app.use(globalErrorHandler);

// Port
app.set('port', process.env.PORT || 5000);

// Listens to the port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
