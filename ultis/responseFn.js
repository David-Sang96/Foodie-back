module.exports = (res, statusCode, status, message, data = null) => {
  res.status(statusCode).json({
    status,
    message,
    data,
  });
};
