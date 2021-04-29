import Preference from '../models/preference.model';

/**
 * Get user preferences by userId
 */
export const getPreferences = async (req, resp, next) => {
  try {
    const preference = await Preference.findOne({ userId: req.user._id });

    if (!preference) {
      const newPreference = new Preference({
        userId: req.user._id,
        darkMode: false
      });
      await newPreference.save();
      return resp.status(200).json({
        message: 'Get user preferences',
        data: {
          preferences: newPreference
        }
      });
    }

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
    const preference = await Preference.findOne({ userId: req.user._id });

    if (!preference) {
      const newPreference = new Preference({
        userId: req.user._id,
        darkMode
      });
      await newPreference.save();
      return resp.status(200).json({
        message: 'Get user preferences',
        data: {
          preferences: newPreference
        }
      });
    }

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
