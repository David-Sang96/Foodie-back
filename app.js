const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const recipeRoutes = require('./routes/recipes');

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: '*' }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/v1/recipes', recipeRoutes);

module.exports = app;
