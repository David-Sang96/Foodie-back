const cloudinary = require('../ultis/cloudinary');

exports.uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return { url: result.secure_url, public_id: result.public_id };
  } catch (err) {
    console.error(err);
    throw new Error('Cloud upload failed.');
  }
};

exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Cloud delete failed.');
  }
};

exports.deleteImages = async (publicIds) => {
  try {
    // Create an array of promises for deleting each image
    const deletePromises = publicIds.map((publicId) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        });
      });
    });

    // Wait for all deletion promises to resolve
    const results = await Promise.all(deletePromises);
    console.log('All images deleted successfully:', results);
    return results;
  } catch (error) {
    console.error('Error deleting images:', error);
    throw new Error('Cloud delete failed.');
  }
};
