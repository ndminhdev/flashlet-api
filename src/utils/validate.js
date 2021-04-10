import * as Yup from 'yup';

// User schemas
export const createAccountSchema = Yup.object().shape({
  email: Yup.string().email('Invalid user email address').required('Email is required'),
  name: Yup.string().min(6, 'Full name is too short').required('Full name is required'),
  password: Yup.string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gi,
      'Password must contain letters a-z (including upppercase), numbers or special characters.'
    )
    .required('Password is required')
});

export const signInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid user email address').required('Email is required'),
  password: Yup.string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gi,
      'Password must contain letters a-z (including upppercase), numbers or special characters.'
    )
    .required('Password is required')
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid user email address').required('Email is required')
});

export const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gi,
      'Password must contain letters a-z (including upppercase), numbers or special characters.'
    )
    .required('Password is required'),
  password2: Yup.string()
    .test('password-match', 'Passwords do not match', function (value) {
      return value === this.parent.password;
    })
    .required('Please confirm your password')
});

export const changePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gi,
      'Password must contain letters a-z (including upppercase), numbers or special characters.'
    )
    .required('Old password is required'),
  password: Yup.string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gi,
      'Password must contain letters a-z (including upppercase), numbers or special characters.'
    )
    .required('New password is required'),
  password2: Yup.string()
    .test('password-match', 'Passwords do not match', function (value) {
      return value === this.parent.password;
    })
    .required('Please confirm your password')
});

// Set schemas
export const createSetSchema = Yup.object().shape({
  title: Yup.string().min(1, 'Title is required').required('Title is required'),
  description: Yup.string().min(1, 'Description is required').required('Description is required'),
  isPublic: Yup.bool().required('isPublic is required')
});
