const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
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
      minLength: 8,
    },
    passwordConfirmation: {
      type: String,
      required: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmation = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.statics.register = async function (
  username,
  email,
  password,
  passwordConfirmation
) {
  const existedUser = await this.findOne({ email });
  if (existedUser) {
    throw new Error('user already exist.');
  }
  const user = await this.create({
    username,
    email,
    password,
    passwordConfirmation,
  });
  user.password = undefined;

  return user;
};

userSchema.methods.comparePassword = async function (
  logInPassword,
  registerPassword
) {
  return await bcrypt.compare(logInPassword, registerPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChangeTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
