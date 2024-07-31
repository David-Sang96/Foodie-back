const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
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
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
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
    throw new Error('User already exist.');
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

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }).select('-__v +password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Incorrect email or password');
  }
  return user;
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

userSchema.methods.createPasswordResetToken = function () {
  // original token
  const createResetToken = crypto.randomBytes(32).toString('hex');
  // encrypted token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(createResetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return createResetToken;
};

module.exports = mongoose.model('User', userSchema);
