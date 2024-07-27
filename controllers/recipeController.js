/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const Recipe = require('../model/recipe');
const responseFn = require('../ultis/responseFn');

exports.getRecipes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;

    const recipes = await Recipe.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalRecipes = await Recipe.countDocuments();
    const totalPages = Math.ceil(totalRecipes / limit);
    return res.json({
      recipes,
      totalRecipes,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', 'internet server error');
  }
};

exports.getSingleRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return responseFn(res, 400, 'fail', `this ${id} is invalid.`);
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return responseFn(res, 404, 'fail', `This ${id} Id has found no recipe`);
    }
    return res.json(recipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', 'internet server error');
  }
};

exports.createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients } = req.body;
    const recipe = await Recipe.create({ title, description, ingredients });
    return res.status(201).json(recipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', 'internet server error');
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return responseFn(res, 400, 'fail', `this ${id} is invalid.`);
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!recipe) {
      return responseFn(res, 404, 'fail', `This ${id} Id has found no recipe`);
    }
    return res.json(recipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', 'internet server error');
  }
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return responseFn(res, 400, 'fail', `this ${id} is invalid.`);
    }

    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      return responseFn(res, 404, 'fail', `This ${id} Id has found no recipe`);
    }
    return res.status(204).json(recipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', 'internet server error');
  }
};
