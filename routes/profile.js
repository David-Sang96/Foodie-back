const { body } = require('express-validator');
const express = require('express');
const router = express.Router();

const {
  getUserData,
  updateUser,
  deleteUser,
} = require('../controllers/profileController');
const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');

router.get('/', getUserData);

router.patch(
  '/',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('UserName is required')
      .isLength({ min: 4 })
      .withMessage('UserName must be at least 4 characters long'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .isAlphanumeric()
      .withMessage('Password must be contains only letters and numbers.'),
  ],
  handleValidatorErrMsg,
  updateUser
);

router.delete(
  '/',
  [
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .isAlphanumeric()
      .withMessage('Password must be contains only letters and numbers.'),
    handleValidatorErrMsg,
  ],
  deleteUser
);

module.exports = router;
