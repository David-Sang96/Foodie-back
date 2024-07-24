/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const Recipe = require('../model/recipe');

exports.getRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find();
    return res.json(recipes);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'internet server error' });
  }
};

exports.getSingleRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: `this ${id} is invalid.` });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ msg: `This ${id} Id has found no recipe` });
    }
    return res.json(recipe);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'internet server error' });
  }
};

exports.createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients } = req.body;
    const recipe = await Recipe.create({ title, description, ingredients });
    return res.status(201).json(recipe);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'internet server error' });
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: `this ${id} is invalid.` });
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
      return res.status(404).json({ msg: `This ${id} Id has found no recipe` });
    }
    return res.json(recipe);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'internet server error' });
  }
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: `this ${id} is invalid.` });
    }

    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      return res.status(404).json({ msg: `This ${id} Id has found no recipe` });
    }
    return res.status(204).json(recipe);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'internet server error' });
  }
};
