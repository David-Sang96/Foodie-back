/* eslint-disable no-undef */ /* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const Recipe = require('../model/recipe');
const responseFn = require('../ultis/responseFn');
const deleteFile = require('../ultis/deleteFile');
const User = require('../model/user');
const emailQueue = require('../queues/emailQueue');

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
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients } = req.body;
    const recipe = await Recipe.create({
      title,
      description,
      ingredients: JSON.parse(ingredients),
      photo: '/' + req.file.filename,
      userId: req.user._id,
    });

    // send mails to all users (marketing email)
    const users = await User.find().select('email');
    const userEmails = users
      .map((user) => user.email)
      .filter((email) => email !== req.user.email);

    // email queue
    const emailData = {
      viewFileName: 'email',
      data: {
        name: req.user.username,
        recipeTitle: title,
      },
      to: userEmails,
      subject: 'New Recipe is created by someone.',
    };

    emailQueue.add(emailData, { attempts: 3, backoff: 5000 });

    return res.status(201).json(recipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return responseFn(res, 400, 'fail', `this ${id} is invalid.`);
    }

    // Find the existing recipe to get the current photo path
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return responseFn(res, 404, 'fail', `This ${id} Id has found no recipe`);
    }

    if (req.user._id.toString() !== recipe.userId.toString()) {
      return responseFn(res, 401, 'fail', "You don't have access.");
    }

    const updatedData = {
      title,
      description,
      ingredients: JSON.parse(ingredients),
      photo: '/' + req.file.filename,
    };

    // Update the recipe document
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, {
      runValidators: true,
      new: true,
    });

    await deleteFile(__dirname + '/../public' + recipe.photo);

    return res.json(updatedRecipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return responseFn(res, 400, 'fail', `this ${id} is invalid.`);
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return responseFn(res, 404, 'fail', `This ${id} Id has found no recipe`);
    }

    if (req.user._id !== recipe.userId) {
      return responseFn(res, 401, 'fail', "You don't have access.");
    }

    await Recipe.findByIdAndDelete(id);

    await deleteFile(__dirname + '/../public' + recipe.photo);

    return res.status(204).json(recipe);
  } catch (error) {
    console.log(error);
    return responseFn(res, 500, 'fail', error.message);
  }
};
