/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const Recipe = require('../model/recipe');
const catchAsync = require('../ultis/catchAsync');
const AppError = require('../ultis/appError');

exports.getRecipes = catchAsync(async (req, res, next) => {
  const recipes = await Recipe.find();

  return res.status(200).json({
    status: 'success',
    results: recipes.length,
    data: {
      recipes,
    },
  });
});

exports.getSingleRecipe = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(`Invalid ID: ${id}`, 404));
  }

  const recipe = await Recipe.findById(id);
  if (!recipe) {
    return next(new AppError(`This ${id} Id has found no recipe`, 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      recipe,
    },
  });
});

exports.createRecipe = catchAsync(async (req, res, next) => {
  const { title, description, ingredients } = req.body;
  const recipe = await Recipe.create({ title, description, ingredients });

  return res.status(201).json({
    status: 'success',
    data: {
      recipe,
    },
  });
});

exports.updateRecipe = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(`Invalid ID: ${id}`, 404));
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
    return next(new AppError(`This ${id} Id has found no recipe`, 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      recipe,
    },
  });
});

exports.deleteRecipe = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(`Invalid ID: ${id}`, 404));
  }

  const recipe = await Recipe.findByIdAndDelete(id);
  if (!recipe) {
    return next(new AppError(`This ${id} Id has found no tour`, 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
