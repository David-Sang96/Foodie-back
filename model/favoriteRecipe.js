const mongoose = require('mongoose');

const favoriteRecipeScheme = new mongoose.Schema(
  {
    userId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FavoriteRecipe', favoriteRecipeScheme);
