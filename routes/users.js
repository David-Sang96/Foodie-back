const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');
const User = require('../model/user');
const { login, signup } = require('../controllers/authController');

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
      .isAlphanumeric()
      .withMessage('Password must be valid.'),
  ],
  handleValidatorErrMsg,
  login
);
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters long'),
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
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .isAlphanumeric()
      .withMessage(
        'Password must be at least 6 characters long and contains only letters and numbers.'
      ),
    // .matches(/^[\w!@#$%^&*()\-_=+]+$/)
    //.withMessage('Password can contain letters, numbers, and special characters.'),
  ],
  handleValidatorErrMsg,
  signup
);

module.exports = router;
