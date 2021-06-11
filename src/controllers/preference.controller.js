import Preference from '../models/preference.model';
// import redisClient from '../services/redis';

/**
 * Get user preferences by userId
 */
export const getPreferences = async (req, resp, next) => {
  try {
    // const cachedPreference = await redisClient.getAsync('preference');

    // if (cachedPreference) {
    //   return resp.status(200).json({
    //     message: 'Get user preferences',
    //     data: {
    //       preferences: JSON.parse(cachedPreference)
    //     }
    //   });
    // }

    const preference = await Preference.findOne({ userId: req.user._id });

    if (!preference) {
      const newPreference = new Preference({
        userId: req.user._id,
        darkMode: false
      });
      await newPreference.save();
      // redisClient.setAsync('preference', JSON.stringify(newPreference));

      return resp.status(200).json({
        message: 'Get user preferences',
        data: {
          preferences: newPreference
        }
      });
    }

    // redisClient.setAsync('preference', JSON.stringify(preference));

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
