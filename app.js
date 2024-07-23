/* eslint-disable no-undef */
const express = require('express');
const morgan = require('morgan');

const recipeRoutes = require('./routes/recipes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./ultis/appError');

const app = express();

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
// app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/recipes', recipeRoutes);

app.use('*', (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
