const fs = require('fs/promises');

const deleteFile = async (path) => {
  try {
    await fs.access(path);
    await fs.unlink(path);
    console.log(`Deleted file at path: ${path}`);
  } catch (error) {
    console.log(`Error accessing or deleting file at path: ${path}`);
    console.log(error);
  }
};

module.exports = deleteFile;
