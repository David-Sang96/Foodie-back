const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: {
      type: Array,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
      },
    },
    photo: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

recipeSchema.pre(/^find/, function (next) {
  this.select('-__v');
  this.sort('-createdAt');
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
