const { body } = require('express-validator');
const express = require('express');
const router = express.Router();
const multer = require('multer');

const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');
const uploadFile = require('../ultis/upload');
const { recipeUpload } = require('../controllers/uploadController');

router.post(
  '/:id/upload',
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
  [
    body('photo').custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Photo is required');
      }
      return true;
    }),
  ],
  handleValidatorErrMsg,
  recipeUpload
);

module.exports = router;
