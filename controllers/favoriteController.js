/* eslint-disable no-unused-vars */

const FavoriteRecipe = require('../model/favoriteRecipe');
const Recipe = require('../model/recipe');
const responseFn = require('../ultis/responseFn');

exports.getAllFavoriteRecipes = async (req, res, next) => {
  try {
    if (req.query.page < 0) return;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const userId = req.user._id.toString();
    const favoriteRecipes = await FavoriteRecipe.find({ userId }).select(
      'recipeId'
    );

    const recipeIds = favoriteRecipes.map((fav) => fav.recipeId);
    const recipes = await Recipe.find({ _id: { $in: recipeIds } })
      .populate('userId', 'photo')
      .skip((page - 1) * limit)
      .limit(limit);

    const totalFavoriteRecipes = await Recipe.find({
      _id: { $in: recipeIds },
    }).countDocuments();
    const totalPages = Math.ceil(totalFavoriteRecipes / limit);

    return res.json({
      recipes,
      totalFavoriteRecipes,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.addToFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user._id;

    const isOwnRecipe = await Recipe.findOne({
      userId,
      _id: recipeId,
    });
    if (isOwnRecipe) {
      return responseFn(res, 400, 'fail', "Can't add own recipe");
    }

    const isExisted = await FavoriteRecipe.findOne({
      recipeId,
      userId,
    });

    if (isExisted) {
      return responseFn(res, 400, 'fail', 'Already added to favorite');
    }

    const favoriteRecipe = await FavoriteRecipe.create({ userId, recipeId });

    return res.status(201).json(favoriteRecipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const recipe = await FavoriteRecipe.findOneAndDelete({
      recipeId: req.params.id,
      userId: req.user._id,
    });

    return res.status(204).json(recipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', error.message);
  }
};
