/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');

const signJWTToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN * 24 * 60 * 60,
  });
};

module.exports = signJWTToken;
