/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../model/user');
const responseFn = require('../ultis/responseFn');

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

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid token. Please log in again!');
    }

    // check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error('The user belonging to this token does no longer exist.');
    }

    // check if user changed password after the token was created
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new Error('User recently changed the password.Login again!');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return responseFn(res, 401, 'fail', error.message);
  }
};
