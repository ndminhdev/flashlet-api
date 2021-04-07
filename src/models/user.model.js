import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import HttpError from '../utils/httpError';

import {
  JWT_SECRET,
  RESET_PASSWORD_SECRET,
  SALT_ROUNDS,
} from '../utils/secrets';

const schema = new Schema(
  {
    email: String,
    name: String,
    password: String,

    profileImage: String,
    profileImageDefault: String,

    resetPasswordToken: String,

    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

/**
 * Format json before sending to client
 */
schema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  const { _id, email, name, profileImage, profileImageDefault } = userObj;
  return {
    _id,
    email,
    name,
    profileImage,
    profileImageDefault,
  };
};

/**
 * Hash password before save
 */
schema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    user.password = await bcrypt.hash(user.password, salt);
  }

  next();
});

/**
 * Compare password
 */
schema.methods.comparePassword = async function (candidatePassword) {
  const user = this;
  const matchPassword = await bcrypt.compare(candidatePassword, user.password);
  return matchPassword;
};

/**
 * Check duplicate email
 */
schema.statics.checkDuplicate = async function (email) {
  const user = await User.findOne({ email });
  return !!user;
};

/**
 * Find an user by email and password
 */
schema.statics.findByEmailAndPassword = async function (email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(404, 'No account with this email address', {
      email,
      password,
    });
  }

  const matchPassword = await user.comparePassword(password);

  if (!matchPassword) {
    throw new HttpError(401, 'Password is wrong', { email, password });
  }

  return user;
};

/**
 * Generate auth client token of an user
 */
schema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

/**
 * Generate a reset password token
 */
schema.methods.generateResetPasswordToken = async function () {
  const user = this;
  const token = jwt.sign({ id: user.id }, RESET_PASSWORD_SECRET, {
    expiresIn: '30m',
  });
  user.resetPasswordToken = token;
  await user.save();
  return token;
};

/**
 * Find user by token
 */
schema.statics.findUserByResetToken = async function (token) {
  const decoded = jwt.verify(token, RESET_PASSWORD_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new HttpError(404, 'No account with this email address', { token });
  }

  return user;
};

const User = mongoose.model('User', schema);

export default User;
