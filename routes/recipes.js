/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const multer = require('multer');

const {
  getRecipes,
  getSingleRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  filterRecipes,
} = require('../controllers/recipeController');
const uploadFile = require('../ultis/upload');
const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');

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
  body('photo').custom((value, { req }) => {
    if (!req.file) {
      throw new Error('Photo is required');
    }
    return true;
  }),
  body('ingredients').custom((value) => {
    try {
      const parsedIngredients = JSON.parse(value);
      if (!Array.isArray(parsedIngredients) || parsedIngredients.length < 3) {
        throw new Error('A recipe must have at least three ingredients.');
      }
      return true;
    } catch (e) {
      throw new Error(
        'Ingredients must be an array with at least three items.'
      );
    }
  }),
];

const validateSearchKey = [
  query('searchKey')
    .trim()
    .escape() //Sanitizes the input by converting special characters to their HTML entities. This helps prevent injection attacks.
    .notEmpty()
    .withMessage('searchKey cannot be empty.'),
  handleValidatorErrMsg,
];

router
  .route('/')
  .get(getRecipes)
  .post(
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
    validateCreateRecipe,
    handleValidatorErrMsg,
    createRecipe
  );

router.route('/filter').get(validateSearchKey, filterRecipes);

router
  .route('/:id')
  .get(getSingleRecipe)
  .patch(
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
    validateCreateRecipe,
    handleValidatorErrMsg,
    updateRecipe
  )
  .delete(deleteRecipe);

module.exports = router;
