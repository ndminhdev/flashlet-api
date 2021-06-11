import Preference from '../models/preference.model';
import { clearCache } from '../services/cache';

/**
 * Get user preferences by userId
 */
export const getPreferences = async (req, resp, next) => {
  try {
    const preference = await Preference.findOne({ userId: req.user._id }).cache({
      key: req.user.username,
      field: 'preferences'
    });

    resp.status(200).json({
      message: 'Get user preferences',
      data: {
        preferences: preference
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change preferences
 */
export const changePreferences = async (req, resp, next) => {
  const { darkMode } = req.body;

  try {
    // clear cache
    clearCache({ key: req.user.username, fields: ['preferences'] });
    const preference = await Preference.findOne({ userId: req.user._id });

    preference.darkMode = darkMode;
    await preference.save();

    resp.status(200).json({
      message: 'Your preferences saved',
      data: {
        preferences: preference
      }
    });
  } catch (err) {
    next(err);
  }
};
