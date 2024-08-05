/* eslint-disable no-unused-vars */
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    // error: err,
    message: err.message,
    // stack: err.stack,
  });
};
