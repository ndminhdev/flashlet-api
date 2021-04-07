import User from '../models/user.model';
import {
  createAccountSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../utils/validate';
import HttpError from '../utils/httpError';
import grabProfileImage from '../utils/grabProfileImage';
import sendEmailWithSendgrid, { createHTMLTemplate } from '../utils/sendgrid';
import streamUpload from '../utils/uploader';

/**
 * Create account with email, name & password
 */
export const createAccount = async (req, resp, next) => {
  try {
    const { errors, value } = await createAccountSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const isDuplicate = await User.checkDuplicate(req.body.email);

    if (isDuplicate) {
      throw new HttpError(409, 'Email already in use', {
        email: req.body.email,
      });
    }

    const profileImageDefault = grabProfileImage(req.body.email);

    const newUser = new User({ ...req.body, profileImageDefault });

    await newUser.save();
    resp.status(201).json({
      message: 'Create account with email address successfully',
      data: { user: newUser },
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
      data: { user, token },
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
      throw new HttpError(
        404,
        'Account with this email address is not registered',
        { email }
      );
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
      message:
        'Check your mailbox and following the steps to recover your account',
      data: { token },
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
      message: 'Your password has been reset',
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
      message: 'Password has been changed',
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
    const isDuplicate = await User.checkDuplicate(req.body.email);

    if (isDuplicate) {
      throw new HttpError(409, 'Email already in use', {
        email: req.body.email,
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
    await User.deleteOne({ id: req.user.id });
    resp.status(200).json({
      message: 'Your account has been removed. You can not undo this action.',
    });
  } catch (err) {
    next(err);
  }
};
