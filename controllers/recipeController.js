const mongoose = require('mongoose');

const Recipe = require('../model/recipe');
const FavoriteRecipe = require('../model/favoriteRecipe');
const responseFn = require('../ultis/responseFn');
const User = require('../model/user');
const emailQueue = require('../queues/emailQueue');
const { uploadImage, deleteImage } = require('./uploadController');

exports.getRecipes = async (req, res, next) => {
  try {
    if (req.query.page < 0) return;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const recipes = await Recipe.find()
      .populate('userId', 'photo')
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
    error.statusCode = 500;
    next(error);
  }
};

exports.getCurrentUserRecipes = async (req, res, next) => {
  try {
    if (req.query.page < 0) return;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const recipes = await Recipe.find({ userId: req.user._id })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalRecipes = await Recipe.find({
      userId: req.user._id,
    }).countDocuments();
    const totalPages = Math.ceil(totalRecipes / limit);
    return res.json({
      recipes,
      totalRecipes,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    error.statusCode = 500;
    next(error);
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
    error.statusCode = 500;
    next(error);
  }
};

exports.createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients } = req.body;

    // Upload the image to Cloudinary
    const { url, public_id } = await uploadImage(req.file.path);

    // Create the new recipe with the photo URL
    const newRecipe = await Recipe.create({
      title,
      description,
      ingredients: JSON.parse(ingredients),
      photo: url,
      userId: req.user._id,
      public_id,
      username: req.user.username,
    });

    // send mails to all users (marketing email)
    const users = await User.find().select('email');
    const userEmails = users
      .map((user) => user.email)
      .filter((email) => email !== req.user.email);

    // email queue
    if (userEmails.length > 0) {
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
    } else {
      console.log('No other users to send the email to.');
    }

    return res.status(201).json(newRecipe);
  } catch (error) {
    console.log(error);
    error.statusCode = 500;
    next(error);
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return responseFn(res, 400, 'fail', `this ${id} is invalid.`);
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return responseFn(res, 404, 'fail', `This ${id} Id has found no recipe`);
    }

    if (!req.user || req.user._id.toString() !== recipe.userId.toString()) {
      return responseFn(res, 401, 'fail', "You don't have access.");
    }

    if (recipe.public_id) {
      await deleteImage(recipe.public_id);
    }

    // Upload the image to Cloudinary
    const { url, public_id } = await uploadImage(req.file.path);

    const updatedData = {
      title,
      description,
      ingredients: JSON.parse(ingredients),
      photo: url,
      public_id,
    };

    // Update the recipe document
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, {
      runValidators: true,
      new: true,
    });

    return res.json(updatedRecipe);
  } catch (error) {
    console.log(error);
    error.statusCode = 500;
    next(error);
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

    if (!req.user || req.user._id.toString() !== recipe.userId.toString()) {
      return responseFn(res, 401, 'fail', "You don't have access.");
    }

    await deleteImage(recipe.public_id);

    await Recipe.findByIdAndDelete(recipe._id);

    await FavoriteRecipe.deleteMany({ recipeId: recipe._id });

    return res.status(204).json(recipe);
  } catch (error) {
    console.log(error);
    error.statusCode = 500;
    next(error);
  }
};

exports.filterRecipes = async (req, res, next) => {
  try {
    const { searchKey } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    if (!searchKey) {
      return responseFn(res, 400, 'fail', 'This filter is invalid.');
    }

    const recipes = await Recipe.find({
      $or: [
        { title: { $regex: searchKey, $options: 'i' } },
        { description: { $regex: searchKey, $options: 'i' } },
      ],
    })
      .populate('userId', 'photo')
      .skip((page - 1) * limit)
      .limit(limit);

    if (!recipes || recipes.length === 0) {
      return responseFn(res, 404, 'fail', 'No recipe found.');
    }

    const totalRecipes = await Recipe.find({
      $or: [
        { title: { $regex: searchKey, $options: 'i' } },
        { description: { $regex: searchKey, $options: 'i' } },
      ],
    }).countDocuments();

    const totalPages = Math.ceil(totalRecipes / limit);

    return res.json({ recipes, totalPages });
  } catch (error) {
    console.log(error);
    error.statusCode = 500;
    next(error);
  }
};
