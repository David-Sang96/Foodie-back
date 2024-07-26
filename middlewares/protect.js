/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../model/user');

module.exports = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      throw new Error('Please login to get access');
    }

    const isMatchToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    if (!isMatchToken) {
      throw new Error('Invalid token.Please log in again!');
    }

    // check if user still exist
    const currentUser = await User.findById(isMatchToken.id);
    if (!currentUser) {
      throw new Error('The user belonging to this token does no longer exist.');
    }

    // check if user changed password after the token was created
    if (currentUser.changedPasswordAfter(isMatchToken.iat)) {
      throw new Error('User recently changed the password.Login again!');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    error.statusCode = 401;
    error.status = 'fail';
    next(error);
  }
};
