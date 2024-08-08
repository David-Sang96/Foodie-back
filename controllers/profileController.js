/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt');

const User = require('../model/user');
const FavoriteRecipe = require('../model/favoriteRecipe');
const Recipe = require('../model/recipe');
const responseFn = require('../ultis/responseFn');
const emailQueue = require('../queues/emailQueue');
const {
  uploadImage,
  deleteImage,
  deleteImages,
} = require('./uploadController');

exports.getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return res.json({
      status: 'success',
      user,
    });
  } catch (error) {
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return responseFn(
        res,
        404,
        'fail',
        `This ${req.user._id} Id has found no user.`
      );
    }
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({
        status: 'fail',
        message: { msg: 'Incorrect password', path: 'password' },
      });
    }

    const updatedData = {
      username: req.body.username,
    };

    // If a new file is uploaded, delete the old image and upload the new one else create new image
    if (req.file) {
      // Delete user's profile previous image from Cloudinary
      if (user.public_id) {
        await deleteImage(user.public_id);
      }

      const { url, public_id } = await uploadImage(req.file.path);
      updatedData.photo = url;
      updatedData.public_id = public_id;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      {
        runValidators: true,
        new: true,
      }
    ).select('-__v');

    updatedUser.password = undefined;
    updatedUser.passwordResetToken = undefined;
    updatedUser.passwordResetTokenExpires = undefined;
    updatedUser.public_id = undefined;

    // email queue
    const emailData = {
      viewFileName: 'updateProfile',
      data: {
        name: user.username,
      },
      to: user.email,
      subject: 'Profile has been updated.',
    };

    emailQueue.add(emailData, { attempts: 3, backoff: 5000 });

    return responseFn(
      res,
      201,
      'success',
      'Your profile is updated successfully.',
      updatedUser
    );
  } catch (error) {
    return responseFn(res, 500, 'fail', error.message);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return responseFn(
        res,
        404,
        'fail',
        `This ${req.user._id} Id has found no user.`
      );
    }
    // Delete user's profile image from Cloudinary
    if (user.public_id) {
      await deleteImage(user.public_id);
    }

    // Get the public_id of all recipes created by the user
    const userCreatedRecipes = await Recipe.find({ userId: user._id }).select(
      'public_id'
    );

    // Extract public_ids from the user's recipes
    const publicIds = userCreatedRecipes.map((recipe) => recipe.public_id);

    // Delete all images of recipes created by the user from Cloudinary
    if (publicIds.length > 0) {
      await deleteImages(publicIds);
    }

    // Delete user
    await User.findByIdAndDelete(user._id);

    // Get all the recipe IDs created by the user
    const recipeDocuments = await Recipe.find({ userId: user._id }).select(
      '_id'
    );
    const recipeIds = recipeDocuments.map((recipe) => recipe._id);

    // $in: A MongoDB query operator that matches any of the values specified in an array
    // await User.find({name : {$in : ["david","peter"]}}) -> return all documents that match david peter in name field
    // await User.find({name : {$nin : ["david","peter"]}}) -> return all documents that don't match david peter in name field
    await FavoriteRecipe.deleteMany({ recipeId: { $in: recipeIds } });

    await FavoriteRecipe.deleteMany({ userId: user._id });

    await Recipe.deleteMany({ userId: user._id });

    return res.status(204).json(user);
  } catch (error) {
    return responseFn(res, 500, 'fail', error.message);
  }
};
