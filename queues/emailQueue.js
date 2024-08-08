const Queue = require('bull');
const sendEmail = require('../ultis/sendEmail');

const emailQueue = new Queue('emailQueue', {
  redis: { port: 6379, host: '127.0.0.1 ' },
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
