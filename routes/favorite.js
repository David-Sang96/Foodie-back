const express = require('express');
const router = express.Router();

const {
  addToFavorite,
  getAllFavoriteRecipes,
  deleteFavorite,
} = require('../controllers/favoriteRecipe');

router.post('/', addToFavorite);

router.get('/', getAllFavoriteRecipes);

router.delete('/:id', deleteFavorite);

module.exports = router;
