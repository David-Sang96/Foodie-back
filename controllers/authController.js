/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const User = require('../model/user');
const signJWTToken = require('../ultis/createToken');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.register(name, email, password);
    const token = signJWTToken(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    error.statusCode = 400;
    error.status = 'fail';
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const isEmailExisted = await User.findOne({ email }).select('+password');
  return res.json({ msg: 'user hit login' });
};
