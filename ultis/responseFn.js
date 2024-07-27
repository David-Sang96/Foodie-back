module.exports = (res, statusCode, status, message) => {
  res.status(statusCode).json({
    status,
    message,
  });
};
