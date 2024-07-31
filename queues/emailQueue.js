/* eslint-disable no-undef */
const Queue = require('bull');
const sendEmail = require('../ultis/sendEmail');

const emailQueue = new Queue('emailQueue', {
  redis: { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST },
});

emailQueue.process(async (job) => {
  try {
    await sendEmail(job.data);
  } catch (error) {
    console.error('Error processing job:', error);
    throw error;
  }
});

module.exports = emailQueue;
