/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const responseFn = require('../ultis/responseFn');
const Recipe = require('../model/recipe');

exports.recipeUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return responseFn(res, 400, 'fail', `this ${id} is invalid.`);
    }

    const recipe = await recipe.findById(id);
    if (!recipe) {
      return responseFn(res, 404, 'fail', `This ${id} Id has found no recipe`);
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      {
        photo: '/' + req.file.filename,
      },
      { new: true }
    );
    return responseFn(res, 201, 'success', 'Image uploaded', updatedRecipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', error.message);
  }
};
