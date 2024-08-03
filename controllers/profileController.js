/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../model/user');
const responseFn = require('../ultis/responseFn');
const emailQueue = require('../queues/emailQueue');
const deleteFile = require('../ultis/deleteFile');

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
      return res.status(400).json({
        status: 'fail',
        message: { msg: 'Incorrect password', path: 'password' },
      });
    }

    // email queue
    const emailData = {
      viewFileName: 'updateProfile',
      data: {
        name: user.username,
      },
      to: user.email,
      subject: 'Profile has been updated.',
    };

    emailQueue.add(emailData, { attempts: 3, backoff: 5000 });

    const updatedData = {
      username: req.body.username,
    };

    if (req.file) updatedData.photo = '/' + req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      {
        runValidators: true,
        new: true,
      }
    );

    user.password = undefined;

    if (req.file) {
      await deleteFile(__dirname + '/../public' + user.photo);
    }

    return responseFn(
      res,
      201,
      'success',
      'Your profile is updated successfully.',
      updatedUser
    );
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

    await User.findByIdAndDelete(req.user._id);

    await deleteFile(__dirname + '/../public' + user.photo);

    return res.status(204).json(user);
  } catch (error) {
    return responseFn(res, 500, 'fail', error.message);
  }
};
