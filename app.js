const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const profileRoute = require('./routes/profile');
const favoriteRoute = require('./routes/favorite');
const responseFn = require('./ultis/responseFn');
const protect = require('./middlewares/protect');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(morgan('dev'));
// allow cookie to set and remove on localhost:2500
app.use(
  cors({ origin: 'https://foodie-back-66fa.onrender.com', credentials: true })
);
app.use(cookieParser());

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/recipes', protect, recipeRoutes);
app.use('/api/v1/profile', protect, profileRoute);
app.use('/api/v1/favorite', protect, favoriteRoute);

app.all('*', (req, res) => {
  responseFn(res, 404, 'fail', `Can't find ${req.originalUrl} on this server!`);
});

app.use(globalErrorHandler);

module.exports = app;
