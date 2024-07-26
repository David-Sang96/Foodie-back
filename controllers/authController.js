const User = require('../model/user');
const signJWTToken = require('../ultis/createToken');

exports.register = async (req, res, next) => {
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
    error.statusCode = 400;
    error.status = 'fail';
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('-__v');

    if (!user || !(await user.comparePassword(password, user.password))) {
      throw new Error('Incorrect email or password');
    }

    const token = signJWTToken(user);
    return res.json({ user, token });
  } catch (error) {
    error.statusCode = 400;
    error.status = 'fail';
    next(error);
  }
};
