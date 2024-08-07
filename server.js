/* eslint-disable no-undef */
const mongoose = require('mongoose');
require('dotenv').config();
const cron = require('node-cron');

const app = require('./app');
const port = process.env.PORT || 8100;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('Connected to database');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is listening on port ${port}...`);
      cron.schedule('*/4 * * * * *', () => {
        // to programmatically run task on every given specific time
        // console.log('running a task every 4 seconds');
      });
    });
  })
  .catch((err) => console.log(err));
