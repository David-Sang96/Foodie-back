/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');

const signJWTToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN * 24 * 60 * 60,
  });
};

const createSendToken = (res, user, statusCode) => {
  const token = signJWTToken(user._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000,
    secure: true,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

module.exports = createSendToken;
