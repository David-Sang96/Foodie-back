const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.statics.register = async function (name, email, password) {
  const existedUser = await this.findOne({ email });
  if (existedUser) {
    throw new Error('user already exist.');
  }
  const user = await this.create({ name, email, password });
  user.password = undefined;

  return user;
};

module.exports = mongoose.model('User', userSchema);
