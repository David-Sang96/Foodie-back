/* eslint-disable no-undef */
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const User = require('../model/user');
const createSendToken = require('../ultis/createSendToken');
const responseFn = require('../ultis/responseFn');
const sendEmail = require('../ultis/sendEmail');

exports.register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirmation } = req.body;
    const user = await User.register(
      username,
      email,
      password,
      passwordConfirmation
    );

    // email queue
    await sendEmail({
      viewFileName: 'welcomeUser',
      data: {
        name: username,
      },
      to: email,
      subject: 'Welcome From My Foodie Application.',
    });

    createSendToken(res, user, 201);
  } catch (error) {
    return responseFn(res, 400, 'fail', error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.login(email, password);
    createSendToken(res, user, 200);
  } catch (error) {
    return responseFn(res, 400, 'fail', error.message);
  }
};

exports.logout = (req, res) => {
  try {
    res.cookie('jwt', 'logged out', { maxAge: 5000 });
    return responseFn(res, 200, 'success', 'user logged out.');
  } catch (error) {
    return responseFn(res, 400, 'fail', error.message);
  }
};

exports.authUser = (req, res) => {
  const user = {};
  user.createdAt = req.user.createdAt;
  user.email = req.user.email;
  user.photo = req.user.photo;
  user.updatedAt = req.user.updatedAt;
  user.username = req.user.username;
  user._id = req.user._id;

  return res.json(user);
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return responseFn(
        res,
        404,
        'fail',
        'There is no user with this email address.'
      );
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send it to user's email
    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        viewFileName: 'resetEmail',
        data: { resetURL: resetPasswordURL, name: user.username },
        to: email,
        subject: 'Your password reset token ',
      });

      return responseFn(res, 200, 'success', 'Token sent to email!');
    } catch (error) {
      console.log(error);
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return responseFn(res, 500, 'fail', error.message);
    }
  } catch (error) {
    console.log(error);
    return responseFn(res, 400, 'fail', error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Reset Token is invalid or has expired');
    }

    // email queue
    await sendEmail({
      viewFileName: 'passwordUpdate',
      data: {
        name: user.username,
      },
      to: user.email,
      subject: 'Password Reset Success.',
    });

    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    createSendToken(res, user, 200);
  } catch (error) {
    console.log(error);
    return responseFn(res, 400, 'fail', error.message);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password, newPassword, passwordConfirmation } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: { msg: 'Your current password is wrong.', path: 'password' },
      });
    }

    // email queue
    await sendEmail({
      viewFileName: 'passwordUpdate',
      data: {
        name: user.username,
      },
      to: user.email,
      subject: 'Password Update Success.',
    });

    user.password = newPassword;
    user.passwordConfirmation = passwordConfirmation;
    await user.save();

    user.password = undefined;

    // 4) log user in, send JWT
    createSendToken(res, user, 200);
  } catch (error) {
    console.log(error);
    return responseFn(res, 400, 'fail', error.message);
  }
};
