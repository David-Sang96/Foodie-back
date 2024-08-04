/* eslint-disable no-unused-vars */
const cloudinary = require('../ultis/cloudinary');
const responseFn = require('../ultis/responseFn');
const Recipe = require('../model/recipe');

exports.uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return { url: result.secure_url, public_id: result.public_id };
  } catch (err) {
    console.log(err);
    throw new Error('Cloud upload failed.');
  }
};

exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error('Cloud delete failed.');
  }
};
