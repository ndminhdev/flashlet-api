import User from '../models/user.model';
import Set from '../models/set.model';
import {
  createAccountSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../utils/validate';
import HttpError from '../utils/httpError';
import grabProfileImage from '../utils/grabProfileImage';
import sendEmailWithSendgrid, { createHTMLTemplate } from '../utils/sendgrid';
import streamUpload from '../utils/uploader';

/**
 * Create account with email, name & password
 */
export const createAccount = async (req, resp, next) => {
  const { email, name, password } = req.body;

  try {
    const { errors, value } = await createAccountSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const existingUser = await User.findOne({ email });

    // there is a google/facebook account with this email
    if (existingUser.googleId || existingUser.facebookId) {
      existingUser.email = email;
      existingUser.name = name;
      existingUser.password = password;
      await existingUser.save();
      return resp.status(200).json({
        message: 'Create a local account with this email',
        data: {
          user: existingUser
        }
      });
    }

    // there is a local account already registered
    if (existingUser) {
      throw new HttpError(409, 'Email already in use', {
        email
      });
    }

    const profileImageDefault = grabProfileImage(email);

    const newUser = new User({
      email,
      name,
      username: email.split('@')[0],
      password,
      profileImageDefault
    });

    await newUser.save();
    resp.status(201).json({
      message: 'Create account with email address successfully',
      data: { user: newUser }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (req, resp, next) => {
  const { email, password } = req.body;

  try {
    const { errors, value } = await signInSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const user = await User.findByEmailAndPassword(email, password);
    const token = await user.generateAuthToken();
    resp.status(200).json({
      message: `Sign in as ${user.email}`,
      data: { user, token }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (req, resp, next) => {
  const { googleId, googleAccessToken, googleProfile } = req.body;

  try {
    const existingUser = await User.findOne({ googleId });

    if (existingUser) {
      existingUser.googleAccessToken = googleAccessToken;
      const token = await existingUser.generateAuthToken();
      await existingUser.save();
      return resp.status(200).json({
        message: 'Sign in with Google',
        data: {
          user: existingUser,
          token
        }
      });
    }

    const newUser = new User({
      email: googleProfile.email,
      name: googleProfile.name,
      username: googleProfile.email.split('@')[0],
      profileImage: googleProfile.imageUrl,
      profileImageDefault: googleProfile.imageUrl,
      googleId,
      googleAccessToken
    });
    const token = await newUser.generateAuthToken();

    await newUser.save();
    resp.status(200).json({
      message: 'Sign in with Google',
      data: {
        user: newUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sign in with Facebook
 */
export const signInWithFacebook = async (req, resp, next) => {
  const { facebookId, facebookAccessToken, facebookProfile } = req.body;

  try {
    const existingUser = await User.findOne({ facebookId });

    if (existingUser) {
      existingUser.facebookAccessToken = facebookAccessToken;
      const token = await existingUser.generateAuthToken();
      await existingUser.save();
      return resp.status(200).json({
        message: 'Sign in with Facebook',
        data: {
          user: existingUser,
          token
        }
      });
    }

    const newUser = new User({
      email: facebookProfile.email,
      name: facebookProfile.name,
      username: facebookProfile.email.split('@')[0],
      profileImage: facebookProfile.imageUrl,
      profileImageDefault: facebookProfile.imageUrl,
      facebookId,
      facebookAccessToken
    });
    const token = await newUser.generateAuthToken();

    await newUser.save();
    resp.status(200).json({
      message: 'Sign in with Facebook',
      data: {
        user: newUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sign out
 */
export const signOut = async (req, resp, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    resp.status(200).json({
      message: 'Signed out'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sign out from all devices
 */
export const signOutAll = async (req, resp, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    resp.status(200).json({
      message: 'Signed out from all devices'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get an user profile
 */
export const getUserProfile = async (req, resp, next) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      throw new HttpError(404, 'Username not found', { username });
    }

    resp.status(200).json({
      message: 'Get user profile',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get public sets of an user with userId
 */
export const getPublicSetsOfAnUser = async (req, resp, next) => {
  const { username } = req.params;
  const { sortBy = 'title', orderBy = 1, limit = 8, page = 1 } = req.query;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      throw new HttpError(404, 'User is not found');
    }

    const agg = await Set.aggregate([
      {
        $match: {
          userId: user._id,
          isPublic: true
        }
      },
      {
        $count: 'setsCount'
      }
    ]);
    const setsCount = agg.length > 0 ? agg[0].setsCount : 0;
    const totalPage =
      setsCount % +limit === 0
        ? Math.floor(setsCount / +limit)
        : Math.floor(setsCount / +limit) + 1;
    const hasNextPage = +page < totalPage;
    const sets = await Set.aggregate([
      {
        $match: {
          userId: user._id,
          isPublic: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'setId',
          as: 'cards'
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          termsCount: { $size: '$cards' },
          previewTerms: { $slice: ['$cards', 4] },
          isPublic: 1,
          user: '$user',
          createdAt: 1
        }
      },
      {
        $project: {
          'user.password': 0,
          'user.tokens': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.__v': 0,
          'previewTerms.setId': 0,
          'previewTerms.__v': 0
        }
      },
      {
        $sort: { [sortBy]: +orderBy }
      },
      {
        $skip: (+page - 1) * +limit
      },
      {
        $limit: +limit
      }
    ]);

    resp.status(200).json({
      message: 'Get my sets',
      data: {
        hasNextPage,
        setsCount,
        sets
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot password with a request
 */
export const forgotPassword = async (req, resp, next) => {
  const { email } = req.body;

  try {
    const { errors, value } = await forgotPasswordSchema.validate(req.body);

    if (errors) {
      throw new HttpError(400, errors[0], value);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new HttpError(404, 'Account with this email address is not registered', { email });
    }

    const token = await user.generateResetPasswordToken();

    const subject = 'Reset your password';
    const text = 'Reset your password';
    const html = createHTMLTemplate(
      'Click the link below to start resetting your password',
      'RESET PASSWORD',
      `http://localhost:3000/v1/users/reset?token=${token}`
    );
    // Send email goes here
    await sendEmailWithSendgrid(user.email, subject, text, html);

    resp.status(200).json({
      message: 'Check your mailbox and following the steps to recover your account',
      data: { token }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req, resp, next) => {
  const { token } = req.query;

  try {
    const { errors, value } = await resetPasswordSchema.validate(req.body);

    if (errors) {
      throw new HttpError(400, errors[0], value);
    }

    const user = await User.findUserByResetToken(token);
    user.password = req.body.password;
    await user.save();
    resp.status(200).json({
      message: 'Your password has been reset'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change password
 */
export const changePassword = async (req, resp, next) => {
  const { oldPassword, password } = req.body;

  try {
    const { errors, value } = await changePasswordSchema.validate(req.body);

    if (errors) {
      throw new HttpError(400, errors[0], value);
    }

    const matchPassword = await req.user.comparePassword(oldPassword);

    if (!matchPassword) {
      throw new HttpError(401, 'Old password is wrong', req.body);
    }

    req.user.password = password;
    await req.user.save();
    resp.status(200).json({
      message: 'Password has been changed'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user profile
 */
export const changeProfile = async (req, resp, next) => {
  const validTextFields = ['email', 'name'];
  const fields = Object.keys(req.body);
  const updateFields = fields.filter((f) => validTextFields.includes(f));

  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      throw new HttpError(409, 'Email already in use', {
        email: req.body.email
      });
    }

    // Upload text fields
    updateFields.forEach((field) => {
      req.user[field] = req.body[field];
    });

    // Upload profile image
    if (req.file) {
      const file = await streamUpload(req);
      req.user.profileImage = file.secure_url;
    }

    await req.user.save();

    resp.status(200).json({
      message: 'Your profile has been saved',
      data: {
        user: req.user
      }
    });
  } catch (err) {
    next(err);
  }
};

export const removeAccount = async (req, resp, next) => {
  try {
    await req.user.remove();
    resp.status(200).json({
      message: 'Your account has been removed. You can not undo this action.'
    });
  } catch (err) {
    next(err);
  }
};
