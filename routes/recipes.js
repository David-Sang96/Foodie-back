const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');

const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');
const uploadFile = require('../ultis/upload');

const {
  getRecipes,
  getSingleRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  upload,
} = require('../controllers/recipeController');

const validateCreateRecipe = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Recipe must have a name.')
    .isLength({ min: 5, max: 40 })
    .withMessage('A recipe must have more than 5 and less than 40 characters.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Recipe must have a description.'),
  body('ingredients')
    .isArray({ min: 3 })
    .withMessage('A recipe must have at least three ingredients.'),
];

router
  .route('/')
  .get(getRecipes)
  .post(validateCreateRecipe, handleValidatorErrMsg, createRecipe);

router
  .route('/:id')
  .get(getSingleRecipe)
  .patch(validateCreateRecipe, handleValidatorErrMsg, updateRecipe)
  .delete(deleteRecipe);

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
        return res.status(500).json({
          status: 'fail',
          message: { msg: 'Internal server error' },
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
  upload
);

module.exports = router;
