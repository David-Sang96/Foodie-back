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

const validateCreateRecipe = [
  body('title')
    .notEmpty()
    .withMessage('Recipe must have a name.')
    .trim()
    .isLength({ min: 5, max: 40 })
    .withMessage('A recipe must have more than 5 and less than 40 characters.'),
  body('description')
    .notEmpty()
    .withMessage('Recipe must have a description.')
    .trim(),
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
  .patch(updateRecipe)
  .delete(deleteRecipe);

module.exports = router;
