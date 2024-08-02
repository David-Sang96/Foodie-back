/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../model/user');
const responseFn = require('../ultis/responseFn');

exports.getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return res.json({
      status: 'success',
      user,
    });
  } catch (error) {
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return responseFn(
        res,
        404,
        'fail',
        `This ${req.user._id} Id has found no user.`
      );
    }
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error('Incorrect password');
    }

    user.username = req.body.username;
    await user.save({ validateBeforeSave: false });
    user.password = undefined;

    return responseFn(res, 201, 'success', 'Your name is updated', user);
  } catch (error) {
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return responseFn(
        res,
        404,
        'fail',
        `This ${req.user._id} Id has found no user.`
      );
    }
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error('Incorrect password');
    }

    await User.findByIdAndDelete(req.user._id);
    return res.status(204).json(user);
  } catch (error) {
    return responseFn(res, 500, 'fail', error.message);
  }
};
