const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
