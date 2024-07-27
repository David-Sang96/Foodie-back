const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: { msg: result.array()[0].msg, path: result.array()[0].path },
    });
  }
  next();
};
