const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const handleValidatorErrMsg = require('../middlewares/handleValidatorMsg');

const {
  getRecipes,
  getSingleRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');
const protect = require('../middlewares/protect');

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
  .get(protect, getRecipes)
  .post(protect, validateCreateRecipe, handleValidatorErrMsg, createRecipe);
router
  .route('/:id')
  .get(getSingleRecipe)
  .patch(protect, validateCreateRecipe, handleValidatorErrMsg, updateRecipe)
  .delete(protect, deleteRecipe);

module.exports = router;
