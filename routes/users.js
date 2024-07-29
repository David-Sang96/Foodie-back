const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');
const User = require('../model/user');
const {
  login,
  register,
  logout,
  authUser,
} = require('../controllers/authController');
const protect = require('../middlewares/protect');

router.post(
  '/register',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('UserName is required')
      .isLength({ min: 4 })
      .withMessage('UserName must be at least 4 characters long'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address')
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error('E-mail already in use');
        }
      }),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .isAlphanumeric()
      .withMessage('Password must be contains only letters and numbers.'),
    body('passwordConfirmation')
      .trim()
      .notEmpty()
      .withMessage('PasswordConfirmation is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords don't match");
        }
        return true;
      }),
  ],
  handleValidatorErrMsg,
  register
);

router.post(
  '/log-in',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('E-mail is required')
      .isEmail()
      .withMessage('Invalid e-mail address'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .isAlphanumeric()
      .withMessage('Password must be contains only letters and numbers.'),
  ],
  handleValidatorErrMsg,
  login
);

router.post('/log-out', logout);
router.get('/is-auth', protect, authUser);

module.exports = router;
