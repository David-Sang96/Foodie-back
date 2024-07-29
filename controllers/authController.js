const User = require('../model/user');
const signJWTToken = require('../ultis/createToken');
const responseFn = require('../ultis/responseFn');

exports.register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirmation } = req.body;
    const user = await User.register(
      username,
      email,
      password,
      passwordConfirmation
    );
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
    return responseFn(res, 400, 'fail', error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.login(email, password);
    user.password = undefined;
    const token = signJWTToken(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    return res.json({ user, token });
  } catch (error) {
    return responseFn(res, 400, 'fail', error.message);
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  return responseFn(res, 200, 'success', 'user logged out.');
};

exports.authUser = (req, res) => {
  return res.json(req.user);
};
