const { validationResult } = require('express-validator');
const AppError = require('../ultis/appError');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMsg = errors
      .array()
      .map((vl) => vl.msg)
      .join(', ');
    return next(new AppError(errMsg, 400));
  }
  next();
};
