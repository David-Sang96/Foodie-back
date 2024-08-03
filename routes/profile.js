const { body } = require('express-validator');
const express = require('express');
const router = express.Router();

const {
  getUserData,
  updateUser,
  deleteUser,
} = require('../controllers/profileController');
const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');
const uploadFile = require('../ultis/upload');
const multer = require('multer');

const validationProfile = [
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
];

router.get('/', getUserData);

router.patch(
  '/',
  (req, res, next) => {
    uploadFile(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          status: 'fail',
          message: { msg: err.message, path: 'photo' },
        });
      } else if (err) {
        return res.status(400).json({
          status: 'fail',
          message: { msg: err.message, path: 'photo' },
        });
      }
      next();
    });
  },
  validationProfile,
  handleValidatorErrMsg,
  updateUser
);

router.delete('/', deleteUser);

module.exports = router;
