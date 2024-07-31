/* eslint-disable no-undef */
const crypto = require('crypto');

const User = require('../model/user');
const createSendToken = require('../ultis/createSendToken');
const responseFn = require('../ultis/responseFn');
const sendEmail = require('../ultis/sendEmail');
const emailQueue = require('../queues/emailQueue');

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
    const emailData = {
      viewFileName: 'welcomeUser',
      data: {
        name: username,
      },
      to: email,
      subject: 'Welcome From My Application.',
    };

    emailQueue.add(emailData, { attempts: 3, backoff: 5000 });

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
  return res.json(req.user);
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
        data: { resetURL: resetPasswordURL },
        to: email,
        subject: 'Your password reset token (valid for 10min)',
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
